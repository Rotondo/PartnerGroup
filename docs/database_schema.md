## Planejamento da Estrutura do Banco de Dados e Modelos

Com base nos requisitos detalhados, a seguinte estrutura de banco de dados é proposta. Utilizaremos um banco de dados relacional (SQL) para garantir a integridade e a capacidade de consulta dos dados.

### Entidades e Tabelas Principais:

1.  **`empresas_grupo`** (Empresas do Grupo A&eight)
    *   `id_empresa_grupo` (INT, Chave Primária, Auto Incremento)
    *   `nome_empresa` (VARCHAR(255), Único, Não Nulo) - (Cryah, Lomadee, Monitfy, Boone, SAIO)

2.  **`parceiros_externos`**
    *   `id_parceiro_externo` (INT, Chave Primária, Auto Incremento)
    *   `nome_parceiro` (VARCHAR(255), Não Nulo)
    *   `contato_parceiro` (VARCHAR(255), Opcional)
    *   `email_parceiro` (VARCHAR(255), Opcional, Validado)
    *   `telefone_parceiro` (VARCHAR(50), Opcional, Validado)

3.  **`leads`**
    *   `id_lead` (INT, Chave Primária, Auto Incremento)
    *   `nome_empresa_lead` (VARCHAR(255), Não Nulo)
    *   `nome_contato_lead` (VARCHAR(255), Não Nulo)
    *   `email_lead` (VARCHAR(255), Não Nulo, Validado)
    *   `telefone_lead` (VARCHAR(50), Não Nulo, Validado)
    *   `data_criacao` (TIMESTAMP, Default CURRENT_TIMESTAMP)

4.  **`usuarios`** (Para controle de acesso e registro de responsáveis)
    *   `id_usuario` (INT, Chave Primária, Auto Incremento)
    *   `nome_usuario` (VARCHAR(255), Não Nulo)
    *   `email_usuario` (VARCHAR(255), Único, Não Nulo, Validado)
    *   `senha_hash` (VARCHAR(255), Não Nulo)
    *   `id_empresa_grupo` (INT, Chave Estrangeira referenciando `empresas_grupo.id_empresa_grupo`, Opcional - se o usuário pertence a uma empresa específica do grupo)
    *   `nivel_acesso` (ENUM('visualizador', 'editor', 'admin'), Não Nulo, Default 'visualizador')

5.  **`status_oportunidade`** (Tabela de referência para os status)
    *   `id_status` (INT, Chave Primária, Auto Incremento)
    *   `nome_status` (VARCHAR(100), Não Nulo, Único) - (Ex: Nova, Em Andamento, Convertida, Perdida, Arquivada)

6.  **`oportunidades`**
    *   `id_oportunidade` (INT, Chave Primária, Auto Incremento)
    *   `id_lead` (INT, Chave Estrangeira referenciando `leads.id_lead`, Não Nulo)
    *   `tipo_oportunidade` (ENUM('intragrupo', 'externa_entrada', 'externa_saida'), Não Nulo)
    *   `data_envio_recebimento` (DATE, Não Nulo)
    *   `id_responsavel_envio_recebimento` (INT, Chave Estrangeira referenciando `usuarios.id_usuario`, Não Nulo)
    *   `id_empresa_origem_grupo` (INT, Chave Estrangeira referenciando `empresas_grupo.id_empresa_grupo`, Opcional - Nulo se origem for parceiro externo)
    *   `id_empresa_destino_grupo` (INT, Chave Estrangeira referenciando `empresas_grupo.id_empresa_grupo`, Opcional - Nulo se destino for parceiro externo)
    *   `id_parceiro_origem_externo` (INT, Chave Estrangeira referenciando `parceiros_externos.id_parceiro_externo`, Opcional - Nulo se origem for empresa do grupo)
    *   `id_status_atual` (INT, Chave Estrangeira referenciando `status_oportunidade.id_status`, Não Nulo)
    *   `data_criacao` (TIMESTAMP, Default CURRENT_TIMESTAMP)
    *   `data_ultima_modificacao` (TIMESTAMP, Default CURRENT_TIMESTAMP, On Update CURRENT_TIMESTAMP)

7.  **`oportunidades_parceiros_destino_externo`** (Tabela de ligação para oportunidades enviadas a múltiplos parceiros externos)
    *   `id_oportunidade_parceiro` (INT, Chave Primária, Auto Incremento)
    *   `id_oportunidade` (INT, Chave Estrangeira referenciando `oportunidades.id_oportunidade`, Não Nulo)
    *   `id_parceiro_destino_externo` (INT, Chave Estrangeira referenciando `parceiros_externos.id_parceiro_externo`, Não Nulo)
    *   PRIMARY KEY (`id_oportunidade`, `id_parceiro_destino_externo`) - Para evitar duplicidade

8.  **`observacoes_oportunidade`**
    *   `id_observacao` (INT, Chave Primária, Auto Incremento)
    *   `id_oportunidade` (INT, Chave Estrangeira referenciando `oportunidades.id_oportunidade`, Não Nulo)
    *   `id_usuario_autor` (INT, Chave Estrangeira referenciando `usuarios.id_usuario`, Não Nulo)
    *   `texto_observacao` (TEXT, Não Nulo)
    *   `data_criacao` (TIMESTAMP, Default CURRENT_TIMESTAMP)

9.  **`anexos_oportunidade`**
    *   `id_anexo` (INT, Chave Primária, Auto Incremento)
    *   `id_oportunidade` (INT, Chave Estrangeira referenciando `oportunidades.id_oportunidade`, Não Nulo)
    *   `id_usuario_upload` (INT, Chave Estrangeira referenciando `usuarios.id_usuario`, Não Nulo)
    *   `nome_arquivo` (VARCHAR(255), Não Nulo)
    *   `caminho_arquivo` (VARCHAR(512), Não Nulo) - (Caminho no sistema de arquivos ou URL de armazenamento)
    *   `tipo_arquivo` (VARCHAR(100))
    *   `tamanho_arquivo` (INT) - (Em bytes)
    *   `data_upload` (TIMESTAMP, Default CURRENT_TIMESTAMP)

10. **`historico_alteracoes_oportunidade`**
    *   `id_historico` (INT, Chave Primária, Auto Incremento)
    *   `id_oportunidade` (INT, Chave Estrangeira referenciando `oportunidades.id_oportunidade`, Não Nulo)
    *   `id_usuario_modificacao` (INT, Chave Estrangeira referenciando `usuarios.id_usuario`, Não Nulo)
    *   `campo_modificado` (VARCHAR(255), Não Nulo)
    *   `valor_antigo` (TEXT, Opcional)
    *   `valor_novo` (TEXT, Opcional)
    *   `data_modificacao` (TIMESTAMP, Default CURRENT_TIMESTAMP)

### Relacionamentos Principais:

*   Uma **Oportunidade** está associada a um **Lead** (1-para-1, mas modelado como 1-para-M de Lead para Oportunidade se um lead puder gerar múltiplas oportunidades, o que não parece ser o caso aqui, então é mais para 1-para-1 onde a oportunidade *tem um* lead).
*   Uma **Oportunidade** tem um **Responsável** (Usuário).
*   Uma **Oportunidade** tem uma **Empresa de Origem** (do Grupo OU Parceiro Externo).
*   Uma **Oportunidade** tem uma **Empresa de Destino** (do Grupo OU Parceiro Externo - pode ser múltiplo para parceiros externos através da tabela de ligação).
*   Uma **Oportunidade** tem um **Status Atual**.
*   Uma **Oportunidade** pode ter várias **Observações**.
*   Uma **Oportunidade** pode ter vários **Anexos**.
*   Uma **Oportunidade** pode ter vários registros de **Histórico de Alterações**.
*   Um **Usuário** pode pertencer a uma **Empresa do Grupo**.

### Considerações Adicionais:

*   **Validação de Dados:** Será implementada na camada de aplicação (backend) e, quando possível, no frontend. O banco de dados garantirá a integridade referencial e tipos de dados.
*   **Prevenção de Duplicados:** A lógica para prevenir duplicidade de oportunidades será implementada no backend, verificando combinações chave (ex: `id_lead`, `id_empresa_origem_grupo`/`id_parceiro_origem_externo`, `id_empresa_destino_grupo`/`id_parceiro_destino_externo`) antes da inserção.
*   **Índices:** Serão criados índices nas chaves estrangeiras e em colunas frequentemente usadas em filtros e buscas para otimizar o desempenho das consultas.
*   **Empresas do Grupo A&eight (Cryah, Lomadee, Monitfy, Boone, SAIO):** Serão pré-carregadas na tabela `empresas_grupo`.

Este planejamento servirá como base para a criação dos modelos de dados na aplicação Flask e para a configuração do esquema do banco de dados MySQL.

