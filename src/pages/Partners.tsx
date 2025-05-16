import { useState, useEffect } from 'react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ParceiroExterno } from '@/integrations/supabase/types';

export default function Partners() {
  const [parceiros, setParceiros] = useState<ParceiroExterno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParceiros, setFilteredParceiros] = useState<ParceiroExterno[]>([]);
  const { toast } = useToast();
  
  // Form state for new partner
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerNotes, setNewPartnerNotes] = useState('');
  
  // Form state for editing partner
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [editPartnerName, setEditPartnerName] = useState('');
  const [editPartnerEmail, setEditPartnerEmail] = useState('');
  const [editPartnerPhone, setEditPartnerPhone] = useState('');
  const [editPartnerNotes, setEditPartnerNotes] = useState('');
  
  // Confirmation dialog for deletion
  const [partnerToDelete, setPartnerToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = parceiros.filter(
        p => p.nome_parceiro.toLowerCase().includes(term) || 
             (p.email_contato && p.email_contato.toLowerCase().includes(term)) ||
             (p.telefone_contato && p.telefone_contato.toLowerCase().includes(term))
      );
      setFilteredParceiros(filtered);
    } else {
      setFilteredParceiros(parceiros);
    }
  }, [searchTerm, parceiros]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('parceiros_externos')
        .select('*')
        .order('nome_parceiro');
      
      if (error) throw error;
      
      setParceiros(data || []);
      setFilteredParceiros(data || []);
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de parceiros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePartner = async () => {
    if (!newPartnerName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do parceiro é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('parceiros_externos')
        .insert({
          nome_parceiro: newPartnerName,
          email_contato: newPartnerEmail || null,
          telefone_contato: newPartnerPhone || null,
          observacoes: newPartnerNotes || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Parceiro adicionado com sucesso!",
      });
      
      // Reset form
      setNewPartnerName('');
      setNewPartnerEmail('');
      setNewPartnerPhone('');
      setNewPartnerNotes('');
      
      // Refresh list
      fetchPartners();
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o parceiro.",
        variant: "destructive",
      });
    }
  };

  const handleEditPartner = async () => {
    if (!editingPartnerId) return;
    
    if (!editPartnerName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do parceiro é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('parceiros_externos')
        .update({
          nome_parceiro: editPartnerName,
          email_contato: editPartnerEmail || null,
          telefone_contato: editPartnerPhone || null,
          observacoes: editPartnerNotes || null
        })
        .eq('id_parceiro_externo', editingPartnerId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso!",
      });
      
      // Reset form and state
      setEditingPartnerId(null);
      
      // Refresh list
      fetchPartners();
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o parceiro.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;

    try {
      // First check if the partner is used in any opportunity
      const { data: oportunidadesOrigem } = await supabase
        .from('oportunidades')
        .select('id_oportunidade')
        .eq('id_parceiro_origem_externo', partnerToDelete);
      
      const { data: oportunidadesDestino } = await supabase
        .from('oportunidades_parceiros_destino_externo')
        .select('id_oportunidade')
        .eq('id_parceiro_destino_externo', partnerToDelete);
      
      if ((oportunidadesOrigem && oportunidadesOrigem.length > 0) || 
          (oportunidadesDestino && oportunidadesDestino.length > 0)) {
        toast({
          title: "Não é possível excluir",
          description: "Este parceiro está vinculado a uma ou mais oportunidades.",
          variant: "destructive",
        });
        setPartnerToDelete(null);
        return;
      }
      
      // If not used, proceed with deletion
      const { error } = await supabase
        .from('parceiros_externos')
        .delete()
        .eq('id_parceiro_externo', partnerToDelete);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Parceiro excluído com sucesso!",
      });
      
      // Reset state
      setPartnerToDelete(null);
      
      // Refresh list
      fetchPartners();
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o parceiro.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (partner: ParceiroExterno) => {
    setEditingPartnerId(partner.id_parceiro_externo);
    setEditPartnerName(partner.nome_parceiro);
    setEditPartnerEmail(partner.email_contato || '');
    setEditPartnerPhone(partner.telefone_contato || '');
    setEditPartnerNotes(partner.observacoes || '');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parceiros Externos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Adicionar Parceiro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Parceiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Nome do Parceiro *</Label>
                <Input
                  id="partnerName"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="Nome da empresa parceira"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partnerEmail">Email de Contato</Label>
                <Input
                  id="partnerEmail"
                  type="email"
                  value={newPartnerEmail}
                  onChange={(e) => setNewPartnerEmail(e.target.value)}
                  placeholder="Email de contato"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partnerPhone">Telefone de Contato</Label>
                <Input
                  id="partnerPhone"
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                  placeholder="Telefone de contato"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partnerNotes">Observações</Label>
                <Input
                  id="partnerNotes"
                  value={newPartnerNotes}
                  onChange={(e) => setNewPartnerNotes(e.target.value)}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleCreatePartner}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar parceiros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Carregando parceiros...
                </TableCell>
              </TableRow>
            ) : filteredParceiros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhum parceiro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredParceiros.map((partner) => (
                <TableRow key={partner.id_parceiro_externo}>
                  <TableCell className="font-medium">{partner.nome_parceiro}</TableCell>
                  <TableCell>{partner.email_contato || '-'}</TableCell>
                  <TableCell>{partner.telefone_contato || '-'}</TableCell>
                  <TableCell>{partner.observacoes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(partner)}>
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Parceiro</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="editPartnerName">Nome do Parceiro *</Label>
                              <Input
                                id="editPartnerName"
                                value={editPartnerName}
                                onChange={(e) => setEditPartnerName(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="editPartnerEmail">Email de Contato</Label>
                              <Input
                                id="editPartnerEmail"
                                type="email"
                                value={editPartnerEmail}
                                onChange={(e) => setEditPartnerEmail(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="editPartnerPhone">Telefone de Contato</Label>
                              <Input
                                id="editPartnerPhone"
                                value={editPartnerPhone}
                                onChange={(e) => setEditPartnerPhone(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="editPartnerNotes">Observações</Label>
                              <Input
                                id="editPartnerNotes"
                                value={editPartnerNotes}
                                onChange={(e) => setEditPartnerNotes(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleEditPartner}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={partnerToDelete === partner.id_parceiro_externo} onOpenChange={(open) => {
                        if (!open) setPartnerToDelete(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setPartnerToDelete(partner.id_parceiro_externo)}
                          >
                            Excluir
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                          </DialogHeader>
                          <p>Tem certeza que deseja excluir o parceiro "{partner.nome_parceiro}"? Esta ação não pode ser desfeita.</p>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setPartnerToDelete(null)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeletePartner}>
                              Excluir
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
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
