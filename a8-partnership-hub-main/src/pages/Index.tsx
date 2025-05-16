
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "recharts";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import StatCard from "@/components/ui/dashboard/StatCard";
import { BarChart3, PieChart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
// import { mockOpportunities, getMonthlyDataForChart, getQuarterlyData, getOpportunityDistributionByCompany, getIntraGroupExchangeData } from "@/data/mockData"; // Comentado - usaremos Supabase
import { supabase } from "@/integrations/supabase/client"; // Adicionado para Supabase
import { Oportunidade } from "@/types"; // Supondo que Opportunity seja o tipo correto para os dados do Supabase

const Index = () => {
  const [period, setPeriod] = useState<"quarterly" | "monthly">("monthly");
  const [loading, setLoading] = useState(true);
  const [opportunitiesData, setOpportunitiesData] = useState<Oportunidade[]>([]);

  // Dados para gráficos - serão populados pelo Supabase
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [quarterlyChartData, setQuarterlyChartData] = useState<any[]>([]);
  const [opportunityDistributionChartData, setOpportunityDistributionChartData] = useState<any[]>([]);
  const [intraGroupChartData, setIntraGroupChartData] = useState<any>({});

  // Estatísticas
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [internalOpportunities, setInternalOpportunities] = useState(0);
  const [incomingOpportunities, setIncomingOpportunities] = useState(0);
  const [outgoingOpportunities, setOutgoingOpportunities] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [growthRate, setGrowthRate] = useState(0); // Placeholder, precisará de lógica mais complexa

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: opportunities, error } = await supabase
          .from("oportunidades")
          .select("*", { count: "exact" }); // Inclui contagem total

        if (error) {
          console.error("Erro ao buscar oportunidades:", error);
          // Tratar erro, talvez mostrar uma mensagem para o usuário
          setLoading(false);
          return;
        }

        if (opportunities) {
          setOpportunitiesData(opportunities as Oportunidade[]);
          setTotalOpportunities(opportunities.length); // ou usar a contagem retornada se disponível e correta
          
          setInternalOpportunities(opportunities.filter(op => op.tipo_oportunidade === "intragrupo").length);
          setIncomingOpportunities(opportunities.filter(op => op.tipo_oportunidade === "externa_entrada").length);
          setOutgoingOpportunities(opportunities.filter(op => op.tipo_oportunidade === "externa_saida").length);

          // Calcular taxa de conversão (exemplo, precisa de status_id ou nome do status)
          // const wonOpps = opportunities.filter(op => op.status_id === ID_DO_STATUS_GANHA).length;
          // setConversionRate(opportunities.length > 0 ? Math.round((wonOpps / opportunities.length) * 100) : 0);

          // TODO: Implementar lógica para buscar e processar dados para:
          // monthlyChartData, quarterlyChartData, opportunityDistributionChartData, intraGroupChartData, growthRate
          // Exemplo para monthlyChartData (simplificado):
          // const monthlySummary = {}; // Agrupar por mês e empresa
          // setMonthlyChartData(transformDataForChart(monthlySummary));
        }
      } catch (e) {
        console.error("Erro inesperado ao buscar dados do dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // const monthlyData = getMonthlyDataForChart(); // Removido mock
  // const quarterlyData = getQuarterlyData(); // Removido mock
  // const opportunityDistribution = getOpportunityDistributionByCompany(); // Removido mock
  // const intraGroupData = getIntraGroupExchangeData(); // Removido mock

  // Calcula estatísticas - agora são states
  // const totalOpportunities = mockOpportunities.length; // Removido mock
  // const internalOpportunities = mockOpportunities.filter(opp => opp.type === 'internal').length; // Removido mock
  // const incomingOpportunities = mockOpportunities.filter(opp => opp.type === 'incoming').length; // Removido mock
  // const outgoingOpportunities = mockOpportunities.filter(opp => opp.type === 'outgoing').length; // Removido mock
  // const wonOpportunities = mockOpportunities.filter(opp => opp.status === 'Won').length; // Removido mock
  // const conversionRate = Math.round((wonOpportunities / totalOpportunities) * 100); // Removido mock
  
  // const currentQuarterCount = quarterlyData[Math.floor(new Date().getMonth() / 3)].value; // Removido mock
  // const previousQuarterIndex = Math.floor(new Date().getMonth() / 3) - 1; // Removido mock
  // const previousQuarterCount = previousQuarterIndex >= 0 ? quarterlyData[previousQuarterIndex].value : quarterlyData[3].value; // Removido mock
  // const growthRate = Math.round(((currentQuarterCount - previousQuarterCount) / previousQuarterCount) * 100); // Removido mock

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-aeight-dark">Dashboard de Parcerias</h1>
        <p className="text-muted-foreground mt-2">
          Monitore e analise as oportunidades de parceria internas e externas do grupo A&eight
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total de Oportunidades"
          value={loading ? "-" : totalOpportunities}
          description="Todas as oportunidades registradas"
          icon={<BarChart3 className="h-5 w-5" />}
          trend={growthRate} // Manter como placeholder por enquanto
          className="animate-enter"
        />
        <StatCard
          title="Oportunidades Intragrupo"
          value={loading ? "-" : internalOpportunities}
          description="Entre empresas A&eight"
          icon={<Users className="h-5 w-5" />}
          // trend={12} // Placeholder
          className="animate-enter"
          style={{ animationDelay: "100ms" }}
        />
        <StatCard
          title="Externas Recebidas"
          value={loading ? "-" : incomingOpportunities}
          description="De parceiros externos"
          icon={<ArrowDownRight className="h-5 w-5" />}
          // trend={-5} // Placeholder
          className="animate-enter"
          style={{ animationDelay: "200ms" }}
        />
        <StatCard
          title="Externas Enviadas"
          value={loading ? "-" : outgoingOpportunities}
          description="Para parceiros externos"
          icon={<ArrowUpRight className="h-5 w-5" />}
          // trend={8} // Placeholder
          className="animate-enter"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Charts Section - Manter com dados mockados ou placeholders por enquanto */}
      <Tabs defaultValue="volume" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="volume">Tendências de Volume</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          </TabsList>
          <Select value={period} onValueChange={(val: "quarterly" | "monthly") => setPeriod(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="volume" className="mt-0">
          <DashboardCard title="Volume de Oportunidades ao Longo do Tempo">
            <div className="h-[400px]">
              {loading || monthlyChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-muted-foreground">Carregando dados do gráfico... (ou sem dados)</div>
                </div>
              ) : period === "monthly" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyChartData} // Usar dados do Supabase
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* As chaves (Cryah, Lomadee, etc.) precisarão ser dinâmicas ou adaptadas à estrutura dos dados do Supabase */}
                    <Line type="monotone" dataKey="Cryah" stroke="#1e88e5" activeDot={{ r: 8 }} /> 
                    <Line type="monotone" dataKey="Lomadee" stroke="#26a69a" />
                    <Line type="monotone" dataKey="Monitfy" stroke="#ab47bc" />
                    <Line type="monotone" dataKey="B8one" stroke="#ff7043" />
                    <Line type="monotone" dataKey="SAIO" stroke="#66bb6a" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={quarterlyChartData} // Usar dados do Supabase
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Oportunidades" fill="#1e88e5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="distribution" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Oportunidades por Empresa">
              <div className="h-[400px]">
                {loading || opportunityDistributionChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando dados do gráfico... (ou sem dados)</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={opportunityDistributionChartData} // Usar dados do Supabase
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Oportunidades" fill="#26a69a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Distribuição por Status">
              <div className="h-[400px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando dados do gráfico...</div>
                  </div>
                ) : (
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="w-full max-w-md mx-auto">
                        <div className="mb-8 text-center">
                          <div className="text-5xl font-bold">{conversionRate}%</div>
                          <div className="text-sm text-muted-foreground mt-2">Taxa de conversão geral</div>
                        </div>
                        {/* Esta parte precisará ser refeita com dados reais do Supabase */}
                        <div className="space-y-4">
                          {/* Exemplo de como poderia ser com dados reais
                          {statusDistributionData.map(item => (
                            <div key={item.status} className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span>{item.status}</span>
                                  <span className="font-medium">{item.count}</span>
                                </div>
                                <div className="mt-1 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`${item.color} h-full`} 
                                    style={{ width: `${(item.count / totalOpportunities) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}*/}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Intragroup Exchange Matrix - Manter com dados mockados ou placeholders por enquanto */}
      <DashboardCard title="Matriz de Intercâmbio Intragrupo" className="mb-8">
        <div className="overflow-x-auto">
          {loading || Object.keys(intraGroupChartData).length === 0 ? (
             <div className="h-full flex items-center justify-center py-10">
                <div className="text-muted-foreground">Carregando dados da matriz... (ou sem dados)</div>
            </div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 border-b"></th>
                {Object.keys(intraGroupChartData).map((company) => (
                  <th key={company} className="p-3 border-b text-center">{company}</th>
                ))}
                <th className="p-3 border-b text-center">Total Enviado</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(intraGroupChartData).map(([source, targets]: [string, any], idx: number) => {
                const totalSent = Object.values(targets).reduce((sum: any, count: any) => sum + count, 0);
                return (
                  <tr key={source} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-3 border-b font-medium">{source}</td>
                    {Object.entries(targets).map(([target, count]:[string, any]) => (
                      <td key={`${source}-${target}`} className="p-3 border-b text-center">
                        {source === target ? (
                          <span className="text-gray-400">–</span>
                        ) : (
                          count > 0 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium">
                              {count}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )
                        )}
                      </td>
                    ))}
                    <td className="p-3 border-b text-center font-medium">{totalSent}</td>
                  </tr>
                );
              })}
              <tr className="bg-muted/50">
                <td className="p-3 font-medium">Total Recebido</td>
                {Object.keys(intraGroupChartData).map((company) => {
                  const totalReceived = Object.entries(intraGroupChartData)
                    .reduce((sum, [source, targets]:[string, any]) => sum + (source !== company ? targets[company] : 0), 0);
                  return (
                    <td key={`received-${company}`} className="p-3 text-center font-medium">
                      {totalReceived}
                    </td>
                  );
                })}
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
          )}
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Index;
