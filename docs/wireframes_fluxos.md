## Wireframes e Fluxos de Uso - Dashboard de Parcerias A&eight

Este documento descreve os wireframes conceituais e os principais fluxos de uso para o Dashboard de Parcerias do Grupo A&eight.

### 1. Estrutura Geral e Navegação

*   **Layout Principal:**
    *   **Barra de Navegação Superior:** Logo A&eight, Nome do Dashboard, Nome do Usuário Logado, Botão de Logout.
    *   **Menu Lateral (Retrátil):**
        *   Dashboard (Visão Geral)
        *   Oportunidades
            *   Registrar Nova Oportunidade
            *   Consultar Oportunidades
        *   Parceiros Externos (CRUD)
        *   Relatórios (Acesso a visualizações específicas e exportações)
        *   Configurações (Gerenciamento de usuários - apenas Admin)

### 2. Wireframes das Telas Principais

#### 2.1. Tela Principal do Dashboard (Visão Geral)

*   **Título:** Dashboard de Parcerias
*   **Filtros Globais:** Período (Data Início, Data Fim).
*   **Seção 1: Indicadores Chave (KPIs)**
    *   Total de Oportunidades Registradas (no período)
    *   Total de Oportunidades Intragrupo (no período)
    *   Total de Oportunidades Externas (Entrada) (no período)
    *   Total de Oportunidades Externas (Saída) (no período)
    *   Saldo Geral de Parceiros Externos (Recebidas vs. Enviadas)
*   **Seção 2: Análise de Oportunidades Intragrupo**
    *   **Gráfico 1:** Volume de Indicações Intragrupo (Barras/Linhas - Mensal, com seletor para Trimestral).
    *   **Gráfico 2 (Matriz/Rede):** Trocas entre Empresas do Grupo (Quem indicou para quem e quantidade).
        *   Linhas: Empresa Origem (Cryah, Lomadee, etc.)
        *   Colunas: Empresa Destino (Cryah, Lomadee, etc.)
        *   Células: Quantidade de oportunidades.
    *   **Tabela:** Top 5 Empresas Geradoras (Intragrupo)
    *   **Tabela:** Top 5 Empresas Receptoras (Intragrupo)
*   **Seção 3: Análise de Oportunidades com Parceiros Externos ("Balança Comercial")**
    *   **Gráfico 3:** Volume de Indicações de/para Parceiros Externos (Barras - Mensal, agrupado por Entrada/Saída).
    *   **Tabela/Gráfico:** Saldo de Indicações por Parceiro Externo (Top 10 Parceiros).
        *   Colunas: Parceiro, Oportunidades Recebidas do Parceiro, Oportunidades Enviadas para o Parceiro, Saldo.
*   **Seção 4: Acesso Rápido**
    *   Botão: "Registrar Nova Oportunidade"
    *   Botão: "Consultar Oportunidades"

#### 2.2. Tela de Consulta de Oportunidades

*   **Título:** Consultar Oportunidades
*   **Filtros Avançados (Painel Recolhível/Modal):**
    *   Período (Data Início, Data Fim)
    *   Tipo de Oportunidade (Intragrupo, Externa Entrada, Externa Saída)
    *   Empresa de Origem (Dropdown: Empresas do Grupo + Parceiros Externos)
    *   Empresa de Destino (Dropdown: Empresas do Grupo + Parceiros Externos)
    *   Parceiro Externo Específico (Dropdown/Autocomplete)
    *   Status da Oportunidade (Dropdown Múltipla Escolha)
    *   Responsável (Dropdown/Autocomplete)
    *   Campo de Busca Livre (Busca por nome da empresa lead, contato, etc.)
    *   Botões: "Aplicar Filtros", "Limpar Filtros"
*   **Tabela de Resultados:**
    *   Colunas: ID Oportunidade, Data Registro, Lead (Empresa, Contato), Origem, Destino, Responsável, Status, Ações (Visualizar, Editar).
    *   Paginação.
    *   Opção de selecionar colunas visíveis.
*   **Botões de Ação (Acima da Tabela):**
    *   "Registrar Nova Oportunidade"
    *   "Exportar para Excel"
    *   "Exportar para PDF (Resumo)"

#### 2.3. Formulário de Registro/Edição de Nova Oportunidade (Modal ou Página Dedicada)

*   **Título:** Registrar Nova Oportunidade / Editar Oportunidade ID: [XXX]
*   **Campos Comuns:**
    *   Data do Envio/Recebimento (Datepicker, obrigatório)
    *   Responsável pelo Envio/Recebimento (Dropdown com usuários do sistema, obrigatório)
*   **Seção: Dados do Lead**
    *   Nome da Empresa do Lead (Texto, obrigatório)
    *   Nome da Pessoa de Contato (Texto, obrigatório)
    *   E-mail do Lead (Email, obrigatório, com validação)
    *   Telefone do Lead (Texto, obrigatório, com máscara/validação)
*   **Seleção do Tipo de Oportunidade (Radio buttons ou Dropdown):**
    *   [ ] Intragrupo
    *   [ ] Externa (Entrada para o Grupo)
    *   [ ] Externa (Saída do Grupo)
*   **Campos Condicionais (Baseado no Tipo):**
    *   **Se Intragrupo:**
        *   Empresa de Origem (Grupo A&eight) (Dropdown, obrigatório)
        *   Empresa de Destino (Grupo A&eight) (Dropdown, obrigatório, diferente da origem)
    *   **Se Externa (Entrada):**
        *   Empresa Parceira de Origem (Dropdown/Autocomplete de `parceiros_externos`, obrigatório)
        *   Empresa de Destino (Grupo A&eight) (Dropdown, obrigatório)
    *   **Se Externa (Saída):**
        *   Empresa de Origem (Grupo A&eight) (Dropdown, obrigatório)
        *   Empresa(s) Parceira(s) de Destino (Multi-select Dropdown/Autocomplete de `parceiros_externos`, obrigatório)
*   **Status da Oportunidade** (Dropdown, obrigatório, default 'Nova')
*   **Observações Iniciais** (Textarea, opcional)
*   **Botões:** "Salvar Oportunidade", "Cancelar"

#### 2.4. Tela de Detalhes da Oportunidade

*   **Título:** Detalhes da Oportunidade - ID: [XXX]
*   **Seção 1: Informações Principais (Somente Leitura)**
    *   Todos os campos registrados na criação/edição (Lead, Origem, Destino, Responsável, Datas, Status Atual).
    *   Botão: "Editar Oportunidade" (leva ao formulário de edição)
*   **Seção 2: Observações**
    *   Lista de observações (Data, Autor, Texto).
    *   Campo para adicionar nova observação (Textarea + Botão "Adicionar Observação").
*   **Seção 3: Anexos**
    *   Lista de anexos (Nome do Arquivo, Data Upload, Autor, Ação: Download, Excluir - se permissão).
    *   Interface para upload de novo anexo (Botão "Adicionar Anexo" + File Input).
*   **Seção 4: Histórico de Alterações**
    *   Tabela/Lista: Data Modificação, Usuário, Campo Modificado, Valor Antigo, Valor Novo.
    *   Ordenado do mais recente para o mais antigo.

#### 2.5. Tela de Gerenciamento de Parceiros Externos (CRUD)

*   **Título:** Gerenciar Parceiros Externos
*   **Botão:** "Adicionar Novo Parceiro"
*   **Tabela de Parceiros:**
    *   Colunas: ID, Nome do Parceiro, Contato, E-mail, Telefone, Ações (Editar, Excluir - com confirmação).
    *   Busca/Filtro por nome do parceiro.
*   **Formulário de Adição/Edição de Parceiro (Modal ou Página):**
    *   Nome do Parceiro (Texto, obrigatório)
    *   Contato (Texto, opcional)
    *   E-mail (Email, opcional, com validação)
    *   Telefone (Texto, opcional, com máscara/validação)
    *   Botões: "Salvar", "Cancelar"

### 3. Fluxos de Uso Principais

#### 3.1. Fluxo: Registrar Nova Oportunidade Intragrupo

1.  Usuário clica em "Registrar Nova Oportunidade" (Menu ou Dashboard).
2.  Sistema exibe o formulário de registro.
3.  Usuário preenche Data, Responsável.
4.  Usuário preenche Dados do Lead (Empresa, Contato, E-mail, Telefone).
5.  Usuário seleciona Tipo: "Intragrupo".
6.  Campos condicionais aparecem: Empresa de Origem (Grupo), Empresa de Destino (Grupo).
7.  Usuário seleciona Empresa de Origem e Destino.
8.  Usuário seleciona Status (default 'Nova').
9.  Usuário (opcionalmente) adiciona Observações Iniciais.
10. Usuário clica em "Salvar Oportunidade".
11. Sistema valida os dados:
    *   **Sucesso:** Salva a oportunidade, exibe mensagem de sucesso, redireciona para Detalhes da Oportunidade ou Lista de Oportunidades.
    *   **Erro:** Exibe mensagens de erro nos campos inválidos, mantém o usuário no formulário.

#### 3.2. Fluxo: Consultar e Filtrar Oportunidades

1.  Usuário clica em "Consultar Oportunidades" (Menu).
2.  Sistema exibe a lista de todas as oportunidades (paginada), com filtros padrão (ex: último mês).
3.  Usuário interage com o painel de Filtros Avançados:
    *   Seleciona período, tipo, origem, destino, status, etc.
    *   Digita termo na busca livre.
4.  Usuário clica em "Aplicar Filtros".
5.  Sistema atualiza a tabela de resultados com as oportunidades que correspondem aos critérios.
6.  Usuário pode clicar em "Visualizar" em uma oportunidade para ir à Tela de Detalhes.

#### 3.3. Fluxo: Editar Status de uma Oportunidade e Adicionar Observação

1.  Usuário localiza a oportunidade na Tela de Consulta ou acessa diretamente a Tela de Detalhes.
2.  Na Tela de Detalhes, clica em "Editar Oportunidade".
3.  Sistema exibe o formulário de edição com os dados preenchidos.
4.  Usuário altera o campo "Status da Oportunidade".
5.  Usuário clica em "Salvar Oportunidade".
6.  Sistema salva a alteração, registra no Histórico de Alterações, exibe mensagem de sucesso.
7.  De volta à Tela de Detalhes, usuário vai para a seção "Observações".
8.  Usuário digita uma nova observação e clica em "Adicionar Observação".
9.  Sistema salva a observação, associando ao usuário e data/hora, e atualiza a lista de observações.

#### 3.4. Fluxo: Analisar "Balança Comercial" com Parceiro Externo

1.  Usuário acessa o Dashboard (Visão Geral).
2.  Usuário observa a Seção "Análise de Oportunidades com Parceiros Externos".
3.  Visualiza o gráfico de Saldo de Indicações por Parceiro.
4.  Pode aplicar filtro de período global para refinar a análise temporal.
5.  Para detalhes, pode ir para "Consultar Oportunidades" e filtrar por um Parceiro Externo específico (em origem ou destino).

#### 3.5. Fluxo: Exportar Dados

1.  Usuário está na Tela de Consulta de Oportunidades.
2.  Aplica os filtros desejados para obter o conjunto de dados relevante.
3.  Clica no botão "Exportar para Excel".
4.  Sistema gera um arquivo Excel (.xlsx) com os dados da tabela filtrada e inicia o download.

### 4. Considerações de UI/UX

*   **Consistência Visual:** Manter um estilo coeso em todas as telas (cores, fontes, componentes).
*   **Feedback ao Usuário:** Notificações claras para sucesso, erro, carregamento.
*   **Responsividade:** Garantir boa visualização e usabilidade em desktops e dispositivos móveis.
*   **Intuitividade:** Fluxos de navegação e preenchimento de formulários devem ser lógicos e fáceis de entender.
*   **Prevenção de Erros:** Validações em tempo real (onde aplicável) e mensagens de erro específicas.
*   **Desempenho:** Carregamento rápido das telas e gráficos, especialmente com grandes volumes de dados.

Este documento de wireframes e fluxos servirá como guia para o desenvolvimento do frontend e para refinar a lógica do backend.

