import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  getOportunidadesCompletas, 
  createOportunidade, 
  exportOportunidadesToCSV 
} from '@/services/oportunidades.service';
import { OportunidadeCompleta } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Opportunities() {
  const [oportunidades, setOportunidades] = useState<OportunidadeCompleta[]>([]);
  const [filteredOportunidades, setFilteredOportunidades] = useState<OportunidadeCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [empresasGrupo, setEmpresasGrupo] = useState<{id_empresa_grupo: number, nome_empresa: string}[]>([]);
  const [parceirosExternos, setParceirosExternos] = useState<{id_parceiro_externo: number, nome_parceiro: string}[]>([]);
  const [statusOptions, setStatusOptions] = useState<{id_status: number, nome_status: string}[]>([]);
  const { toast } = useToast();

  // Form state for new opportunity
  const [newOpportunityType, setNewOpportunityType] = useState<'intragrupo' | 'externa_entrada' | 'externa_saida'>('intragrupo');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [responsavelNome, setResponsavelNome] = useState('');
  const [empresaOrigemId, setEmpresaOrigemId] = useState<number | null>(null);
  const [empresaDestinoId, setEmpresaDestinoId] = useState<number | null>(null);
  const [parceiroOrigemId, setParceiroOrigemId] = useState<number | null>(null);
  const [parceiroDestinoIds, setParceiroDestinoIds] = useState<number[]>([]);
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [statusId, setStatusId] = useState<number | null>(null);
  const [descricaoServicos, setDescricaoServicos] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [valorPropostaMensal, setValorPropostaMensal] = useState<number | null>(null);
  const [numeroAportes, setNumeroAportes] = useState<number | null>(null);
  const [valorTotalProjeto, setValorTotalProjeto] = useState<number | null>(null);
  const [quarter, setQuarter] = useState<string | null>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [ano, setAno] = useState<number | null>(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch opportunities
        const opportunitiesData = await getOportunidadesCompletas();
        setOportunidades(opportunitiesData);
        setFilteredOportunidades(opportunitiesData);
        
        // Fetch companies
        const { data: empresas } = await supabase
          .from('empresas_grupo')
          .select('*');
        if (empresas) setEmpresasGrupo(empresas);
        
        // Fetch partners
        const { data: parceiros } = await supabase
          .from('parceiros_externos')
          .select('*');
        if (parceiros) setParceirosExternos(parceiros);
        
        // Fetch status options
        const { data: status } = await supabase
          .from('status_oportunidade')
          .select('*');
        if (status) {
          setStatusOptions(status);
          // Set default status to the first one
          if (status.length > 0) {
            setStatusId(status[0].id_status);
          }
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as oportunidades. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter opportunities when search term or filters change
  useEffect(() => {
    let result = [...oportunidades];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(op => 
        op.nome_empresa_lead.toLowerCase().includes(term) ||
        (op.nome_contato_lead && op.nome_contato_lead.toLowerCase().includes(term)) ||
        op.empresa_origem.toLowerCase().includes(term) ||
        op.empresa_destino.toLowerCase().includes(term) ||
        (op.parceiro_origem && op.parceiro_origem.toLowerCase().includes(term)) ||
        (op.parceiros_destino && op.parceiros_destino.some(p => p.toLowerCase().includes(term)))
      );
    }
    
    // Apply type filter
    if (filterType) {
      result = result.filter(op => op.tipo_oportunidade === filterType);
    }
    
    // Apply status filter
    if (filterStatus) {
      result = result.filter(op => op.status === filterStatus);
    }
    
    setFilteredOportunidades(result);
  }, [searchTerm, filterType, filterStatus, oportunidades]);

  const handleCreateOpportunity = async () => {
    if (!selectedDate || !responsavelNome || !targetCompanyName || !statusId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare data based on opportunity type
      const oportunidadeData = {
        tipo_oportunidade: newOpportunityType,
        data_envio_recebimento: selectedDate.toISOString(),
        id_responsavel_envio_recebimento: 1, // Assuming a default user ID
        id_status_atual: statusId,
        descricao_servicos,
        nome_projeto: nomeProjeto,
        valor_proposta_mensal: valorPropostaMensal,
        numero_aportes: numeroAportes,
        valor_total_projeto: valorTotalProjeto,
        quarter_oportunidade: quarter,
        mes_oportunidade: mes,
        ano_oportunidade: ano
      } as any;

      // Set origin and destination based on type
      if (newOpportunityType === 'intragrupo') {
        oportunidadeData.id_empresa_origem_grupo = empresaOrigemId;
        oportunidadeData.id_empresa_destino_grupo = empresaDestinoId;
      } else if (newOpportunityType === 'externa_entrada') {
        oportunidadeData.id_parceiro_origem_externo = parceiroOrigemId;
        oportunidadeData.id_empresa_destino_grupo = empresaDestinoId;
      } else if (newOpportunityType === 'externa_saida') {
        oportunidadeData.id_empresa_origem_grupo = empresaOrigemId;
        // parceiro_destino is handled separately
      }

      const leadData = {
        nome_empresa_lead: targetCompanyName,
        nome_contato_lead: contactName,
        email_lead: contactEmail,
        telefone_lead: contactPhone
      };

      // Create the opportunity
      await createOportunidade(
        oportunidadeData,
        leadData,
        newOpportunityType === 'externa_saida' ? parceiroDestinoIds : undefined
      );

      // Refresh the list
      const updatedOportunidades = await getOportunidadesCompletas();
      setOportunidades(updatedOportunidades);
      
      // Reset form
      resetForm();
      
      toast({
        title: "Sucesso",
        description: "Oportunidade criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a oportunidade. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewOpportunityType('intragrupo');
    setSelectedDate(new Date());
    setResponsavelNome('');
    setEmpresaOrigemId(null);
    setEmpresaDestinoId(null);
    setParceiroOrigemId(null);
    setParceiroDestinoIds([]);
    setTargetCompanyName('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setStatusId(statusOptions.length > 0 ? statusOptions[0].id_status : null);
    setDescricaoServicos('');
    setNomeProjeto('');
    setValorPropostaMensal(null);
    setNumeroAportes(null);
    setValorTotalProjeto(null);
    setQuarter(null);
    setMes(null);
    setAno(new Date().getFullYear());
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await exportOportunidadesToCSV();
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `oportunidades_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída",
        description: "Arquivo CSV gerado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados para CSV.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Oportunidades</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            Exportar CSV
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Nova Oportunidade</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Oportunidade</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="intragrupo" onValueChange={(value) => setNewOpportunityType(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="intragrupo">Intragrupo</TabsTrigger>
                  <TabsTrigger value="externa_entrada">Externa (Entrada)</TabsTrigger>
                  <TabsTrigger value="externa_saida">Externa (Saída)</TabsTrigger>
                </TabsList>
                
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data de Envio/Recebimento</Label>
                      <DatePicker
                        date={selectedDate}
                        setDate={setSelectedDate}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="responsavel">Nome do Responsável</Label>
                      <Input
                        id="responsavel"
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                  
                  <TabsContent value="intragrupo" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresaOrigem">Empresa de Origem</Label>
                        <Select
                          value={empresaOrigemId?.toString() || ""}
                          onValueChange={(value) => setEmpresaOrigemId(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a empresa de origem" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresasGrupo.map((empresa) => (
                              <SelectItem
                                key={empresa.id_empresa_grupo}
                                value={empresa.id_empresa_grupo.toString()}
                              >
                                {empresa.nome_empresa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresaDestino">Empresa de Destino</Label>
                        <Select
                          value={empresaDestinoId?.toString() || ""}
                          onValueChange={(value) => setEmpresaDestinoId(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a empresa de destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresasGrupo.map((empresa) => (
                              <SelectItem
                                key={empresa.id_empresa_grupo}
                                value={empresa.id_empresa_grupo.toString()}
                              >
                                {empresa.nome_empresa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="externa_entrada" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parceiroOrigem">Parceiro de Origem</Label>
                        <Select
                          value={parceiroOrigemId?.toString() || ""}
                          onValueChange={(value) => setParceiroOrigemId(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o parceiro de origem" />
                          </SelectTrigger>
                          <SelectContent>
                            {parceirosExternos.map((parceiro) => (
                              <SelectItem
                                key={parceiro.id_parceiro_externo}
                                value={parceiro.id_parceiro_externo.toString()}
                              >
                                {parceiro.nome_parceiro}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresaDestino">Empresa de Destino</Label>
                        <Select
                          value={empresaDestinoId?.toString() || ""}
                          onValueChange={(value) => setEmpresaDestinoId(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a empresa de destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresasGrupo.map((empresa) => (
                              <SelectItem
                                key={empresa.id_empresa_grupo}
                                value={empresa.id_empresa_grupo.toString()}
                              >
                                {empresa.nome_empresa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="externa_saida" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresaOrigem">Empresa de Origem</Label>
                        <Select
                          value={empresaOrigemId?.toString() || ""}
                          onValueChange={(value) => setEmpresaOrigemId(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a empresa de origem" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresasGrupo.map((empresa) => (
                              <SelectItem
                                key={empresa.id_empresa_grupo}
                                value={empresa.id_empresa_grupo.toString()}
                              >
                                {empresa.nome_empresa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="parceiroDestino">Parceiro de Destino</Label>
                        <Select
                          value={parceiroDestinoIds[0]?.toString() || ""}
                          onValueChange={(value) => setParceiroDestinoIds([Number(value)])}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o parceiro de destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {parceirosExternos.map((parceiro) => (
                              <SelectItem
                                key={parceiro.id_parceiro_externo}
                                value={parceiro.id_parceiro_externo.toString()}
                              >
                                {parceiro.nome_parceiro}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetCompanyName">Nome da Empresa Cliente</Label>
                    <Input
                      id="targetCompanyName"
                      value={targetCompanyName}
                      onChange={(e) => setTargetCompanyName(e.target.value)}
                      placeholder="Nome da empresa cliente"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nome do Contato</Label>
                      <Input
                        id="contactName"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Nome do contato"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email do Contato</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Email do contato"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone do Contato</Label>
                      <Input
                        id="contactPhone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Telefone do contato"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={statusId?.toString() || ""}
                      onValueChange={(value) => setStatusId(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem
                            key={status.id_status}
                            value={status.id_status.toString()}
                          >
                            {status.nome_status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricaoServicos">Descrição dos Serviços</Label>
                    <Input
                      id="descricaoServicos"
                      value={descricaoServicos}
                      onChange={(e) => setDescricaoServicos(e.target.value)}
                      placeholder="Descrição dos serviços"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeProjeto">Nome do Projeto</Label>
                      <Input
                        id="nomeProjeto"
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        placeholder="Nome do projeto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="valorPropostaMensal">Valor Proposta Mensal (R$)</Label>
                      <Input
                        id="valorPropostaMensal"
                        type="number"
                        value={valorPropostaMensal?.toString() || ""}
                        onChange={(e) => setValorPropostaMensal(e.target.value ? Number(e.target.value) : null)}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroAportes">Número de Aportes</Label>
                      <Input
                        id="numeroAportes"
                        type="number"
                        value={numeroAportes?.toString() || ""}
                        onChange={(e) => setNumeroAportes(e.target.value ? Number(e.target.value) : null)}
                        placeholder="Número de aportes"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="valorTotalProjeto">Valor Total do Projeto (R$)</Label>
                      <Input
                        id="valorTotalProjeto"
                        type="number"
                        value={valorTotalProjeto?.toString() || ""}
                        onChange={(e) => setValorTotalProjeto(e.target.value ? Number(e.target.value) : null)}
                        placeholder="0,00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quarter">Quarter</Label>
                      <Select
                        value={quarter || ""}
                        onValueChange={(value) => setQuarter(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Q1</SelectItem>
                          <SelectItem value="Q2">Q2</SelectItem>
                          <SelectItem value="Q3">Q3</SelectItem>
                          <SelectItem value="Q4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mes">Mês</Label>
                      <Select
                        value={mes?.toString() || ""}
                        onValueChange={(value) => setMes(value ? Number(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Janeiro</SelectItem>
                          <SelectItem value="2">Fevereiro</SelectItem>
                          <SelectItem value="3">Março</SelectItem>
                          <SelectItem value="4">Abril</SelectItem>
                          <SelectItem value="5">Maio</SelectItem>
                          <SelectItem value="6">Junho</SelectItem>
                          <SelectItem value="7">Julho</SelectItem>
                          <SelectItem value="8">Agosto</SelectItem>
                          <SelectItem value="9">Setembro</SelectItem>
                          <SelectItem value="10">Outubro</SelectItem>
                          <SelectItem value="11">Novembro</SelectItem>
                          <SelectItem value="12">Dezembro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano</Label>
                      <Input
                        id="ano"
                        type="number"
                        value={ano?.toString() || ""}
                        onChange={(e) => setAno(e.target.value ? Number(e.target.value) : null)}
                        placeholder="Ano"
                      />
                    </div>
                  </div>
                </div>
              </Tabs>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCreateOpportunity}>Criar Oportunidade</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select
            value={filterType || ""}
            onValueChange={(value) => setFilterType(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              <SelectItem value="intragrupo">Intragrupo</SelectItem>
              <SelectItem value="externa_entrada">Externa (Entrada)</SelectItem>
              <SelectItem value="externa_saida">Externa (Saída)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={filterStatus || ""}
            onValueChange={(value) => setFilterStatus(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.id_status} value={status.nome_status}>
                  {status.nome_status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Empresa Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Carregando oportunidades...
                </TableCell>
              </TableRow>
            ) : filteredOportunidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Nenhuma oportunidade encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredOportunidades.map((op) => (
                <TableRow key={op.id_oportunidade}>
                  <TableCell>{op.id_oportunidade}</TableCell>
                  <TableCell>
                    {op.tipo_oportunidade === 'intragrupo' ? 'Intragrupo' : 
                     op.tipo_oportunidade === 'externa_entrada' ? 'Externa (Entrada)' : 
                     'Externa (Saída)'}
                  </TableCell>
                  <TableCell>{new Date(op.data_envio_recebimento).toLocaleDateString()}</TableCell>
                  <TableCell>{op.empresa_origem || op.parceiro_origem}</TableCell>
                  <TableCell>
                    {op.empresa_destino || 
                     (op.parceiros_destino && op.parceiros_destino.length > 0 
                      ? op.parceiros_destino.join(', ') 
                      : '-')}
                  </TableCell>
                  <TableCell>{op.nome_empresa_lead}</TableCell>
                  <TableCell>
                    <span className={
                      op.status === 'Concluída' ? 'text-green-600' :
                      op.status === 'Em andamento' ? 'text-blue-600' :
                      op.status === 'Cancelada' ? 'text-red-600' :
                      'text-yellow-600'
                    }>
                      {op.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link to={`/opportunities/${op.id_oportunidade}`}>
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
