import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  getOportunidadeById, 
  updateOportunidade, 
  addObservacaoOportunidade,
  deleteOportunidade
} from '@/services/oportunidades.service';
import { OportunidadeCompleta } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [oportunidade, setOportunidade] = useState<OportunidadeCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [empresasGrupo, setEmpresasGrupo] = useState<{id_empresa_grupo: number, nome_empresa: string}[]>([]);
  const [parceirosExternos, setParceirosExternos] = useState<{id_parceiro_externo: number, nome_parceiro: string}[]>([]);
  const [statusOptions, setStatusOptions] = useState<{id_status: number, nome_status: string}[]>([]);
  const [novaObservacao, setNovaObservacao] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    tipo_oportunidade: '',
    data_envio_recebimento: new Date(),
    id_empresa_origem_grupo: null as number | null,
    id_empresa_destino_grupo: null as number | null,
    id_parceiro_origem_externo: null as number | null,
    parceiros_destino_ids: [] as number[],
    nome_empresa_lead: '',
    nome_contato_lead: '',
    email_lead: '',
    telefone_lead: '',
    id_status_atual: null as number | null,
    descricao_servicos: '',
    nome_projeto: '',
    valor_proposta_mensal: null as number | null,
    numero_aportes: null as number | null,
    valor_total_projeto: null as number | null,
    quarter_oportunidade: null as string | null,
    mes_oportunidade: null as number | null,
    ano_oportunidade: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch opportunity details
        if (id) {
          const opportunityData = await getOportunidadeById(Number(id));
          if (!opportunityData) {
            toast({
              title: "Erro",
              description: "Oportunidade não encontrada.",
              variant: "destructive",
            });
            navigate('/opportunities');
            return;
          }
          setOportunidade(opportunityData);
          
          // Initialize form data
          setFormData({
            tipo_oportunidade: opportunityData.tipo_oportunidade,
            data_envio_recebimento: new Date(opportunityData.data_envio_recebimento),
            id_empresa_origem_grupo: opportunityData.empresa_origem ? 
              (await getEmpresaIdByName(opportunityData.empresa_origem)) : null,
            id_empresa_destino_grupo: opportunityData.empresa_destino ? 
              (await getEmpresaIdByName(opportunityData.empresa_destino)) : null,
            id_parceiro_origem_externo: opportunityData.parceiro_origem ? 
              (await getParceiroIdByName(opportunityData.parceiro_origem)) : null,
            parceiros_destino_ids: opportunityData.parceiros_destino ? 
              await Promise.all(opportunityData.parceiros_destino.map(p => getParceiroIdByName(p))) : [],
            nome_empresa_lead: opportunityData.nome_empresa_lead,
            nome_contato_lead: opportunityData.nome_contato_lead || '',
            email_lead: opportunityData.email_lead || '',
            telefone_lead: opportunityData.telefone_lead || '',
            id_status_atual: await getStatusIdByName(opportunityData.status),
            descricao_servicos: opportunityData.descricao_servicos || '',
            nome_projeto: opportunityData.nome_projeto || '',
            valor_proposta_mensal: opportunityData.valor_proposta_mensal,
            numero_aportes: opportunityData.numero_aportes,
            valor_total_projeto: opportunityData.valor_total_projeto,
            quarter_oportunidade: opportunityData.quarter_oportunidade,
            mes_oportunidade: opportunityData.mes_oportunidade,
            ano_oportunidade: opportunityData.ano_oportunidade,
          });
        }
        
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
        if (status) setStatusOptions(status);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da oportunidade.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  const getEmpresaIdByName = async (nome: string): Promise<number | null> => {
    const { data } = await supabase
      .from('empresas_grupo')
      .select('id_empresa_grupo')
      .eq('nome_empresa', nome)
      .single();
    return data?.id_empresa_grupo || null;
  };

  const getParceiroIdByName = async (nome: string): Promise<number> => {
    const { data } = await supabase
      .from('parceiros_externos')
      .select('id_parceiro_externo')
      .eq('nome_parceiro', nome)
      .single();
    return data?.id_parceiro_externo || 0;
  };

  const getStatusIdByName = async (nome: string): Promise<number | null> => {
    const { data } = await supabase
      .from('status_oportunidade')
      .select('id_status')
      .eq('nome_status', nome)
      .single();
    return data?.id_status || null;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      if (!id) return;
      
      // Prepare data based on opportunity type
      const oportunidadeData: any = {
        tipo_oportunidade: formData.tipo_oportunidade,
        data_envio_recebimento: formData.data_envio_recebimento.toISOString(),
        id_status_atual: formData.id_status_atual,
        descricao_servicos: formData.descricao_servicos,
        nome_projeto: formData.nome_projeto,
        valor_proposta_mensal: formData.valor_proposta_mensal,
        numero_aportes: formData.numero_aportes,
        valor_total_projeto: formData.valor_total_projeto,
        quarter_oportunidade: formData.quarter_oportunidade,
        mes_oportunidade: formData.mes_oportunidade,
        ano_oportunidade: formData.ano_oportunidade
      };

      // Set origin and destination based on type
      if (formData.tipo_oportunidade === 'intragrupo') {
        oportunidadeData.id_empresa_origem_grupo = formData.id_empresa_origem_grupo;
        oportunidadeData.id_empresa_destino_grupo = formData.id_empresa_destino_grupo;
        oportunidadeData.id_parceiro_origem_externo = null;
      } else if (formData.tipo_oportunidade === 'externa_entrada') {
        oportunidadeData.id_parceiro_origem_externo = formData.id_parceiro_origem_externo;
        oportunidadeData.id_empresa_destino_grupo = formData.id_empresa_destino_grupo;
        oportunidadeData.id_empresa_origem_grupo = null;
      } else if (formData.tipo_oportunidade === 'externa_saida') {
        oportunidadeData.id_empresa_origem_grupo = formData.id_empresa_origem_grupo;
        oportunidadeData.id_empresa_destino_grupo = null;
        oportunidadeData.id_parceiro_origem_externo = null;
        // parceiro_destino is handled separately
      }

      const leadData = {
        nome_empresa_lead: formData.nome_empresa_lead,
        nome_contato_lead: formData.nome_contato_lead,
        email_lead: formData.email_lead,
        telefone_lead: formData.telefone_lead
      };

      // Update the opportunity
      await updateOportunidade(
        Number(id),
        oportunidadeData,
        leadData,
        formData.tipo_oportunidade === 'externa_saida' ? formData.parceiros_destino_ids : undefined
      );

      // Refresh the data
      const updatedOportunidade = await getOportunidadeById(Number(id));
      setOportunidade(updatedOportunidade);
      
      setIsEditing(false);
      
      toast({
        title: "Sucesso",
        description: "Oportunidade atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar oportunidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a oportunidade.",
        variant: "destructive",
      });
    }
  };

  const handleAddObservacao = async () => {
    if (!id || !novaObservacao.trim()) return;
    
    try {
      await addObservacaoOportunidade(
        Number(id),
        1, // Assuming a default user ID
        novaObservacao
      );
      
      // Refresh the data
      const updatedOportunidade = await getOportunidadeById(Number(id));
      setOportunidade(updatedOportunidade);
      
      setNovaObservacao('');
      
      toast({
        title: "Sucesso",
        description: "Observação adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar observação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a observação.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!id) return;
    
    try {
      await deleteOportunidade(Number(id));
      
      toast({
        title: "Sucesso",
        description: "Oportunidade excluída com sucesso!",
      });
      
      navigate('/opportunities');
    } catch (error) {
      console.error('Erro ao excluir oportunidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a oportunidade.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-screen">
        <p>Carregando detalhes da oportunidade...</p>
      </div>
    );
  }

  if (!oportunidade) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Oportunidade não encontrada</h1>
        <Button onClick={() => navigate('/opportunities')}>Voltar para Oportunidades</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Oportunidade #{oportunidade.id_oportunidade}
        </h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveChanges}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/opportunities')}>
                Voltar
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Excluir</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar exclusão</DialogTitle>
                  </DialogHeader>
                  <p>Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteOpportunity}>
                      Excluir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="project">Projeto</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Tipo de Oportunidade</Label>
                      <Select
                        value={formData.tipo_oportunidade}
                        onValueChange={(value) => handleInputChange('tipo_oportunidade', value)}
                        disabled
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intragrupo">Intragrupo</SelectItem>
                          <SelectItem value="externa_entrada">Externa (Entrada)</SelectItem>
                          <SelectItem value="externa_saida">Externa (Saída)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Data de Envio/Recebimento</Label>
                      <DatePicker
                        date={formData.data_envio_recebimento}
                        setDate={(date) => handleInputChange('data_envio_recebimento', date)}
                      />
                    </div>
                    
                    {formData.tipo_oportunidade === 'intragrupo' && (
                      <>
                        <div className="space-y-2">
                          <Label>Empresa de Origem</Label>
                          <Select
                            value={formData.id_empresa_origem_grupo?.toString() || ""}
                            onValueChange={(value) => handleInputChange('id_empresa_origem_grupo', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label>Empresa de Destino</Label>
                          <Select
                            value={formData.id_empresa_destino_grupo?.toString() || ""}
                            onValueChange={(value) => handleInputChange('id_empresa_destino_grupo', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                      </>
                    )}
                    
                    {formData.tipo_oportunidade === 'externa_entrada' && (
                      <>
                        <div className="space-y-2">
                          <Label>Parceiro de Origem</Label>
                          <Select
                            value={formData.id_parceiro_origem_externo?.toString() || ""}
                            onValueChange={(value) => handleInputChange('id_parceiro_origem_externo', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label>Empresa de Destino</Label>
                          <Select
                            value={formData.id_empresa_destino_grupo?.toString() || ""}
                            onValueChange={(value) => handleInputChange('id_empresa_destino_grupo', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                      </>
                    )}
                    
                    {formData.tipo_oportunidade === 'externa_saida' && (
                      <>
                        <div className="space-y-2">
                          <Label>Empresa de Origem</Label>
                          <Select
                            value={formData.id_empresa_origem_grupo?.toString() || ""}
                            onValueChange={(value) => handleInputChange('id_empresa_origem_grupo', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label>Parceiro de Destino</Label>
                          <Select
                            value={formData.parceiros_destino_ids[0]?.toString() || ""}
                            onValueChange={(value) => handleInputChange('parceiros_destino_ids', [Number(value)])}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.id_status_atual?.toString() || ""}
                        onValueChange={(value) => handleInputChange('id_status_atual', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                        <p>
                          {oportunidade.tipo_oportunidade === 'intragrupo' ? 'Intragrupo' : 
                           oportunidade.tipo_oportunidade === 'externa_entrada' ? 'Externa (Entrada)' : 
                           'Externa (Saída)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data</p>
                        <p>{new Date(oportunidade.data_envio_recebimento).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Origem</p>
                        <p>{oportunidade.empresa_origem || oportunidade.parceiro_origem}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Destino</p>
                        <p>
                          {oportunidade.empresa_destino || 
                           (oportunidade.parceiros_destino && oportunidade.parceiros_destino.length > 0 
                            ? oportunidade.parceiros_destino.join(', ') 
                            : '-')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                      <p>{oportunidade.nome_responsavel}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className={
                        oportunidade.status === 'Concluída' ? 'text-green-600' :
                        oportunidade.status === 'Em andamento' ? 'text-blue-600' :
                        oportunidade.status === 'Cancelada' ? 'text-red-600' :
                        'text-yellow-600'
                      }>
                        {oportunidade.status}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informações do Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Nome da Empresa</Label>
                      <Input
                        value={formData.nome_empresa_lead}
                        onChange={(e) => handleInputChange('nome_empresa_lead', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Nome do Contato</Label>
                      <Input
                        value={formData.nome_contato_lead}
                        onChange={(e) => handleInputChange('nome_contato_lead', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email_lead}
                        onChange={(e) => handleInputChange('email_lead', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={formData.telefone_lead}
                        onChange={(e) => handleInputChange('telefone_lead', e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                      <p>{oportunidade.nome_empresa_lead}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contato</p>
                      <p>{oportunidade.nome_contato_lead || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{oportunidade.email_lead || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <p>{oportunidade.telefone_lead || '-'}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {oportunidade.observacoes && oportunidade.observacoes.length > 0 ? (
                    oportunidade.observacoes.map((obs, index) => (
                      <div key={index} className="p-3 bg-muted rounded-md">
                        <p>{obs}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma observação registrada.</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Adicionar nova observação..."
                    value={novaObservacao}
                    onChange={(e) => setNovaObservacao(e.target.value)}
                  />
                  <Button onClick={handleAddObservacao}>Adicionar</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p>{oportunidade.id_oportunidade}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                    <p>{new Date(oportunidade.data_criacao).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última Modificação</p>
                    <p>{oportunidade.data_ultima_modificacao ? new Date(oportunidade.data_ultima_modificacao).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="project">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Nome do Projeto</Label>
                    <Input
                      value={formData.nome_projeto}
                      onChange={(e) => handleInputChange('nome_projeto', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Descrição dos Serviços</Label>
                    <Textarea
                      value={formData.descricao_servicos}
                      onChange={(e) => handleInputChange('descricao_servicos', e.target.value)}
                      rows={5}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quarter</Label>
                      <Select
                        value={formData.quarter_oportunidade || ""}
                        onValueChange={(value) => handleInputChange('quarter_oportunidade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          <SelectItem value="Q1">Q1</SelectItem>
                          <SelectItem value="Q2">Q2</SelectItem>
                          <SelectItem value="Q3">Q3</SelectItem>
                          <SelectItem value="Q4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Mês</Label>
                      <Select
                        value={formData.mes_oportunidade?.toString() || ""}
                        onValueChange={(value) => handleInputChange('mes_oportunidade', value ? Number(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
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
                      <Label>Ano</Label>
                      <Input
                        type="number"
                        value={formData.ano_oportunidade?.toString() || ""}
                        onChange={(e) => handleInputChange('ano_oportunidade', e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome do Projeto</p>
                    <p>{oportunidade.nome_projeto || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Descrição dos Serviços</p>
                    <p className="whitespace-pre-line">{oportunidade.descricao_servicos || '-'}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quarter</p>
                      <p>{oportunidade.quarter_oportunidade || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mês</p>
                      <p>{oportunidade.mes_oportunidade ? new Date(0, oportunidade.mes_oportunidade - 1).toLocaleString('pt-BR', { month: 'long' }) : '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ano</p>
                      <p>{oportunidade.ano_oportunidade || '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Valor da Proposta Mensal (R$)</Label>
                    <Input
                      type="number"
                      value={formData.valor_proposta_mensal?.toString() || ""}
                      onChange={(e) => handleInputChange('valor_proposta_mensal', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Número de Aportes</Label>
                    <Input
                      type="number"
                      value={formData.numero_aportes?.toString() || ""}
                      onChange={(e) => handleInputChange('numero_aportes', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Valor Total do Projeto (R$)</Label>
                    <Input
                      type="number"
                      value={formData.valor_total_projeto?.toString() || ""}
                      onChange={(e) => handleInputChange('valor_total_projeto', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor da Proposta Mensal</p>
                    <p>{oportunidade.valor_proposta_mensal ? `R$ ${oportunidade.valor_proposta_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Número de Aportes</p>
                    <p>{oportunidade.numero_aportes || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total do Projeto</p>
                    <p>{oportunidade.valor_total_projeto ? `R$ ${oportunidade.valor_total_projeto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
