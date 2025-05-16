# A8 Partnership Hub

Dashboard para gerenciamento de oportunidades e parcerias do Grupo A&EIGHT.

## Sobre o Projeto

O A8 Partnership Hub é uma plataforma para gerenciar oportunidades de negócios entre empresas do grupo A&EIGHT e parceiros externos. O sistema permite:

- Visualizar, criar e gerenciar oportunidades de negócio
- Acompanhar o status de cada oportunidade
- Gerenciar parceiros externos
- Visualizar estatísticas e métricas de desempenho
- Exportar dados para análise

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Vercel

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/a8-partnership-hub.git
cd a8-partnership-hub
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
VITE_SUPABASE_URL=https://kxxonkbrdlwpcmqymxjk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eG9ua2JyZGx3cGNtcXlteGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODgxNTUsImV4cCI6MjA2MjY2NDE1NX0.zU8lkYlfwSlVJlTH548W_TyB9t81Yd038wj9UkCIZTQ
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── hooks/            # Custom hooks
├── integrations/     # Integrações com serviços externos (Supabase)
├── lib/              # Utilitários e funções auxiliares
├── pages/            # Páginas da aplicação
├── services/         # Serviços para comunicação com o backend
└── types/            # Definições de tipos TypeScript
```

## Deploy

O projeto está configurado para deploy automático na Vercel. Cada push para a branch `main` aciona um novo deploy.

## Supabase

O backend utiliza Supabase para armazenamento de dados, autenticação e gerenciamento de arquivos. O schema do banco de dados e as políticas de segurança estão definidos nos scripts SQL disponíveis na pasta `supabase/`.

## Licença

Este projeto é proprietário e de uso exclusivo do Grupo A&EIGHT.
