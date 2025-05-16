import React, { useState, useEffect, useCallback } from "react"; // Adicionado useCallback
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Plus, Search, Download, Filter, Loader2 } from "lucide-react"; // Adicionado Loader2
// import {
//   mockOpportunities, // Removido
//   groupCompanies, // Removido
//   externalPartners, // Removido
//   statusOptions, // Removido
// } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client"; // Adicionado
import { Oportunidade, EmpresaGrupo, ParceiroExterno, StatusOportunidade, Lead } from "@/types"; // Ajustado e adicionado tipos
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"; // Adicionado para notificações

// Tipos para os selects do formulário
interface SelectOption {
  id: string | number;
  nome: string;
}

const OpportunityTypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    intragrupo: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    externa_entrada: "bg-green-100 text-green-800 hover:bg-green-100",
    externa_saida: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };

  const labels: Record<string, string> = {
    intragrupo: "Intragrupo",
    externa_entrada: "Recebida Externa",
    externa_saida: "Enviada Externa",
  };
  const defaultStyle = "bg-gray-100 text-gray-800 hover:bg-gray-100";
  const defaultLabel = type;

  return (
    <Badge
      variant="outline"
      className={styles[type] || defaultStyle}
    >
      {labels[type] || defaultLabel}
    </Badge>
  );
};

const StatusBadge = ({ statusName }: { statusName: string | undefined }) => {
  if (!statusName) return <Badge variant="outline">Desconhecido</Badge>;
  // Esta lógica de cores pode ser melhorada se tivermos os IDs ou uma forma mais robusta de mapear
  const lowerStatus = statusName.toLowerCase();
  let style = "bg-gray-100 text-gray-800 hover:bg-gray-100";
  if (lowerStatus.includes("nova")) style = "bg-purple-100 text-purple-800 hover:bg-purple-100";
  else if (lowerStatus.includes("andamento")) style = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
  else if (lowerStatus.includes("ganha")) style = "bg-green-100 text-green-800 hover:bg-green-100";
  else if (lowerStatus.includes("perdida")) style = "bg-red-100 text-red-800 hover:bg-red-100";
  else if (lowerStatus.includes("espera")) style = "bg-gray-100 text-gray-800 hover:bg-gray-100";

  return (
    <Badge variant="outline" className={style}>
      {statusName}
    </Badge>
  );
};

const Opportunities = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    type: "",
    status_id: "", // Alterado para status_id
    empresa_origem_id: "", // Alterado
    empresa_destino_id: "", // Alterado
    search: "",
  });
  const [opportunities, setOpportunities] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Estados para os selects do formulário
  const [groupCompanies, setGroupCompanies] = useState<EmpresaGrupo[]>([]);
  const [externalPartners, setExternalPartners] = useState<ParceiroExterno[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOportunidade[]>([]);

  const initialNewOpportunityState = {
    tipo_oportunidade: "intragrupo" as Oportunidade["tipo_oportunidade"],
    empresa_origem_id: null as number | null,
    empresa_destino_id: null as number | null,
    parceiro_externo_id: null as number | null,
    parceiros_externos_ids: [] as number[], // Para múltiplas saídas
    status_id: null as number | null,
    // Lead data
    lead_nome_empresa: "",
    lead_nome_contato: "",
    lead_email: "",
    lead_telefone: "",
    observacoes: "",
    // data_envio é CURRENT_TIMESTAMP no DB
    // id_responsavel_envio_recebimento será o usuário logado
  };
  const [newOpportunity, setNewOpportunity] = useState<typeof initialNewOpportunityState>(initialNewOpportunityState);

  const fetchSelectOptions = useCallback(async () => {
    try {
      const { data: companiesData, error: companiesError } = await supabase.from("empresas_grupo").select("id, nome");
      if (companiesError) throw companiesError;
      setGroupCompanies(companiesData || []);

      const { data: partnersData, error: partnersError } = await supabase.from("parceiros_externos").select("id, nome");
      if (partnersError) throw partnersError;
      setExternalPartners(partnersData || []);

      const { data: statusData, error: statusError } = await supabase.from("status_oportunidade").select("id, nome");
      if (statusError) throw statusError;
      setStatusOptions(statusData || []);
      // Definir status inicial para "Nova" se existir
      const defaultStatus = statusData?.find(s => s.nome.toLowerCase() === "nova");
      if (defaultStatus) {
        setNewOpportunity(prev => ({...prev, status_id: defaultStatus.id}))
      }

    } catch (error) {
      console.error("Erro ao buscar opções para selects:", error);
      toast.error("Falha ao carregar dados de apoio para o formulário.");
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("oportunidades")
        .select(`
          *,
          leads (nome_empresa, nome_contato, email, telefone),
          empresas_grupo_origem:empresa_origem_id (nome),
          empresas_grupo_destino:empresa_destino_id (nome),
          parceiros_externos:parceiro_externo_id (nome),
          status_oportunidade:status_id (nome),
          usuarios:id_responsavel_envio_recebimento (nome_completo)
        `);

      if (filter.type) {
        query = query.eq("tipo_oportunidade", filter.type);
      }
      if (filter.status_id) {
        query = query.eq("status_id", parseInt(filter.status_id));
      }
      if (filter.empresa_origem_id) {
        query = query.eq("empresa_origem_id", parseInt(filter.empresa_origem_id));
      }
      if (filter.empresa_destino_id) {
        query = query.eq("empresa_destino_id", parseInt(filter.empresa_destino_id));
      }
      if (filter.search) {
        // A busca em campos relacionados diretamente no Supabase é mais complexa.
        // Por simplicidade, faremos o filtro no cliente por enquanto, ou buscar por um campo principal.
        // Para busca em `leads.nome_empresa` ou `usuarios.nome_completo` seria preciso RPC ou views.
        query = query.or(`leads.nome_empresa.ilike.%${filter.search}%,leads.nome_contato.ilike.%${filter.search}%`);
      }

      const { data, error } = await query.order("data_envio", { ascending: false });

      if (error) {
        console.error("Erro ao buscar oportunidades:", error);
        toast.error("Falha ao carregar oportunidades.");
        setOpportunities([]);
      } else {
        setOpportunities(data as Oportunidade[] || []);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Ocorreu um erro inesperado.");
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSelectOptions();
    fetchOpportunities();
  }, [fetchOpportunities, fetchSelectOptions]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewOpportunity((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number | null) => {
    setNewOpportunity((prev) => ({ ...prev, [name]: value ? Number(value) : null }));
  };
  
  const handleMultiSelectChange = (name: string, values: string[]) => {
    setNewOpportunity((prev) => ({ ...prev, [name]: values.map(v => Number(v)) }));
  };

  const handleCreateOpportunity = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      toast.error("Você precisa estar logado para criar uma oportunidade.");
      return;
    }
    const currentUserId = userData.user.id;

    // Validações básicas
    if (!newOpportunity.tipo_oportunidade || !newOpportunity.status_id || !newOpportunity.lead_nome_empresa) {
        toast.error("Preencha todos os campos obrigatórios do lead e da oportunidade.");
        return;
    }
    if (newOpportunity.tipo_oportunidade === "intragrupo" && (!newOpportunity.empresa_origem_id || !newOpportunity.empresa_destino_id)) {
        toast.error("Para oportunidades intragrupo, selecione origem e destino.");
        return;
    }
    // Adicionar mais validações conforme necessário

    try {
      setLoading(true);
      // 1. Criar o Lead
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert({
          nome_empresa: newOpportunity.lead_nome_empresa,
          nome_contato: newOpportunity.lead_nome_contato,
          email: newOpportunity.lead_email,
          telefone: newOpportunity.lead_telefone,
        })
        .select("id")
        .single();

      if (leadError || !leadData) {
        console.error("Erro ao criar lead:", leadError);
        toast.error(`Falha ao criar lead: ${leadError?.message || "Erro desconhecido"}`);
        setLoading(false);
        return;
      }

      // 2. Criar a Oportunidade
      const oportunidadePayload: Partial<Oportunidade> = {
        lead_id: leadData.id,
        tipo_oportunidade: newOpportunity.tipo_oportunidade,
        status_id: newOpportunity.status_id,
        id_responsavel_envio_recebimento: currentUserId, // ID do usuário logado
        observacoes: newOpportunity.observacoes,
        empresa_origem_id: newOpportunity.empresa_origem_id,
        empresa_destino_id: newOpportunity.empresa_destino_id,
        parceiro_externo_id: newOpportunity.parceiro_externo_id,
      };
      
      // Lógica para parceiros_externos_ids se for do tipo externa_saida e múltiplos parceiros
      // Esta parte precisaria de uma tabela de junção (oportunidade_parceiros_externos)
      // Por simplicidade, se for externa_saida e houver newOpportunity.parceiros_externos_ids,
      // vamos assumir que o primeiro é o principal e os demais seriam registrados em outra tabela.
      // Para este exemplo, vamos simplificar e usar apenas parceiro_externo_id.
      // Se newOpportunity.parceiros_externos_ids.length > 0, pegue o primeiro como parceiro_externo_id
      if (newOpportunity.tipo_oportunidade === 'externa_saida' && newOpportunity.parceiros_externos_ids && newOpportunity.parceiros_externos_ids.length > 0) {
        oportunidadePayload.parceiro_externo_id = newOpportunity.parceiros_externos_ids[0];
        // A lógica para múltiplos parceiros precisaria de uma tabela de junção.
        // Ex: oportunidade_parceiros_externos (oportunidade_id, parceiro_externo_id)
        // E aqui você faria inserts nessa tabela após criar a oportunidade.
      }

      const { error: oppError } = await supabase
        .from("oportunidades")
        .insert(oportunidadePayload);

      if (oppError) {
        console.error("Erro ao criar oportunidade:", oppError);
        toast.error(`Falha ao criar oportunidade: ${oppError.message}`);
        // Considerar deletar o lead criado se a oportunidade falhar?
      } else {
        toast.success("Oportunidade criada com sucesso!");
        setIsCreateDialogOpen(false);
        setNewOpportunity(initialNewOpportunityState); // Resetar formulário
        fetchOpportunities(); // Recarregar lista
      }
    } catch (error) {
      console.error("Erro inesperado ao criar oportunidade:", error);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Implementar exportação para CSV
    if (opportunities.length === 0) {
      toast.info("Não há dados para exportar.");
      return;
    }
    const headers = [
      "ID Oportunidade", "Tipo", "Status", "Empresa Cliente", "Contato", "Email Contato", "Telefone Contato",
      "Empresa Origem (Grupo)", "Empresa Destino (Grupo)", "Parceiro Externo", "Responsável", "Data Envio", "Observações"
    ];
    const rows = opportunities.map(op => [
      op.id,
      op.tipo_oportunidade,
      op.status_oportunidade?.nome || op.status_id,
      op.leads?.nome_empresa || "N/A",
      op.leads?.nome_contato || "N/A",
      op.leads?.email || "N/A",
      op.leads?.telefone || "N/A",
      op.empresas_grupo_origem?.nome || (op.tipo_oportunidade === "intragrupo" || op.tipo_oportunidade === "externa_saida" ? op.empresa_origem_id : "N/A"),
      op.empresas_grupo_destino?.nome || (op.tipo_oportunidade === "intragrupo" || op.tipo_oportunidade === "externa_entrada" ? op.empresa_destino_id : "N/A"),
      op.parceiros_externos?.nome || (op.tipo_oportunidade === "externa_entrada" || op.tipo_oportunidade === "externa_saida" ? op.parceiro_externo_id : "N/A"),
      op.usuarios?.nome_completo || op.id_responsavel_envio_recebimento,
      new Date(op.data_envio).toLocaleDateString(),
      op.observacoes
    ].map(field => `"${String(field || "").replace(/"/g, """" )}"`).join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "oportunidades_a&eight.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dados exportados para CSV!");
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Oportunidades</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore todas as oportunidades de parceria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Oportunidade</DialogTitle>
                <DialogDescription>
                  Registre uma nova oportunidade de parceria preenchendo os detalhes abaixo.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="intragrupo" onValueChange={(value) => setNewOpportunity(prev => ({...prev, tipo_oportunidade: value as any}))} className="w-full mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="intragrupo" className="flex-1">Intragrupo</TabsTrigger>
                  <TabsTrigger value="externa_entrada" className="flex-1">Recebida Externa</TabsTrigger>
                  <TabsTrigger value="externa_saida" className="flex-1">Enviada Externa</TabsTrigger>
                </TabsList>

                {/* Formulário de Lead Comum */}
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="lead_nome_empresa">Nome da Empresa Cliente (Lead) <span className="text-red-500">*</span></Label>
                        <Input id="lead_nome_empresa" name="lead_nome_empresa" value={newOpportunity.lead_nome_empresa} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lead_nome_contato">Nome do Contato (Lead)</Label>
                            <Input id="lead_nome_contato" name="lead_nome_contato" value={newOpportunity.lead_nome_contato} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lead_email">Email do Contato (Lead)</Label>
                            <Input id="lead_email" name="lead_email" type="email" value={newOpportunity.lead_email} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lead_telefone">Telefone do Contato (Lead)</Label>
                        <Input id="lead_telefone" name="lead_telefone" value={newOpportunity.lead_telefone} onChange={handleInputChange} />
                    </div>
                </div>

                <TabsContent value="intragrupo">
                  <div className="grid gap-4 pt-0 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresa_origem_id_intragrupo">Empresa de Origem (A&eight) <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.empresa_origem_id?.toString()} onValueChange={(value) => handleSelectChange("empresa_origem_id", value)} >
                          <SelectTrigger id="empresa_origem_id_intragrupo"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{groupCompanies.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa_destino_id_intragrupo">Empresa de Destino (A&eight) <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.empresa_destino_id?.toString()} onValueChange={(value) => handleSelectChange("empresa_destino_id", value)} >
                          <SelectTrigger id="empresa_destino_id_intragrupo"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{groupCompanies.filter(c => c.id !== newOpportunity.empresa_origem_id).map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="externa_entrada">
                  <div className="grid gap-4 pt-0 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parceiro_externo_id_entrada">Parceiro Externo (Origem) <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.parceiro_externo_id?.toString()} onValueChange={(value) => handleSelectChange("parceiro_externo_id", value)} >
                          <SelectTrigger id="parceiro_externo_id_entrada"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{externalPartners.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa_destino_id_entrada">Empresa de Destino (A&eight) <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.empresa_destino_id?.toString()} onValueChange={(value) => handleSelectChange("empresa_destino_id", value)} >
                          <SelectTrigger id="empresa_destino_id_entrada"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{groupCompanies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="externa_saida">
                  <div className="grid gap-4 pt-0 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresa_origem_id_saida">Empresa de Origem (A&eight) <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.empresa_origem_id?.toString()} onValueChange={(value) => handleSelectChange("empresa_origem_id", value)} >
                          <SelectTrigger id="empresa_origem_id_saida"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{groupCompanies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                       {/* TODO: Implementar multi-select para parceiros externos ou simplificar para um parceiro por vez */}
                      <div className="space-y-2">
                        <Label htmlFor="parceiro_externo_id_saida">Parceiro Externo (Destino) <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.parceiro_externo_id?.toString()} onValueChange={(value) => handleSelectChange("parceiro_externo_id", value)} >
                           <SelectTrigger id="parceiro_externo_id_saida"><SelectValue placeholder="Selecione" /></SelectTrigger>
                           <SelectContent>{externalPartners.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>)}</SelectContent>
                        </Select>
                         {/* <p className="text-xs text-muted-foreground">Segure Command/Ctrl para selecionar múltiplos.</p> */}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Campos Comuns da Oportunidade */}
                <div className="grid gap-4 pt-4 border-t">
                    <div className="space-y-2">
                        <Label htmlFor="status_id">Status da Oportunidade <span className="text-red-500">*</span></Label>
                        <Select value={newOpportunity.status_id?.toString()} onValueChange={(value) => handleSelectChange("status_id", value)} >
                            <SelectTrigger id="status_id"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>{statusOptions.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nome}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Input id="observacoes" name="observacoes" value={newOpportunity.observacoes} onChange={handleInputChange} />
                    </div>
                </div>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateOpportunity} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar Oportunidade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 p-4 border rounded-lg bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="search-filter">Busca Rápida</Label>
            <Input id="search-filter" placeholder="Nome empresa, contato..." value={filter.search} onChange={(e) => handleFilterChange("search", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type-filter">Tipo</Label>
            <Select value={filter.type} onValueChange={(value) => handleFilterChange("type", value === "all" ? "" : value)}>
              <SelectTrigger id="type-filter"><SelectValue placeholder="Todos os Tipos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="intragrupo">Intragrupo</SelectItem>
                <SelectItem value="externa_entrada">Recebida Externa</SelectItem>
                <SelectItem value="externa_saida">Enviada Externa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={filter.status_id} onValueChange={(value) => handleFilterChange("status_id", value === "all" ? "" : value)}>
              <SelectTrigger id="status-filter"><SelectValue placeholder="Todos os Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {statusOptions.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sourceCompany-filter">Empresa Origem (A&eight)</Label>
            <Select value={filter.empresa_origem_id} onValueChange={(value) => handleFilterChange("empresa_origem_id", value === "all" ? "" : value)}>
              <SelectTrigger id="sourceCompany-filter"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {groupCompanies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="targetCompany-filter">Empresa Destino (A&eight)</Label>
            <Select value={filter.empresa_destino_id} onValueChange={(value) => handleFilterChange("empresa_destino_id", value === "all" ? "" : value)}>
              <SelectTrigger id="targetCompany-filter"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {groupCompanies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Adicionar filtro por Parceiro Externo se necessário */}
        </div>
      </div>

      {/* Tabela de Oportunidades */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Carregando oportunidades...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-10">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma oportunidade encontrada com os filtros atuais.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opp) => (
                <TableRow key={opp.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/opportunities/${opp.id}`)}>
                  <TableCell className="font-medium">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="hover:underline">
                                {opp.leads?.nome_empresa || "N/A"}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Contato: {opp.leads?.nome_contato || "N/A"}</p>
                                <p>Email: {opp.leads?.email || "N/A"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell><OpportunityTypeBadge type={opp.tipo_oportunidade} /></TableCell>
                  <TableCell><StatusBadge statusName={opp.status_oportunidade?.nome} /></TableCell>
                  <TableCell>
                    {opp.tipo_oportunidade === "intragrupo" || opp.tipo_oportunidade === "externa_saida"
                      ? opp.empresas_grupo_origem?.nome || "N/A"
                      : opp.parceiros_externos?.nome || "N/A"}
                  </TableCell>
                  <TableCell>
                    {opp.tipo_oportunidade === "intragrupo" || opp.tipo_oportunidade === "externa_entrada"
                      ? opp.empresas_grupo_destino?.nome || "N/A"
                      : opp.parceiros_externos?.nome || "N/A"} {/* Para saida, pode ser múltiplos, mostrar o primeiro ou "Múltiplos" */}
                  </TableCell>
                  <TableCell>{opp.usuarios?.nome_completo || "N/A"}</TableCell>
                  <TableCell>{new Date(opp.data_envio).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/opportunities/${opp.id}`); }}>
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Opportunities;
        <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sourceCompany">Empresa de Origem</Label>
                        <Select
                          value={newOpportunity.sourceCompany}
                          onValueChange={(value) =>
                            handleSelectChange("sourceCompany", value)
                          }
                        >
                          <SelectTrigger id="sourceCompany">
                            <SelectValue placeholder="Selecione empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupCompanies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partners">Parceiro(s)</Label>
                        <Select
                          value={newOpportunity.partners[0]}
                          onValueChange={(value) =>
                            setNewOpportunity({
                              ...newOpportunity,
                              partners: [value],
                            })
                          }
                        >
                          <SelectTrigger id="partners">
                            <SelectValue placeholder="Selecione parceiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {externalPartners.map((partner) => (
                              <SelectItem key={partner} value={partner}>
                                {partner}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCompanyName">Nome da Empresa Cliente</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nome do Contato</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email do Contato</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={newOpportunity.contactEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone do Contato</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={newOpportunity.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateOpportunity}
                >
                  Criar Oportunidade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar oportunidades..."
              className="pl-10"
              value={filter.search}
              onChange={(e) =>
                setFilter({ ...filter, search: e.target.value })
              }
            />
          </div>
        </div>
        <Select
          value={filter.type}
          onValueChange={(value) => setFilter({ ...filter, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Tipos</SelectItem>
            <SelectItem value="internal">Intragrupo</SelectItem>
            <SelectItem value="incoming">Recebida Externa</SelectItem>
            <SelectItem value="outgoing">Enviada Externa</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.status}
          onValueChange={(value) => setFilter({ ...filter, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.sourceCompany}
          onValueChange={(value) =>
            setFilter({ ...filter, sourceCompany: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Empresa de Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Empresas de Origem</SelectItem>
            {groupCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.targetCompany}
          onValueChange={(value) =>
            setFilter({ ...filter, targetCompany: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Empresa de Destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Empresas de Destino</SelectItem>
            {groupCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Oportunidades */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-md border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma oportunidade encontrada com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    opportunities.map((opportunity) => (
                      <TableRow
                        key={opportunity.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/opportunity/${opportunity.id}`)}
                      >
                        <TableCell>
                          <OpportunityTypeBadge type={opportunity.type} />
                        </TableCell>
                        <TableCell>{opportunity.date}</TableCell>
                        <TableCell>{opportunity.targetCompanyName}</TableCell>
                        <TableCell>
                          {opportunity.type === "internal" || opportunity.type === "outgoing"
                            ? opportunity.sourceCompany
                            : opportunity.partnerName}
                        </TableCell>
                        <TableCell>
                          {opportunity.type === "internal" || opportunity.type === "incoming"
                            ? opportunity.targetCompany
                            : opportunity.partners.join(", ")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={opportunity.status} />
                        </TableCell>
                        <TableCell>{opportunity.contactName}</TableCell>
                        <TableCell>{opportunity.responsibleName}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lista de todas as oportunidades de parceria. Clique em uma linha para ver detalhes completos.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Opportunities;
