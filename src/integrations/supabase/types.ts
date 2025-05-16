// src/integrations/supabase/types.ts
import { Database as Schema } from './schema';

// Definição de tipos para o Supabase
export type Database = Schema;

// Tipos para as tabelas principais
export type EmpresaGrupo = Database['public']['Tables']['empresas_grupo']['Row'];
export type ParceiroExterno = Database['public']['Tables']['parceiros_externos']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type Oportunidade = Database['public']['Tables']['oportunidades']['Row'];
export type StatusOportunidade = Database['public']['Tables']['status_oportunidade']['Row'];
export type Usuario = Database['public']['Tables']['usuarios']['Row'];
export type ObservacaoOportunidade = Database['public']['Tables']['observacoes_oportunidade']['Row'];
export type AnexoOportunidade = Database['public']['Tables']['anexos_oportunidade']['Row'];
export type HistoricoAlteracoesOportunidade = Database['public']['Tables']['historico_alteracoes_oportunidade']['Row'];
export type OportunidadeParceiroDestinoExterno = Database['public']['Tables']['oportunidades_parceiros_destino_externo']['Row'];

// Tipos para as funções RPC
export type OportunidadeCompleta = {
  id_oportunidade: number;
  tipo_oportunidade: 'intragrupo' | 'externa_entrada' | 'externa_saida';
  data_envio_recebimento: string;
  nome_responsavel: string;
  empresa_origem: string;
  empresa_destino: string;
  parceiro_origem: string | null;
  parceiros_destino: string[] | null;
  nome_empresa_lead: string;
  nome_contato_lead: string | null;
  email_lead: string | null;
  telefone_lead: string | null;
  status: string;
  observacoes: string[];
  descricao_servicos: string | null;
  nome_projeto: string | null;
  valor_proposta_mensal: number | null;
  numero_aportes: number | null;
  valor_total_projeto: number | null;
  quarter_oportunidade: string | null;
  mes_oportunidade: number | null;
  ano_oportunidade: number | null;
  data_criacao: string;
  data_ultima_modificacao: string | null;
};

// Tipos para estatísticas
export type EstatisticaOportunidadePorEmpresa = {
  empresa: string;
  enviadas: number;
  recebidas: number;
  saldo: number;
  por_status: {
    status: string;
    quantidade: number;
  }[];
};

export type EstatisticaParceiroExterno = {
  parceiro: string;
  enviadas: number;
  recebidas: number;
  saldo: number;
};

// Schema completo do banco de dados
export interface Schema {
  public: {
    Tables: {
      empresas_grupo: {
        Row: {
          id_empresa_grupo: number;
          nome_empresa: string;
        };
        Insert: {
          id_empresa_grupo?: number;
          nome_empresa: string;
        };
        Update: {
          id_empresa_grupo?: number;
          nome_empresa?: string;
        };
      };
      parceiros_externos: {
        Row: {
          id_parceiro_externo: number;
          nome_parceiro: string;
          email_contato?: string | null;
          telefone_contato?: string | null;
          observacoes?: string | null;
        };
        Insert: {
          id_parceiro_externo?: number;
          nome_parceiro: string;
          email_contato?: string | null;
          telefone_contato?: string | null;
          observacoes?: string | null;
        };
        Update: {
          id_parceiro_externo?: number;
          nome_parceiro?: string;
          email_contato?: string | null;
          telefone_contato?: string | null;
          observacoes?: string | null;
        };
      };
      leads: {
        Row: {
          id_lead: number;
          nome_empresa_lead: string;
          nome_contato_lead?: string | null;
          email_lead?: string | null;
          telefone_lead?: string | null;
          data_criacao: string;
        };
        Insert: {
          id_lead?: number;
          nome_empresa_lead: string;
          nome_contato_lead?: string | null;
          email_lead?: string | null;
          telefone_lead?: string | null;
          data_criacao?: string;
        };
        Update: {
          id_lead?: number;
          nome_empresa_lead?: string;
          nome_contato_lead?: string | null;
          email_lead?: string | null;
          telefone_lead?: string | null;
          data_criacao?: string;
        };
      };
      status_oportunidade: {
        Row: {
          id_status: number;
          nome_status: string;
        };
        Insert: {
          id_status?: number;
          nome_status: string;
        };
        Update: {
          id_status?: number;
          nome_status?: string;
        };
      };
      oportunidades: {
        Row: {
          id_oportunidade: number;
          id_lead: number;
          tipo_oportunidade: 'intragrupo' | 'externa_entrada' | 'externa_saida';
          data_envio_recebimento: string;
          id_responsavel_envio_recebimento: number;
          id_empresa_origem_grupo?: number | null;
          id_empresa_destino_grupo?: number | null;
          id_parceiro_origem_externo?: number | null;
          id_status_atual: number;
          data_criacao: string;
          data_ultima_modificacao?: string | null;
          descricao_servicos?: string | null;
          nome_projeto?: string | null;
          valor_proposta_mensal?: number | null;
          numero_aportes?: number | null;
          valor_total_projeto?: number | null;
          quarter_oportunidade?: string | null;
          mes_oportunidade?: number | null;
          ano_oportunidade?: number | null;
        };
        Insert: {
          id_oportunidade?: number;
          id_lead: number;
          tipo_oportunidade: 'intragrupo' | 'externa_entrada' | 'externa_saida';
          data_envio_recebimento: string;
          id_responsavel_envio_recebimento: number;
          id_empresa_origem_grupo?: number | null;
          id_empresa_destino_grupo?: number | null;
          id_parceiro_origem_externo?: number | null;
          id_status_atual: number;
          data_criacao?: string;
          data_ultima_modificacao?: string | null;
          descricao_servicos?: string | null;
          nome_projeto?: string | null;
          valor_proposta_mensal?: number | null;
          numero_aportes?: number | null;
          valor_total_projeto?: number | null;
          quarter_oportunidade?: string | null;
          mes_oportunidade?: number | null;
          ano_oportunidade?: number | null;
        };
        Update: {
          id_oportunidade?: number;
          id_lead?: number;
          tipo_oportunidade?: 'intragrupo' | 'externa_entrada' | 'externa_saida';
          data_envio_recebimento?: string;
          id_responsavel_envio_recebimento?: number;
          id_empresa_origem_grupo?: number | null;
          id_empresa_destino_grupo?: number | null;
          id_parceiro_origem_externo?: number | null;
          id_status_atual?: number;
          data_criacao?: string;
          data_ultima_modificacao?: string | null;
          descricao_servicos?: string | null;
          nome_projeto?: string | null;
          valor_proposta_mensal?: number | null;
          numero_aportes?: number | null;
          valor_total_projeto?: number | null;
          quarter_oportunidade?: string | null;
          mes_oportunidade?: number | null;
          ano_oportunidade?: number | null;
        };
      };
      oportunidades_parceiros_destino_externo: {
        Row: {
          id_oportunidade: number;
          id_parceiro_destino_externo: number;
        };
        Insert: {
          id_oportunidade: number;
          id_parceiro_destino_externo: number;
        };
        Update: {
          id_oportunidade?: number;
          id_parceiro_destino_externo?: number;
        };
      };
      observacoes_oportunidade: {
        Row: {
          id_observacao: number;
          id_oportunidade: number;
          id_usuario_autor: number;
          texto_observacao: string;
          data_criacao: string;
        };
        Insert: {
          id_observacao?: number;
          id_oportunidade: number;
          id_usuario_autor: number;
          texto_observacao: string;
          data_criacao?: string;
        };
        Update: {
          id_observacao?: number;
          id_oportunidade?: number;
          id_usuario_autor?: number;
          texto_observacao?: string;
          data_criacao?: string;
        };
      };
      anexos_oportunidade: {
        Row: {
          id_anexo: number;
          id_oportunidade: number;
          nome_arquivo: string;
          path_storage: string;
          tipo_arquivo: string;
          tamanho_arquivo: number;
          data_upload: string;
        };
        Insert: {
          id_anexo?: number;
          id_oportunidade: number;
          nome_arquivo: string;
          path_storage: string;
          tipo_arquivo: string;
          tamanho_arquivo: number;
          data_upload?: string;
        };
        Update: {
          id_anexo?: number;
          id_oportunidade?: number;
          nome_arquivo?: string;
          path_storage?: string;
          tipo_arquivo?: string;
          tamanho_arquivo?: number;
          data_upload?: string;
        };
      };
      historico_alteracoes_oportunidade: {
        Row: {
          id_historico: number;
          id_oportunidade: number;
          id_usuario_modificacao: number;
          campo_modificado: string;
          valor_antigo: string;
          valor_novo: string;
          data_modificacao: string;
        };
        Insert: {
          id_historico?: number;
          id_oportunidade: number;
          id_usuario_modificacao: number;
          campo_modificado: string;
          valor_antigo: string;
          valor_novo: string;
          data_modificacao?: string;
        };
        Update: {
          id_historico?: number;
          id_oportunidade?: number;
          id_usuario_modificacao?: number;
          campo_modificado?: string;
          valor_antigo?: string;
          valor_novo?: string;
          data_modificacao?: string;
        };
      };
      usuarios: {
        Row: {
          id_usuario: number;
          nome_usuario: string;
          email_usuario: string;
          id_empresa_grupo: number;
          nivel_acesso: 'admin' | 'user' | 'read_only';
          created_at: string;
          updated_at?: string | null;
        };
        Insert: {
          id_usuario?: number;
          nome_usuario: string;
          email_usuario: string;
          id_empresa_grupo: number;
          nivel_acesso?: 'admin' | 'user' | 'read_only';
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id_usuario?: number;
          nome_usuario?: string;
          email_usuario?: string;
          id_empresa_grupo?: number;
          nivel_acesso?: 'admin' | 'user' | 'read_only';
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_oportunidades_completas: {
        Args: Record<string, never>;
        Returns: OportunidadeCompleta[];
      };
      get_estatisticas_oportunidades_por_empresa: {
        Args: Record<string, never>;
        Returns: EstatisticaOportunidadePorEmpresa[];
      };
      get_estatisticas_parceiros_externos: {
        Args: Record<string, never>;
        Returns: EstatisticaParceiroExterno[];
      };
    };
    Enums: {
      tipo_oportunidade_enum: 'intragrupo' | 'externa_entrada' | 'externa_saida';
      nivel_acesso_enum: 'admin' | 'user' | 'read_only';
    };
  };
}
