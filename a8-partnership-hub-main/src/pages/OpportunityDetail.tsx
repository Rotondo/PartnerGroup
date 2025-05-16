import React, { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Edit, Mail, Phone, Paperclip, Calendar, FileText, AlertTriangle, Download, Upload, Trash2, Loader2 } from "lucide-react"; // Adicionado Upload, Trash2, Loader2
// import { mockOpportunities, statusOptions as mockStatusOptions } from "@/data/mockData"; // Removido mockStatusOptions
import { supabase } from "@/integrations/supabase/client"; // Adicionado
import { Oportunidade, StatusOportunidade, HistoricoAlteracoesOportunidade, ObservacaoOportunidade, AnexoOportunidade, Lead } from "@/types"; // Ajustado e adicionado tipos
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Função para formatar data
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Oportunidade | null>(null);
  const [history, setHistory] = useState<HistoricoAlteracoesOportunidade[]>([]);
  const [notes, setNotes] = useState<ObservacaoOportunidade[]>([]);
  const [attachments, setAttachments] = useState<AnexoOportunidade[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOportunidade[]>([]); 

  const [loading, setLoading] = useState(true);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatusId, setNewStatusId] = useState<number | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isConfirmDeleteAttachmentOpen, setIsConfirmDeleteAttachmentOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<AnexoOportunidade | null>(null);

  const fetchOpportunityDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch Oportunidade
      const { data: oppData, error: oppError } = await supabase
        .from("oportunidades")
        .select(`
          *,
          leads (*),
          empresas_grupo_origem:empresa_origem_id (id, nome),
          empresas_grupo_destino:empresa_destino_id (id, nome),
          parceiros_externos:parceiro_externo_id (id, nome),
          status_oportunidade:status_id (id, nome),
          usuarios:id_responsavel_envio_recebimento (id, nome_completo)
        `)
        .eq("id", parseInt(id))
        .single();

      if (oppError) throw oppError;
      setOpportunity(oppData as Oportunidade);

      // Fetch Histórico
      const { data: histData, error: histError } = await supabase
        .from("historico_alteracoes_oportunidade")
        .select("*, usuarios:id_usuario_modificacao (nome_completo)")
        .eq("oportunidade_id", parseInt(id))
        .order("data_modificacao", { ascending: false });
      if (histError) throw histError;
      setHistory(histData || []);

      // Fetch Observações
      const { data: notesData, error: notesError } = await supabase
        .from("observacoes_oportunidade")
        .select("*, usuarios:id_usuario (nome_completo)")
        .eq("oportunidade_id", parseInt(id))
        .order("data_criacao", { ascending: false });
      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Fetch Anexos
      const { data: attachData, error: attachError } = await supabase
        .from("anexos_oportunidade")
        .select("*, usuarios:id_usuario_upload (nome_completo)")
        .eq("oportunidade_id", parseInt(id))
        .order("data_upload", { ascending: false });
      if (attachError) throw attachError;
      setAttachments(attachData || []);

      // Fetch Status Options
      const { data: statusData, error: statusErr } = await supabase.from("status_oportunidade").select("*");
      if (statusErr) throw statusErr;
      setStatusOptions(statusData || []);

    } catch (error) {
      console.error("Erro ao buscar detalhes da oportunidade:", error);
      toast.error("Falha ao carregar detalhes da oportunidade.");
      setOpportunity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOpportunityDetails();
  }, [fetchOpportunityDetails]);

  const handleStatusUpdate = async () => {
    if (!newStatusId || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    const oldStatusName = opportunity.status_oportunidade?.nome || "Desconhecido";
    const newStatusObj = statusOptions.find(s => s.id === newStatusId);
    const newStatusName = newStatusObj?.nome || "Desconhecido";

    try {
      // 1. Atualizar Oportunidade
      const { error: updateError } = await supabase
        .from("oportunidades")
        .update({ status_id: newStatusId })
        .eq("id", opportunity.id);
      if (updateError) throw updateError;

      // 2. Adicionar ao Histórico
      const { error: historyError } = await supabase
        .from("historico_alteracoes_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario_modificacao: userData.user.id,
          campo_modificado: "status_id",
          valor_anterior: opportunity.status_id?.toString() || null,
          valor_novo: newStatusId.toString(),
          descricao_modificacao: `Status alterado de '${oldStatusName}' para '${newStatusName}'`
        });
      if (historyError) throw historyError;

      toast.success(`Status da oportunidade atualizado para ${newStatusName}`);
      setStatusUpdateOpen(false);
      setNewStatusId(null);
      fetchOpportunityDetails(); // Recarregar dados
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(`Falha ao atualizar status: ${error.message}`);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    try {
      // 1. Adicionar Observação
      const { error: noteError } = await supabase
        .from("observacoes_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario: userData.user.id,
          conteudo: newNoteContent,
        });
      if (noteError) throw noteError;

      // 2. Adicionar ao Histórico (opcional, mas bom para rastreabilidade)
      const { error: historyError } = await supabase
        .from("historico_alteracoes_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario_modificacao: userData.user.id,
          campo_modificado: "observacao",
          descricao_modificacao: "Nova observação adicionada.",
          valor_novo: newNoteContent.substring(0, 255) // Limitar para o campo de histórico
        });
      // Não tratar erro de histórico como crítico para a nota
      if (historyError) console.warn("Erro ao adicionar nota ao histórico:", historyError);

      toast.success("Nota adicionada com sucesso");
      setAddNoteOpen(false);
      setNewNoteContent("");
      fetchOpportunityDetails(); // Recarregar dados
    } catch (error: any) {
      console.error("Erro ao adicionar nota:", error);
      toast.error(`Falha ao adicionar nota: ${error.message}`);
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    setUploadingFile(true);
    try {
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `oportunidade_${opportunity.id}/${fileName}`;

      // 1. Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("anexos_oportunidades") // Nome do seu bucket
        .upload(filePath, fileToUpload);
      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from("anexos_oportunidades")
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Não foi possível obter a URL pública do arquivo.");
      }

      // 3. Adicionar registro na tabela anexos_oportunidade
      const { error: dbError } = await supabase
        .from("anexos_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario_upload: userData.user.id,
          nome_arquivo: fileToUpload.name,
          url_arquivo: publicUrlData.publicUrl,
          tipo_arquivo: fileToUpload.type,
          tamanho_arquivo: fileToUpload.size,
          path_storage: filePath // Guardar o path para facilitar a exclusão
        });
      if (dbError) throw dbError;

      // 4. Adicionar ao Histórico
      await supabase.from("historico_alteracoes_oportunidade").insert({
        oportunidade_id: opportunity.id,
        id_usuario_modificacao: userData.user.id,
        campo_modificado: "anexo",
        descricao_modificacao: `Anexo '${fileToUpload.name}' adicionado.`,
      });

      toast.success("Arquivo enviado com sucesso!");
      setFileToUpload(null);
      fetchOpportunityDetails(); // Recarregar
    } catch (error: any) {
      console.error("Erro no upload do arquivo:", error);
      toast.error(`Falha no upload: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async () => {
    if (!attachmentToDelete || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    try {
      // 1. Deletar do Supabase Storage
      if (attachmentToDelete.path_storage) {
        const { error: storageError } = await supabase.storage
          .from("anexos_oportunidades")
          .remove([attachmentToDelete.path_storage]);
        if (storageError) console.warn("Erro ao deletar arquivo do storage, pode já ter sido removido:", storageError);
      }

      // 2. Deletar da tabela anexos_oportunidade
      const { error: dbError } = await supabase
        .from("anexos_oportunidade")
        .delete()
        .eq("id", attachmentToDelete.id);
      if (dbError) throw dbError;

      // 3. Adicionar ao Histórico
      await supabase.from("historico_alteracoes_oportunidade").insert({
        oportunidade_id: opportunity.id,
        id_usuario_modificacao: userData.user.id,
        campo_modificado: "anexo",
        descricao_modificacao: `Anexo '${attachmentToDelete.nome_arquivo}' removido.`,
      });

      toast.success("Anexo removido com sucesso!");
      fetchOpportunityDetails(); // Recarregar
    } catch (error: any) {
      console.error("Erro ao remover anexo:", error);
      toast.error(`Falha ao remover anexo: ${error.message}`);
    } finally {
      setIsConfirmDeleteAttachmentOpen(false);
      setAttachmentToDelete(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full p-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando detalhes da oportunidade...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!opportunity) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oportunidade Não Encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A oportunidade que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={() => navigate("/opportunities")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Oportunidades
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getOpportunityTypeLabel = (type: string | undefined) => {
    if (!type) return "Indefinido";
    const labels: Record<string, string> = {
      intragrupo: "Oportunidade Intragrupo",
      externa_entrada: "Oportunidade Externa Recebida",
      externa_saida: "Oportunidade Externa Enviada",
    };
    return labels[type] || type;
  };

  const getStatusColor = (statusName: string | undefined) => {
    if (!statusName) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    const lowerStatus = statusName.toLowerCase();
    if (lowerStatus.includes("nova")) return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    if (lowerStatus.includes("andamento")) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    if (lowerStatus.includes("ganha")) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (lowerStatus.includes("perdida")) return "bg-red-100 text-red-800 hover:bg-red-100";
    if (lowerStatus.includes("espera")) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/opportunities")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Oportunidades
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h1 className="text-3xl font-bold text-aeight-dark cursor-help">
                    {opportunity.leads?.nome_empresa || "Empresa Cliente N/A"}
                  </h1>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nome da empresa cliente para esta oportunidade.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-aeight-blue/10 text-aeight-blue hover:bg-aeight-blue/10">
                      {getOpportunityTypeLabel(opportunity.tipo_oportunidade)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tipo de oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={getStatusColor(opportunity.status_oportunidade?.nome)}
                    >
                      {opportunity.status_oportunidade?.nome || "Status N/A"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Status atual da oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-muted-foreground">
                Criada em: {formatDate(opportunity.data_envio)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Atualizar Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar Status</DialogTitle>
                  <DialogDescription>
                    Altere o status desta oportunidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="status_id_update" className="mb-2 block">
                    Novo Status
                  </Label>
                  <Select
                    value={newStatusId?.toString() || ""}
                    onValueChange={(value) => setNewStatusId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="status_id_update" className="w-full">
                      <SelectValue placeholder="Selecione status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => { setStatusUpdateOpen(false); setNewStatusId(null); }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={!newStatusId}>
                    Atualizar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Adicionar Observação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Observação</DialogTitle>
                  <DialogDescription>
                    Adicione uma observação a esta oportunidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Digite suas observações aqui..."
                    rows={5}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setAddNoteOpen(false); setNewNoteContent("");}}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddNote} disabled={!newNoteContent.trim()}>
                    Adicionar Observação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="mt-6">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="notes">Observações ({notes.length})</TabsTrigger>
          <TabsTrigger value="attachments">Anexos ({attachments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Detalhes da Oportunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Informações Básicas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div><p className="text-xs text-muted-foreground">Empresa Cliente (Lead)</p><p>{opportunity.leads?.nome_empresa || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Data de Criação</p><p>{formatDate(opportunity.data_envio)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Tipo</p><p>{getOpportunityTypeLabel(opportunity.tipo_oportunidade)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Responsável</p><p>{opportunity.usuarios?.nome_completo || "-"}</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Detalhes da Parceria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {opportunity.tipo_oportunidade === "intragrupo" && (
                    <>
                      <div><p className="text-xs text-muted-foreground">Empresa de Origem (A&eight)</p><p>{opportunity.empresas_grupo_origem?.nome || "-"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Empresa de Destino (A&eight)</p><p>{opportunity.empresas_grupo_destino?.nome || "-"}</p></div>
                    </>
                  )}
                  {opportunity.tipo_oportunidade === "externa_entrada" && (
                    <>
                      <div><p className="text-xs text-muted-foreground">Parceiro Externo (Origem)</p><p>{opportunity.parceiros_externos?.nome || "-"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Empresa de Destino (A&eight)</p><p>{opportunity.empresas_grupo_destino?.nome || "-"}</p></div>
                    </>
                  )}
                  {opportunity.tipo_oportunidade === "externa_saida" && (
                    <>
                      <div><p className="text-xs text-muted-foreground">Empresa de Origem (A&eight)</p><p>{opportunity.empresas_grupo_origem?.nome || "-"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Parceiro Externo (Destino)</p><p>{opportunity.parceiros_externos?.nome || "-"}</p></div>
                       {/* TODO: Se houver múltiplos parceiros, listar aqui */}
                    </>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Informações de Contato (Lead)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div><p className="text-xs text-muted-foreground">Nome do Contato</p><p>{opportunity.leads?.nome_contato || "-"}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center"><Mail className="w-3 h-3 mr-1" /> Email</p>
                    <p>{opportunity.leads?.email ? <a href={`mailto:${opportunity.leads.email}`} className="text-primary hover:underline">{opportunity.leads.email}</a> : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center"><Phone className="w-3 h-3 mr-1" /> Telefone</p>
                    <p>{opportunity.leads?.telefone || "-"}</p>
                  </div>
                </div>
              </div>
              {opportunity.observacoes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Observações Iniciais da Oportunidade</h3>
                    <p className="text-sm whitespace-pre-wrap">{opportunity.observacoes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>Acompanhe todas as modificações feitas nesta oportunidade.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma alteração registrada.</p>
              ) : (
                <ul className="space-y-4">
                  {history.map((entry) => (
                    <li key={entry.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{entry.descricao_modificacao}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(entry.data_modificacao)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Por: {entry.usuarios?.nome_completo || "Sistema"}</p>
                      {entry.campo_modificado && (entry.valor_anterior || entry.valor_novo) && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Campo:</span> {entry.campo_modificado} | 
                          <span className="text-muted-foreground"> De:</span> {entry.valor_anterior || "N/A"} |
                          <span className="text-muted-foreground"> Para:</span> {entry.valor_novo || "N/A"}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Observações Adicionais</CardTitle>
              <CardDescription>Notas e comentários sobre esta oportunidade.</CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma observação adicional registrada.</p>
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => (
                    <li key={note.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm whitespace-pre-wrap mb-1">{note.conteudo}</p>
                      <div className="text-xs text-muted-foreground">
                        <span>Por: {note.usuarios?.nome_completo || "Sistema"}</span> - <span>{formatDate(note.data_criacao)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Anexos</CardTitle>
                <CardDescription>Arquivos relacionados a esta oportunidade.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2"/>Adicionar Anexo</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Anexo</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="file-upload">Selecione o arquivo</Label>
                        <Input id="file-upload" type="file" onChange={handleFileSelected} />
                        {fileToUpload && <p className="text-sm text-muted-foreground">Arquivo selecionado: {fileToUpload.name}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFileToUpload(null)}>Cancelar</Button>
                        <Button onClick={handleFileUpload} disabled={!fileToUpload || uploadingFile}>
                            {uploadingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar Arquivo
                        </Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-muted-foreground">Nenhum anexo encontrado.</p>
              ) : (
                <ul className="space-y-3">
                  {attachments.map((att) => (
                    <li key={att.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                      <div className="flex items-center">
                        <Paperclip className="w-4 h-4 mr-3 text-muted-foreground" />
                        <div>
                          <a href={att.url_arquivo} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                            {att.nome_arquivo}
                          </a>
                          <p className="text-xs text-muted-foreground">
                            Enviado por: {att.usuarios?.nome_completo || "Sistema"} em {formatDate(att.data_upload)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tamanho: {att.tamanho_arquivo ? (att.tamanho_arquivo / 1024).toFixed(2) : "N/A"} KB | Tipo: {att.tipo_arquivo || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={att.url_arquivo} target="_blank" rel="noopener noreferrer" download={att.nome_arquivo}>
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Baixar</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setAttachmentToDelete(att); setIsConfirmDeleteAttachmentOpen(true); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Remover Anexo</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isConfirmDeleteAttachmentOpen} onOpenChange={setIsConfirmDeleteAttachmentOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja remover o anexo "{attachmentToDelete?.nome_arquivo}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAttachmentToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAttachment} className="bg-destructive hover:bg-destructive/90">Confirmar Exclusão</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
};

export default OpportunityDetail;
Name="h-4 w-4 mr-1" /> Email
                            </span>
                          </p>
                          <p>
                            <a
                              href={`mailto:${opportunity.contactEmail}`}
                              className="text-aeight-blue hover:underline"
                            >
                              {opportunity.contactEmail}
                            </a>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" /> Telefone
                            </span>
                          </p>
                          <p>
                            <a
                              href={`tel:${opportunity.contactPhone}`}
                              className="text-aeight-blue hover:underline"
                            >
                              {opportunity.contactPhone}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Detalhes completos da oportunidade, incluindo informações básicas, detalhes da parceria e dados de contato.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                Notas
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                Histórico
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex-1">
                Anexos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card>
                      <CardContent className="pt-6">
                        {opportunity.notes ? (
                          <div className="whitespace-pre-wrap">{opportunity.notes}</div>
                        ) : (
                          <div className="text-center p-6">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Ainda Sem Notas</h3>
                            <p className="text-muted-foreground mb-4">
                              Nenhuma nota foi adicionada a esta oportunidade ainda
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => setAddNoteOpen(true)}
                            >
                              Adicionar a Primeira Nota
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Anotações e observações importantes sobre esta oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsContent>

            <TabsContent value="history" className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card>
                      <CardContent className="pt-6 pb-2">
                        {opportunity.history.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                            <ol className="space-y-6">
                              {opportunity.history.map((entry, index) => (
                                <li key={entry.id} className="relative pl-10">
                                  <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">
                                      {entry.date} - {entry.user}
                                    </span>
                                    <span className="font-medium">{entry.action}</span>
                                    {entry.previousValue && entry.newValue && (
                                      <div className="text-sm">
                                        Alterado de{" "}
                                        <Badge variant="outline" className={getStatusColor(entry.previousValue as OpportunityStatus)}>
                                          {entry.previousValue}
                                        </Badge>{" "}
                                        para{" "}
                                        <Badge variant="outline" className={getStatusColor(entry.newValue as OpportunityStatus)}>
                                          {entry.newValue}
                                        </Badge>
                                      </div>
                                    )}
                                    {!entry.previousValue && entry.newValue && (
                                      <div className="text-sm mt-2 bg-muted/50 p-2 rounded-md">
                                        {entry.newValue}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Nenhum Histórico Disponível</h3>
                            <p className="text-muted-foreground">
                              O histórico desta oportunidade será registrado aqui
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Histórico completo de todas as alterações e atualizações feitas nesta oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsContent>

            <TabsContent value="attachments" className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card>
                      <CardContent className="pt-6">
                        {opportunity.attachments && opportunity.attachments.length > 0 ? (
                          <div className="space-y-4">
                            {opportunity.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-muted/50 p-2 rounded-md">
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{attachment.name}</p>
                                    <div className="text-xs text-muted-foreground">
                                      {`${(attachment.size / 1024 / 1024).toFixed(2)} MB • 
                                      ${attachment.uploadDate} • 
                                      Enviado por ${attachment.uploadedBy}`}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 mr-1" /> Baixar
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <Paperclip className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Sem Anexos</h3>
                            <p className="text-muted-foreground mb-4">
                              Nenhum arquivo foi anexado a esta oportunidade ainda
                            </p>
                            <Button variant="outline" disabled>
                              Adicionar Anexo
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Arquivos e documentos anexados a esta oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsContent>
          </Tabs>
        </div>

        {/* Coluna Direita - Informações Secundárias */}
        <div className="space-y-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Status Atual</p>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(opportunity.status)} text-base px-4 py-1.5`}
                        >
                          {opportunity.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setStatusUpdateOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Atualizar Status
                    </Button>
                  </CardFooter>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Status atual da oportunidade e opções para atualizá-lo.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle>Ações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" onClick={() => setAddNoteOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" /> Adicionar Nota
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      <Paperclip className="h-4 w-4 mr-2" /> Adicionar Anexo
                    </Button>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ações que podem ser realizadas nesta oportunidade.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
                    <CardDescription>
                      Ações irreversíveis para esta oportunidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Deletar Oportunidade
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem absoluta certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente esta
                            oportunidade e todos os dados associados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              toast.success("Oportunidade excluída com sucesso");
                              navigate("/opportunities");
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Opções de exclusão permanente desta oportunidade. Use com cuidado!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OpportunityDetail;
