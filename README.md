# S.O.M - Sistema Operacional Magalu 🚀

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.1-2D3748?logo=prisma)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)

O **S.O.M (Sistema Operacional Magalu)** é uma plataforma avançada de gestão de excelência operacional e auditoria para os Centros de Distribuição (CDs) do Magalu. O sistema permite o acompanhamento em tempo real da aderência aos pilares da empresa, gestão de checklists, evidências e rankings de performance.

## ✨ Funcionalidades Principais

- **📊 Dashboard de Auditoria**: Visão consolidada por unidade (CD) ou visão empresa ("Todos os CDs").
- **✅ Gestão de Checklists**: Auto-auditoria e auditoria oficial com fluxos de aprovação e bloqueio de itens concluídos.
- **🏆 Top Magalog**: Ranking de performance dos CDs com premiações dinâmicas (Medalhas de Ouro, Prata e Bronze).
- **🔒 Controle de Acesso (RBAC)**: Diferentes níveis de permissão (Admin, Auditor, Gerente Divisional, Gerente de CD, Dono de Pilar e Colaborador).
- **📸 Gestão de Evidências**: Upload e visualização de fotos/documentos para comprovação de conformidade.
- **🌓 Modo Escuro/Claro**: Interface moderna e adaptável às preferências do usuário.

## 🛠️ Tecnologias Utilizadas

### Front-end
- **React 19 & TypeScript**: Core da aplicação com tipagem forte.
- **Motion (Framer Motion)**: Animações fluidas e micro-interações.
- **Lucide React**: Biblioteca de ícones moderna.
- **Tailwind CSS 4**: Estilização performática e responsiva.
- **Dexie.js**: Armazenamento local robusto (quando offline).

### Back-end
- **Node.js & Express**: API REST para gestão de dados.
- **Prisma ORM**: Modelagem e acesso ao banco de dados.
- **Better-SQLite3**: Banco de dados relacional leve e rápido.

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (incluso no Node.js)

## 🚀 Como rodar o projeto

O projeto possui um ambiente integrado de front-end e back-end.

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Inicie o servidor de banco de dados (API)**:
   ```bash
   npm run server
   ```

3. **Inicie o front-end (em outro terminal)**:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**:
   - Front-end: `http://localhost:3000` (ou a porta exibida no terminal)
   - API: `http://localhost:3333`

## 📂 Estrutura do Projeto

- `src/`: Código fonte do front-end (React).
- `server/`: Código fonte do back-end (Express/Prisma).
- `prisma/`: Esquemas e migrações do banco de dados.
- `public/`: Arquivos estáticos.
- `README.md`: Documentação do projeto.

---

© 2026 Magalu | Desenvolvido por J's Martins
