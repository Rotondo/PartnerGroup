// src/services/oportunidades.service.ts
import { supabase } from '../integrations/supabase/client';
import type { 
  Oportunidade, 
  OportunidadeCompleta, 
  Lead, 
  EstatisticaOportunidadePorEmpresa,
  EstatisticaParceiroExterno
} from '../integrations/supabase/types';

// Buscar todas as oportunidades com detalhes completos
export const getOportunidadesCompletas = async (): Promise<OportunidadeCompleta[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_oportunidades_completas');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar oportunidades completas:', error);
    throw error;
  }
};

// Buscar uma oportunidade específica por ID
export const getOportunidadeById = async (id: number): Promise<OportunidadeCompleta | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_oportunidades_completas');
    
    if (error) throw error;
    
    const oportunidade = data?.find(op => op.id_oportunidade === id) || null;
    return oportunidade;
  } catch (error) {
    console.error(`Erro ao buscar oportunidade ID ${id}:`, error);
    throw error;
  }
};

// Criar uma nova oportunidade
export const createOportunidade = async (
  oportunidade: Omit<Oportunidade, 'id_oportunidade' | 'data_criacao' | 'data_ultima_modificacao'>,
  lead: Omit<Lead, 'id_lead' | 'data_criacao'>,
  parceirosDestinoIds?: number[]
): Promise<number> => {
  try {
    // 1. Verificar se o lead já existe ou criar um novo
    let leadId: number;
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id_lead')
      .eq('nome_empresa_lead', lead.nome_empresa_lead)
      .maybeSingle();
    
    if (existingLead) {
      leadId = existingLead.id_lead;
    } else {
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert(lead)
        .select('id_lead')
        .single();
      
      if (leadError) throw leadError;
      leadId = newLead.id_lead;
    }
    
    // 2. Criar a oportunidade
    const { data: newOportunidade, error: opError } = await supabase
      .from('oportunidades')
      .insert({
        ...oportunidade,
        id_lead: leadId
      })
      .select('id_oportunidade')
      .single();
    
    if (opError) throw opError;
    const oportunidadeId = newOportunidade.id_oportunidade;
    
    // 3. Se for oportunidade externa_saida e tiver parceiros de destino, adicionar na tabela de junção
    if (oportunidade.tipo_oportunidade === 'externa_saida' && parceirosDestinoIds && parceirosDestinoIds.length > 0) {
      const parceirosDestinoData = parceirosDestinoIds.map(id_parceiro => ({
        id_oportunidade: oportunidadeId,
        id_parceiro_destino_externo: id_parceiro
      }));
      
      const { error: parceirosError } = await supabase
        .from('oportunidades_parceiros_destino_externo')
        .insert(parceirosDestinoData);
      
      if (parceirosError) throw parceirosError;
    }
    
    return oportunidadeId;
  } catch (error) {
    console.error('Erro ao criar oportunidade:', error);
    throw error;
  }
};

// Atualizar uma oportunidade existente
export const updateOportunidade = async (
  id: number,
  oportunidade: Partial<Omit<Oportunidade, 'id_oportunidade' | 'data_criacao' | 'data_ultima_modificacao'>>,
  lead?: Partial<Omit<Lead, 'id_lead' | 'data_criacao'>>,
  parceirosDestinoIds?: number[]
): Promise<void> => {
  try {
    // 1. Buscar a oportunidade atual para obter o id_lead
    const { data: currentOp, error: opError } = await supabase
      .from('oportunidades')
      .select('id_lead, tipo_oportunidade')
      .eq('id_oportunidade', id)
      .single();
    
    if (opError) throw opError;
    
    // 2. Atualizar o lead se necessário
    if (lead && Object.keys(lead).length > 0) {
      const { error: leadError } = await supabase
        .from('leads')
        .update(lead)
        .eq('id_lead', currentOp.id_lead);
      
      if (leadError) throw leadError;
    }
    
    // 3. Atualizar a oportunidade
    const { error: updateError } = await supabase
      .from('oportunidades')
      .update(oportunidade)
      .eq('id_oportunidade', id);
    
    if (updateError) throw updateError;
    
    // 4. Se for oportunidade externa_saida e tiver parceiros de destino, atualizar na tabela de junção
    if ((oportunidade.tipo_oportunidade === 'externa_saida' || currentOp.tipo_oportunidade === 'externa_saida') 
        && parceirosDestinoIds) {
      // Primeiro remover os existentes
      const { error: deleteError } = await supabase
        .from('oportunidades_parceiros_destino_externo')
        .delete()
        .eq('id_oportunidade', id);
      
      if (deleteError) throw deleteError;
      
      // Depois adicionar os novos
      if (parceirosDestinoIds.length > 0) {
        const parceirosDestinoData = parceirosDestinoIds.map(id_parceiro => ({
          id_oportunidade: id,
          id_parceiro_destino_externo: id_parceiro
        }));
        
        const { error: parceirosError } = await supabase
          .from('oportunidades_parceiros_destino_externo')
          .insert(parceirosDestinoData);
        
        if (parceirosError) throw parceirosError;
      }
    }
  } catch (error) {
    console.error(`Erro ao atualizar oportunidade ID ${id}:`, error);
    throw error;
  }
};

// Adicionar uma observação a uma oportunidade
export const addObservacaoOportunidade = async (
  id_oportunidade: number,
  id_usuario_autor: number,
  texto_observacao: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('observacoes_oportunidade')
      .insert({
        id_oportunidade,
        id_usuario_autor,
        texto_observacao
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao adicionar observação:', error);
    throw error;
  }
};

// Buscar estatísticas de oportunidades por empresa
export const getEstatisticasOportunidadesPorEmpresa = async (): Promise<EstatisticaOportunidadePorEmpresa[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_estatisticas_oportunidades_por_empresa');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar estatísticas por empresa:', error);
    throw error;
  }
};

// Buscar estatísticas de parceiros externos
export const getEstatisticasParceirosExternos = async (): Promise<EstatisticaParceiroExterno[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_estatisticas_parceiros_externos');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar estatísticas de parceiros externos:', error);
    throw error;
  }
};

// Excluir uma oportunidade
export const deleteOportunidade = async (id: number): Promise<void> => {
  try {
    // Excluir registros relacionados primeiro
    await supabase
      .from('observacoes_oportunidade')
      .delete()
      .eq('id_oportunidade', id);
      
    await supabase
      .from('oportunidades_parceiros_destino_externo')
      .delete()
      .eq('id_oportunidade', id);
    
    // Por fim, excluir a oportunidade
    const { error } = await supabase
      .from('oportunidades')
      .delete()
      .eq('id_oportunidade', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Erro ao excluir oportunidade ID ${id}:`, error);
    throw error;
  }
};

// Exportar oportunidades para CSV
export const exportOportunidadesToCSV = async (): Promise<string> => {
  try {
    const oportunidades = await getOportunidadesCompletas();
    
    // Definir cabeçalhos
    const headers = [
      'ID', 
      'Tipo', 
      'Data', 
      'Responsável', 
      'Origem', 
      'Destino', 
      'Empresa Lead', 
      'Contato Lead',
      'Email Lead',
      'Telefone Lead',
      'Status',
      'Serviços',
      'Projeto',
      'Valor Mensal',
      'Aportes',
      'Valor Total',
      'Quarter',
      'Mês',
      'Ano'
    ];
    
    // Converter dados para linhas CSV
    const rows = oportunidades.map(op => [
      op.id_oportunidade,
      op.tipo_oportunidade,
      new Date(op.data_envio_recebimento).toLocaleDateString(),
      op.nome_responsavel,
      op.empresa_origem || op.parceiro_origem || '',
      op.empresa_destino || (op.parceiros_destino ? op.parceiros_destino.join(', ') : ''),
      op.nome_empresa_lead,
      op.nome_contato_lead || '',
      op.email_lead || '',
      op.telefone_lead || '',
      op.status,
      op.descricao_servicos || '',
      op.nome_projeto || '',
      op.valor_proposta_mensal || '',
      op.numero_aportes || '',
      op.valor_total_projeto || '',
      op.quarter_oportunidade || '',
      op.mes_oportunidade || '',
      op.ano_oportunidade || ''
    ].map(field => `"${String(field || "").replace(/"/g, '""')}"`).join(","));
  
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    return csvContent;
  } catch (error) {
    console.error('Erro ao exportar oportunidades para CSV:', error);
    throw error;
  }
};
