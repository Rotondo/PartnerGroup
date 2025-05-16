import React, { useState, useEffect, useCallback } from "react"; // Adicionado useEffect, useCallback
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import StatCard from "@/components/ui/dashboard/StatCard";
import {
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, AlertTriangle } from "lucide-react"; // Adicionado Loader2, AlertTriangle
// import { externalPartners, mockOpportunities } from "@/data/mockData"; // Removido mockData
import { supabase } from "@/integrations/supabase/client"; // Adicionado supabase
import { Oportunidade, ParceiroExterno, EmpresaGrupo } from "@/types"; // Adicionado tipos
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// const groupCompanies = ["Cryah", "Lomadee", "Monitfy", "B8one", "SAIO"]; // Será buscado do Supabase
const COLORS = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"]; // Mantido para gráficos se necessário

const Partners = () => {
  const [period, setPeriod] = useState("all_time"); // Ajustado período padrão
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [externalPartners, setExternalPartners] = useState<ParceiroExterno[]>([]);
  const [groupCompanies, setGroupCompanies] = useState<EmpresaGrupo[]>([]);
  const [opportunities, setOpportunities] = useState<Oportunidade[]>([]);

  // Dados calculados
  const [partnerBalance, setPartnerBalance] = useState<any[]>([]);
  const [monthlyBalanceData, setMonthlyBalanceData] = useState<any[]>([]);
  const [partnerToGroupMatrix, setPartnerToGroupMatrix] = useState<any[]>([]);
  const [groupToPartnerMatrix, setGroupToPartnerMatrix] = useState<any[]>([]);
  const [groupTotalBalance, setGroupTotalBalance] = useState<any>({ received: 0, sent: 0, balance: 0, percentBalance: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: partnersData, error: partnersError } = await supabase
        .from("parceiros_externos")
        .select("*");
      if (partnersError) throw partnersError;
      setExternalPartners(partnersData || []);

      const { data: companiesData, error: companiesError } = await supabase
        .from("empresas_grupo")
        .select("*");
      if (companiesError) throw companiesError;
      setGroupCompanies(companiesData || []);

      // TODO: Adicionar filtro de período na query de oportunidades
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from("oportunidades")
        .select(`
          *,
          empresas_grupo_origem:empresa_origem_id (id, nome),
          empresas_grupo_destino:empresa_destino_id (id, nome),
          parceiros_externos:parceiro_externo_id (id, nome),
          oportunidade_parceiro_saida:oportunidade_parceiro_saida(*, parceiros_externos:parceiro_externo_id(id, nome))
        `);
      if (opportunitiesError) throw opportunitiesError;
      setOpportunities(opportunitiesData || []);

    } catch (err: any) {
      console.error("Erro ao buscar dados para Parceiros:", err);
      setError("Falha ao carregar dados dos parceiros. Tente novamente mais tarde.");
      toast.error("Falha ao carregar dados dos parceiros.");
    } finally {
      setLoading(false);
    }
  }, [period]); // Adicionar `period` como dependência quando o filtro for implementado

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efeito para recalcular dados derivados quando `opportunities`, `externalPartners` ou `groupCompanies` mudam
  useEffect(() => {
    if (!opportunities.length || !externalPartners.length || !groupCompanies.length) {
        // Reseta os dados calculados se não houver dados base
        setPartnerBalance([]);
        setMonthlyBalanceData([]); // Precisa de lógica de agrupamento por mês
        setPartnerToGroupMatrix([]);
        setGroupToPartnerMatrix([]);
        setGroupTotalBalance({ received: 0, sent: 0, balance: 0, percentBalance: 0 });
        return;
    }

    // Calcula o balanço para cada parceiro (recebido - enviado)
    const newPartnerBalance = externalPartners.map((partner) => {
      const received = opportunities.filter(
        (op) => op.tipo_oportunidade === "externa_entrada" && op.parceiro_externo_id === partner.id
      ).length;
      const sent = opportunities.filter(
        (op) => 
          op.tipo_oportunidade === "externa_saida" && 
          (op.parceiro_externo_id === partner.id || 
           (op.oportunidade_parceiro_saida && op.oportunidade_parceiro_saida.some(ops => ops.parceiro_externo_id === partner.id)))
      ).length;
      return {
        name: partner.nome,
        received,
        sent,
        balance: received - sent,
      };
    });
    newPartnerBalance.sort((a, b) => b.balance - a.balance);
    setPartnerBalance(newPartnerBalance);

    // Calcula o total do balanço do grupo inteiro com parceiros externos
    const totalReceived = opportunities.filter(op => op.tipo_oportunidade === "externa_entrada").length;
    const totalSent = opportunities.filter(op => op.tipo_oportunidade === "externa_saida").length;
    setGroupTotalBalance({
      received: totalReceived,
      sent: totalSent,
      balance: totalReceived - totalSent,
      percentBalance: totalSent === 0 && totalReceived === 0 ? 0 : (totalSent === 0 ? 100 : (totalReceived / totalSent) * 100)
    });

    // Matriz: Parceiros -> Empresas do Grupo (Oportunidades Recebidas)
    const newPartnerToGroupMatrix = externalPartners.map((partner) => {
      const partnerRow: Record<string, any> = { name: partner.nome };
      groupCompanies.forEach((company) => {
        partnerRow[company.nome] = opportunities.filter(
          (op) =>
            op.tipo_oportunidade === "externa_entrada" &&
            op.parceiro_externo_id === partner.id &&
            op.empresa_destino_id === company.id
        ).length;
      });
      return partnerRow;
    });
    setPartnerToGroupMatrix(newPartnerToGroupMatrix);

    // Matriz: Empresas do Grupo -> Parceiros (Oportunidades Enviadas)
    const newGroupToPartnerMatrix = groupCompanies.map((company) => {
      const companyRow: Record<string, any> = { name: company.nome };
      externalPartners.forEach((partner) => {
        companyRow[partner.nome] = opportunities.filter(
          (op) =>
            op.tipo_oportunidade === "externa_saida" &&
            op.empresa_origem_id === company.id &&
            (op.parceiro_externo_id === partner.id || 
             (op.oportunidade_parceiro_saida && op.oportunidade_parceiro_saida.some(ops => ops.parceiro_externo_id === partner.id)))
        ).length;
      });
      return companyRow;
    });
    setGroupToPartnerMatrix(newGroupToPartnerMatrix);
    
    // TODO: Lógica para `monthlyBalanceData` (agrupar oportunidades por mês)
    // Exemplo simplificado, precisaria de datas reais e agrupamento
    const exampleMonthly = [
        { month: "Jan", balance: 0 }, { month: "Fev", balance: 0 }, { month: "Mar", balance: 0 },
        { month: "Abr", balance: 0 }, { month: "Mai", balance: 0 }, { month: "Jun", balance: 0 },
        // ... outros meses
    ];
    setMonthlyBalanceData(exampleMonthly);

  }, [opportunities, externalPartners, groupCompanies]);

  const handleExportData = () => {
    // TODO: Implementar lógica de exportação (CSV, Excel)
    console.log("Exportando dados...");
    toast.info("Funcionalidade de exportação ainda não implementada.");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full p-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados dos parceiros...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro ao Carregar Dados</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchData}>Tentar Novamente</Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Parceiros</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore o desempenho de parcerias externas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Parceiros Ativos"
                  value={externalPartners.length}
                  // trend="up" // Lógica de tendência precisa ser definida
                  // trendValue={2}
                  // description="vs. mês passado"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de parceiros externos cadastrados.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Oportunidades Recebidas"
                  value={groupTotalBalance.received}
                  trend={groupTotalBalance.received > groupTotalBalance.sent ? "up" : "down"}
                  trendValue={Math.abs(groupTotalBalance.received - groupTotalBalance.sent)}
                  description="vs. enviadas"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número total de oportunidades recebidas de parceiros externos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Oportunidades Enviadas"
                  value={groupTotalBalance.sent}
                  trend={groupTotalBalance.sent > groupTotalBalance.received ? "up" : "down"}
                  trendValue={Math.abs(groupTotalBalance.received - groupTotalBalance.sent)}
                  description="vs. recebidas"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número total de oportunidades enviadas para parceiros externos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="col-span-3">
                <DashboardCard title="Balanço Total do Grupo A&eight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Recebidas</span>
                        <span className="text-green-600 font-bold">{groupTotalBalance.received}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Enviadas</span>
                        <span className="text-blue-600 font-bold">{groupTotalBalance.sent}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-medium">Balanço</span>
                        <span className={`font-bold ${groupTotalBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {groupTotalBalance.balance > 0 ? '+' : ''}{groupTotalBalance.balance}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{groupTotalBalance.balance < 0 ? "Desfavorável" : "Favorável"}</span>
                          <span>Equilíbrio</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, Math.max(0, groupTotalBalance.percentBalance))}%`,
                              backgroundColor: groupTotalBalance.balance >= 0 ? '#10b981' : '#ef4444'
                            }}
                          ></div>
                        </div>
                        <div className="text-center text-sm mt-1">
                          {Math.round(groupTotalBalance.percentBalance)}% 
                          {groupTotalBalance.balance >= 0 ? ' (favorável)' : ' (desfavorável)'}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="mb-2 font-medium">Tendência de Balanço Mensal (Exemplo)</p>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyBalanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip
                              formatter={(value: number) => [`${value} oportunidades`, 'Balanço']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#8B5CF6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visão geral do equilíbrio entre as oportunidades recebidas e enviadas para parceiros externos. Um balanço positivo indica que recebemos mais oportunidades do que enviamos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Balanço por Parceiro</h2>
        <Select
          value={period}
          onValueChange={setPeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todo o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_time">Todo o período</SelectItem>
            {/* TODO: Adicionar mais opções de período e implementar filtro */}
            {/* <SelectItem value="lastmonth">Último mês</SelectItem>
            <SelectItem value="last3months">Últimos 3 meses</SelectItem>
            <SelectItem value="last6months">Últimos 6 meses</SelectItem>
            <SelectItem value="thisyear">Este ano</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-md border shadow-md p-6 mb-8">
            {partnerBalance.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={partnerBalance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar name="Recebidas" dataKey="received" fill="#10b981" />
                  <Bar name="Enviadas" dataKey="sent" fill="#3b82f6" />
                  <Bar name="Balanço" dataKey="balance">
                    {partnerBalance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.balance >= 0 ? "#6ee7b7" : "#fca5a5"} // Cores mais suaves para o balanço
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-10">Nenhum dado de balanço de parceiro para exibir.</p>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Comparação entre oportunidades recebidas e enviadas por parceiro. O balanço positivo (verde) indica mais oportunidades recebidas do que enviadas.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Oportunidades de Parceiros para A&eight">
                  <div className="overflow-x-auto">
                  {partnerToGroupMatrix.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Parceiro</th>
                          {groupCompanies.map((company) => (
                            <th key={company.id} className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">{company.nome}</th>
                          ))}
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {partnerToGroupMatrix.map((row, rowIndex) => (
                          <tr key={row.name + rowIndex}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{row.name}</td>
                            {groupCompanies.map((company) => (
                              <td key={company.id + company.nome} className="px-4 py-2 whitespace-nowrap text-sm">
                                {row[company.nome] || 0}
                              </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              {groupCompanies.reduce((sum, company) => sum + (row[company.nome] || 0), 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    ) : (
                      <p className="text-muted-foreground text-center py-10">Nenhuma matriz de parceiro para grupo para exibir.</p>
                    )}
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Matriz que mostra quantas oportunidades cada parceiro externo enviou para cada empresa do grupo A&eight.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Oportunidades de A&eight para Parceiros">
                  <div className="overflow-x-auto">
                  {groupToPartnerMatrix.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Empresa A&eight</th>
                          {externalPartners.map((partner) => (
                            <th key={partner.id} className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">{partner.nome}</th>
                          ))}
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {groupToPartnerMatrix.map((row, rowIndex) => (
                          <tr key={row.name + rowIndex}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{row.name}</td>
                            {externalPartners.map((partner) => (
                              <td key={partner.id + partner.nome} className="px-4 py-2 whitespace-nowrap text-sm">
                                {row[partner.nome] || 0}
                              </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              {externalPartners.reduce((sum, partner) => sum + (row[partner.nome] || 0), 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    ) : (
                      <p className="text-muted-foreground text-center py-10">Nenhuma matriz de grupo para parceiro para exibir.</p>
                    )}
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Matriz que mostra quantas oportunidades cada empresa do grupo A&eight enviou para cada parceiro externo.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </DashboardLayout>
  );
};

export default Partners;
