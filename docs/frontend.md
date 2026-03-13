# Documentação do Frontend (React/Vite)

A interface de usuário do Sistema Operacional Magalog (S.O.M) adota uma fundação moderna para garantir performance e animações responsivas de primeira linha.

## Tecnologias e Camadas
- **Bibliotecas Base:** React (18+), ReactDOM e Vite como empacotador veloz.
- **Estilização e Layout:** Tailwind CSS (Utilitários visuais), garantindo Dark Mode nativo e cores flexíveis.
- **Animações (Microinterações):** Framer Motion / Motion. Provê a sensação orgânica do sistema ao abrir modais ou expandir pilares do checklist.
- **Ícones SVG:** Biblioteca completa e leve do Lucide React.
- **Tipagem (Segurança):** TypeScript garantindo que nenhum acesso errado a objetos chegue ao compilador.

---

## 📂 Visão Geral da Arquitetura do Frontend

O coração visual é o arquivo principal `src/App.tsx`. Dentro dele reside todo o encapsulamento, roteamento principal (Tabs) e a mágica de estados.

### Os Arquivos Vitais

1. **`App.tsx` (Single Page Application Core)**
   Ele define a estrutura e exibe painéis (`activeTab`) com base no clique do usuário na barra lateral:
   - *Home / Dashboard:* Módulo "Avaliação da Operação". Contém visualização corporativa e da filial selecionada, unificando cálculos entre blocos para mostrar os Scores de CD.
   - *Autoavaliação:* O formulário dinâmico gigante onde Gerentes preenchem `nossaAcao`, Notas e Evidências.
   - *Base Check-List:* Exclusiva para perfis privilegiados gerenciarem a árvore técnica padrão de cobranças dos auditores no S.O.M.
   
2. **`api.ts` (O Serviço Ponte)**
   Responsável pela conexão direta de client-side ao nosso backend do Railway. Funções puras em `axios` ou `fetch` padronizadas para cada request do painel.

3. **`data.ts` (O Contrato / Mock)**
   Contém as `Interfaces` que o TypeScript usa intensivamente, como `User`, `ChecklistItem` e a estrutura de dados `Autoauditoria`. Ajudam o dev a entender o formato e tipos do sistema sem olhar o banco de dados.

4. **Componentes Independentes (Como Navbar/MainLogo)**
   Contêm o isolamento de peças reutilizáveis, logos criativos e painéis laterais base.

---

## 🧠 Gerenciamento de Estado (State)

A aplicação React baseia-se pesadamente na união poderosa de Hooks fundamentais do React: `useState` e `useEffect`.

#### Principais Estados e Regras
- **Current User / Autenticação**:
  A aplicação primeiro checa o `localStorage ('som_user')` para manter sessões nativas locais se o gestor recarregar a tela, para evitar longas esperas.
- **Autoauditoria Polling**:
  Um ponto avançado é que a Autoavaliação possui uma lógica assíncrona agressiva onde um Polling com `setTimeout/clearInterval` recarrega as requisições ativamente salvando o score na tela sem necessitar de botão 'Salvar' tradicional (Autoscaling UI), permitindo vários usuários preencherem de uma vez.
- **Modal Control**:
  Multiplos `isModalOpen` para uploads de fotos, edição de pilar ou troca de senha controlados estritamente e injetados abaixo hierarquicamente junto da tag global.

---
*Documentação do Frontend S.O.M (Sistema Operacional Magalog).*
