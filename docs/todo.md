## Definição de Requisitos e Escopo do Dashboard de Parcerias A&eight

### 1. Funcionalidades Centrais de Registro de Oportunidades

- [ ] **Registro de Oportunidades Intragrupo:**
    - [ ] Capturar data do envio.
    - [ ] Registrar nome do responsável pelo envio.
    - [ ] Selecionar empresa de origem (Cryah, Lomadee, Monitfy, Boone, SAIO).
    - [ ] Selecionar empresa de destino (Cryah, Lomadee, Monitfy, Boone, SAIO).
    - [ ] Registrar dados completos do lead:
        - [ ] Nome da empresa do lead.
        - [ ] Nome da pessoa de contato do lead.
        - [ ] E-mail do lead (com validação de formato).
        - [ ] Telefone do lead (com validação de formato).
- [ ] **Registro de Oportunidades com Parceiros Externos (Entrada para o Grupo A&eight):**
    - [ ] Capturar data do recebimento.
    - [ ] Registrar nome do responsável pelo recebimento (da empresa do grupo).
    - [ ] Registrar nome da empresa parceira de origem (externa).
    - [ ] Selecionar empresa do grupo de destino (Cryah, Lomadee, Monitfy, Boone, SAIO).
    - [ ] Registrar dados completos do lead (mesmos campos acima).
- [ ] **Registro de Oportunidades com Parceiros Externos (Saída do Grupo A&eight):**
    - [ ] Capturar data do envio.
    - [ ] Registrar nome do responsável pelo envio (da empresa do grupo).
    - [ ] Selecionar empresa do grupo de origem (Cryah, Lomadee, Monitfy, Boone, SAIO).
    - [ ] Registrar nome da(s) empresa(s) parceira(s) de destino (externa, permitir múltiplas seleções).
    - [ ] Registrar dados completos do lead (mesmos campos acima).

### 2. Consulta e Gerenciamento de Oportunidades

- [ ] **Consulta Individual de Oportunidades:**
    - [ ] Visualizar todos os detalhes registrados para uma oportunidade específica.
- [ ] **Repositório Consultável de Oportunidades:**
    - [ ] Permitir busca por qualquer campo registrado (empresa, contato, responsável, datas, etc.).
- [ ] **Gerenciamento de Status da Oportunidade:**
    - [ ] Permitir edição do status da oportunidade (ex: Nova, Em Andamento, Convertida, Perdida, Arquivada).
- [ ] **Adição de Observações:**
    - [ ] Permitir adicionar notas ou comentários contextuais a uma oportunidade.
- [ ] **Adição de Anexos:**
    - [ ] Permitir anexar arquivos relevantes a uma oportunidade (ex: propostas, contratos breves).
- [ ] **Histórico de Alterações:**
    - [ ] Registrar automaticamente data, hora e responsável por cada modificação em uma oportunidade.

### 3. Visualizações de Dados e Gráficos (Dashboard)

- [ ] **Análise de Oportunidades Intragrupo:**
    - [ ] Gráfico de volume de indicações (total) por mês.
    - [ ] Gráfico de volume de indicações (total) por trimestre.
    - [ ] Tabela/Matriz: Quantidade de oportunidades geradas por cada empresa do grupo para as demais (Origem -> Destino).
    - [ ] Tabela/Matriz: Quantidade de oportunidades recebidas por cada empresa do grupo das demais (Destino <- Origem).
    - [ ] Utilizar gráficos de barras ou linhas para volumes mensais/trimestrais.
    - [ ] Utilizar gráficos de rede ou matriz para visualizar as trocas entre empresas do grupo.
- [ ] **Análise de Oportunidades com Parceiros Externos ("Balança Comercial")**:
    - [ ] Visualização de quem está indicando oportunidades (parceiro externo ou empresa do grupo).
    - [ ] Gráfico/Tabela: Quantidade de oportunidades que cada parceiro externo enviou para o grupo.
    - [ ] Gráfico/Tabela: Quantidade de oportunidades que o grupo enviou para cada parceiro externo.
    - [ ] Indicador de Saldo de Indicações por Parceiro Externo (Recebidas do Parceiro vs. Enviadas para o Parceiro).
    - [ ] Indicador de Saldo Geral de Indicações com Parceiros Externos (Total Recebido de Externos vs. Total Enviado para Externos).
- [ ] **Indicadores Gerais:**
    - [ ] Taxas de conversão de oportunidades (se o status permitir essa análise).

### 4. Funcionalidades Adicionais do Sistema

- [ ] **Filtros Avançados:**
    - [ ] Filtrar dados por período (datas personalizadas).
    - [ ] Filtrar por empresa de origem (interna do grupo ou parceira externa).
    - [ ] Filtrar por empresa de destino (interna do grupo ou parceira externa).
    - [ ] Filtrar por parceiro externo específico.
    - [ ] Filtrar por status da oportunidade.
    - [ ] Filtrar por responsável (pelo envio ou recebimento).
- [ ] **Exportação de Dados:**
    - [ ] Opção para exportar dados filtrados ou relatórios para Excel.
    - [ ] Opção para exportar visualizações ou relatórios para PDF.
- [ ] **Controles de Acesso:**
    - [ ] Sistema de login para usuários autorizados.
    - [ ] (Opcional, a definir) Níveis de permissão (ex: visualizador, editor, administrador).
- [ ] **Validação de Dados:**
    - [ ] Validação de formato para campos de e-mail.
    - [ ] Validação de formato para campos de telefone.
    - [ ] Prevenção de registros duplicados de oportunidades (baseado em um conjunto de chaves, ex: empresa do lead + contato + origem/destino em um curto período).
- [ ] **Interface e Usabilidade:**
    - [ ] Layout limpo, moderno e intuitivo.
    - [ ] Design responsivo (adaptável a diferentes tamanhos de tela, desktop e mobile).
- [ ] **Notificações do Sistema:**
    - [ ] Mensagens de sucesso após operações bem-sucedidas (ex: registro salvo).
    - [ ] Mensagens de erro claras em caso de falhas ou dados inválidos.
- [ ] **Robustez e Desempenho:**
    - [ ] Sistema construído para uso contínuo e acompanhamento estratégico.
    - [ ] Performance adequada para o volume de dados esperado.

### 5. Empresas do Grupo A&eight

- [ ] Cryah
- [ ] Lomadee
- [ ] Monitfy
- [ ] Boone
- [ ] SAIO

