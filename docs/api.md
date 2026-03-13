# Documentação da API (Backend)

O backend do Sistema Operacional Magalog foi construído em Node.js utilizando Express e TypeScript. O servidor intermedia a comunicação do Frontend com a base de dados (Supabase) e gerencia o upload seguro de arquivos pesados (fotos de evidências) enviando-os para o Google Drive.

## Estrutura e Inicialização

O arquivo principal é o `server/index.ts`. Ele é iniciado localmente usando o script:
```bash
npm run server
```
A API roda, por padrão, na porta `3333` e expõe prefixos de rotas principais no painel HTTP. A autenticação com o banco é feita majoritariamente pelo `Prisma`.

---

## 🔐 Autenticação e Usuários
Gerencia acessos de Gerentes, Auditores e Administradores.

### GET `/api/users/:email`
Busca um usuário do sistema pelo seu email. Utilizado na tela principal para login local e recuperação dos dados essenciais.
- **Retorno:** Objeto `{ id, email, password, name, role, photo, unidade }`.

### PUT `/api/users/:id`
Processa edições no perfil do usuário, como alteração de senha (Trocar Senha) ou upload de foto de perfil.
- **Corpo da requisição:** `{ password?: string, photo?: string }`
- **Retorno:** Objeto de Usuário atualizado.

---

## 📋 Base de Check-List (Auditoria)
A matriz que dita o que será cobrado por Pilar e Bloco.

### GET `/api/checklists`
Retorna todos os itens base (`ChecklistItem`) cadastrados pelos administradores no sistema, estruturados com sua descrição e pilar. Usada para carregar a base de conhecimentos do App.

### POST / PUT / DELETE `/api/checklists/:id`
Rotas administrativas para incluir, deletar ou atualizar itens mestre de check-list. O projeto utiliza o endpoint consolidado (`/api/checklists`) para gerenciar as rotinas base no painel da diretoria.

---

## 📝 Autoavaliações (Respostas do Dia-a-Dia)
Rotas que o gerente do CD consome para salvar as notas diárias e anexar evidências perante o item cobrado da matriz.

### GET `/api/autoauditoria/:unidade/:mesAno`
Busca o histórico de avaliações do CD filtrado por mês. Se já existir rascunho salvo, os dados e as notas que o CD deu para cada Check-List Base aparecem.

### POST `/api/autoauditoria`
O famoso "Auto-Save". Utilizado para mesclar um array gigantesco de submissões das respostas em tempo real, sem necessidade de enviar o formulário inteiro.
- **Payload:** Array com as respostas de `score` (Nota Ponto) e Textos `nossaAcao` submetidos pelo Gerente do CD em questão.

---

## ☁️ Google Drive (Serviço de Evidências)
O S.O.M lida com fotos de CD ou relatórios sem explodir a nuvem através deste upload delegado.

### POST `/api/upload`
Uma rota consumida pelo Frontend na hora que o usuário clica em "Adicionar Evidência" e anexa imagem. Recebe a foto (usando Multer), roteia a requisição para o serviço do Google, processa e hospeda o anexo permanentemente. Transforma a foto gerando uma URL visualizável para a grade (Pilar/CD/Mês) de forma a não pesar o DB do Supabase.
- **Payload:** O Blob/Arquivo anexado do HD/Celular.
- **Retorno:** `{ fileId, webViewLink, message: "Upload success" }`

---
*Documento gerado para a API do S.O.M (Sistema Operacional Magalog).*
