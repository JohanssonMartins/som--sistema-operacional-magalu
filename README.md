# Sistema Operacional Magalog (S.O.M)

O **Sistema Operacional Magalog (S.O.M)** é uma plataforma web desenvolvida para otimizar, auditar e gerenciar as operações diárias dos Centros de Distribuição (CDs) da Magalog. O sistema permite o acompanhamento de checklists diários, autoavaliações, metas de performance e gestão de usuários de forma intuitiva e segura.

## Tecnologias Principais

O projeto adota uma arquitetura moderna dividida entre Frontend, Backend e Banco de Dados:

* **Frontend:** React (Vite), TailwindCSS, TypeScript, Framer Motion (Animações), Lucide React (Ícones).
* **Backend:** Node.js, Express, Multer (Processamento de Arquivos), integração com Google Drive API.
* **Banco de Dados:** Supabase (PostgreSQL) acessado primariamente via Prisma ORM (ou integrações diretas da API).

## Estrutura do Projeto

O código está organizado da seguinte maneira:

```text
├── src/                  # Código-fonte do Frontend (React)
│   ├── components/       # Componentes reutilizáveis (modais, alertas)
│   ├── App.tsx           # Ponto de entrada e rotas principais
│   ├── api.ts            # Integrações com o Backend local (fetch)
│   └── data.ts           # Definição de Tipos e Mock de Dados
├── server/               # Código-fonte do Backend (Node/Express)
│   ├── index.ts          # Arquivo principal do servidor e definição de rotas
│   └── services/         # Lógicas complexas (ex: Google Drive Upload)
├── prisma/               # Configuração do banco de dados (Schema e Migrations)
├── docs/                 # Manuais técnicos e Guias de Usuário detalhados
└── docs-arquitetura.md   # Visão macro da infraestrutura em nuvem
```

## Como Rodar o Projeto Localmente

Para contribuir ou testar o projeto em sua máquina local, siga os passos abaixo:

### Pré-requisitos
* **Node.js**: (versão 18+ recomendada)
* Um projeto configurado no **Supabase** com as credenciais de banco de dados.

### Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base se existir).
   - Preencha a URL de conexão com o Supabase:
     ```env
     DATABASE_URL="postgres://usuario:senha@aws-0-regiao.pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```

3. Inicie o banco de dados (caso esteja rodando o Prisma localmente):
   ```bash
   npx prisma generate
   npx prisma db push  # (Ou npx prisma migrate dev)
   ```

### Execução

Você precisa rodar o Servidor (Backend) e a Interface (Frontend) simultaneamente:

**Terminal 1 (Backend):**
Roda a API na porta `3333`.
```bash
npm run server
```

**Terminal 2 (Frontend):**
Roda a interface React na porta `5173`.
```bash
npm run dev
```

Abra seu navegador em [http://localhost:5173](http://localhost:5173).

---
*Documentação oficial do S.O.M - Sistema Operacional Magalog.*
