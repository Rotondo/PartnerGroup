
// Definições de tipo para o Dashboard de Parcerias A&eight (Alinhado com Supabase)

export interface EmpresaGrupo {
  id: number;
  nome: string; // Cryah, Lomadee, Monitfy, Boone, SAIO
  data_criacao?: string;
}

export interface ParceiroExterno {
  id: number;
  nome: string;
  data_criacao?: string;
}

export interface Lead {
  id: number;
  nome_empresa: string;
  nome_contato: string;
  email: string;
  telefone?: string;
  data_criacao?: string;
}

export interface StatusOportunidade {
  id: number;
  nome: string; // Ex: Nova, Em Andamento, Ganha, Perdida, Em Espera
  data_criacao?: string;
}

export interface Usuario {
  id: string; // UUID from Supabase Auth
  nome_completo: string;
  email: string;
  id_empresa_grupo?: number; // FK para empresas_grupo
  empresas_grupo?: EmpresaGrupo; // Para join
  data_criacao?: string;
  // avatar_url, etc., podem ser adicionados se vierem do Supabase Auth
}

export interface Oportunidade {
  id: number;
  data_envio: string;
  id_responsavel_envio_recebimento: string; // FK para usuarios (Supabase Auth ID)
  empresa_origem_id?: number;       // FK para empresas_grupo
  empresa_destino_id?: number;      // FK para empresas_grupo
  parceiro_externo_id?: number;     // FK para parceiros_externos
  lead_id: number;                   // FK para leads
  status_id: number;                 // FK para status_oportunidade
  tipo_oportunidade: "intragrupo" | "externa_entrada" | "externa_saida";
  observacoes?: string;
  data_criacao?: string;
  data_ultima_modificacao?: string;

  // Campos para joins (populados via select)
  leads?: Lead;
  empresas_grupo_origem?: EmpresaGrupo;
  empresas_grupo_destino?: EmpresaGrupo;
  parceiros_externos?: ParceiroExterno;
  status_oportunidade?: StatusOportunidade;
  usuarios?: Usuario; // Responsável
  oportunidade_parceiro_saida?: OportunidadeParceiroSaida[]; // Para tipo externa_saida com múltiplos parceiros
}

// Para o caso de uma oportunidade de saída para múltiplos parceiros
export interface OportunidadeParceiroSaida {
  id: number;
  oportunidade_id: number; // FK para oportunidades
  parceiro_externo_id: number; // FK para parceiros_externos
  data_criacao?: string;

  // Campos para joins
  parceiros_externos?: ParceiroExterno;
}

export interface HistoricoAlteracoesOportunidade {
  id: number;
  oportunidade_id: number; // FK para oportunidades
  id_usuario_modificacao: string; // FK para usuarios (Supabase Auth ID)
  data_modificacao: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_novo?: string;
  descricao_modificacao: string;

  // Campos para joins
  usuarios?: Usuario; // Usuário que modificou
}

export interface ObservacaoOportunidade {
  id: number;
  oportunidade_id: number; // FK para oportunidades
  id_usuario: string; // FK para usuarios (Supabase Auth ID)
  conteudo: string;
  data_criacao: string;

  // Campos para joins
  usuarios?: Usuario; // Usuário que criou a observação
}

export interface AnexoOportunidade {
  id: number;
  oportunidade_id: number; // FK para oportunidades
  id_usuario_upload: string; // FK para usuarios (Supabase Auth ID)
  nome_arquivo: string;
  url_arquivo: string; // URL do Supabase Storage
  path_storage?: string; // Caminho no Supabase Storage para facilitar exclusão
  tipo_arquivo?: string;
  tamanho_arquivo?: number;
  data_upload: string;

  // Campos para joins
  usuarios?: Usuario; // Usuário que fez o upload
}

// Tipos para os gráficos e visualizações do dashboard
export interface ChartDataPoint {
  name: string;
  value: number;
  // Outras propriedades conforme necessário para gráficos específicos
  [key: string]: any;
}

export interface LineChartDataPoint {
  name: string; // Geralmente o eixo X (ex: Mês, Trimestre)
  [key: string]: string | number; // Séries de dados (ex: Cryah: 10, Lomadee: 15)
}

export interface BalanceData {
  partnerName: string;
  sent: number;
  received: number;
  balance: number;
}

export interface NetworkNode {
  id: string; // ID único para o nó (ex: "empresa_1", "parceiro_A")
  name: string; // Nome exibido (ex: "Cryah", "Parceiro A")
  type: "empresa_grupo" | "parceiro_externo";
  [key: string]: any; // Outras propriedades para visualização
}

export interface NetworkLink {
  source: string; // ID do nó de origem
  target: string; // ID do nó de destino
  value: number;  // Quantidade de indicações
  [key: string]: any; // Outras propriedades para visualização
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// Para os filtros do dashboard
export interface DashboardFilters {
  periodo?: { inicio?: string; fim?: string };
  empresaOrigemId?: number;
  empresaDestinoId?: number;
  parceiroExternoId?: number;
  statusOportunidadeId?: number;
  responsavelId?: string;
  termoBusca?: string;
}
