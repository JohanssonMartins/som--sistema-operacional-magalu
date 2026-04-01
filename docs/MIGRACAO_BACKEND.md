# 🚀 Plano B: Migração de Backend (Railway -> Render)

Este documento serve como um guia rápido caso o crédito do **Railway** expire ou o serviço fique indisponível.

## 1. Variáveis de Ambiente Necessárias
Tenha em mãos os valores destas variáveis (você pode copiar do seu arquivo `.env` atual ou do painel do Railway):

| Variável | Descrição | Origem |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão com o PostgreSQL | Supabase |
| `GEMINI_API_KEY` | Chave para análise de IA e sugestões | Google AI Studio |
| `GOOGLE_CREDENTIALS` | Conteúdo do JSON da Service Account (Minificado) | Google Cloud Console |
| `PORT` | Porta do servidor (opcional, o Render define automático) | - |

---

## 2. Passo a Passo no Render.com

1.  **Crie sua conta:** Acesse [render.com](https://render.com) e conecte com seu GitHub.
2.  **Novo Web Service:**
    *   Clique em **"New +"** > **"Web Service"**.
    *   Selecione o repositório `som--sistema-operacional-magalu`.
3.  **Configurações do Runtime:**
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install && npx prisma generate`
    *   **Start Command:** `npm run server`
4.  **Adicione as Variáveis:**
    *   Vá na aba **"Environment"**.
    *   Adicione cada uma das variáveis da tabela acima.
    *   *Dica:* Para o `GOOGLE_CREDENTIALS`, cole todo o conteúdo do arquivo `.json` como uma string única.
5.  **Deploy:** O Render iniciará o deploy automaticamente. Ao final, ele fornecerá uma URL (ex: `https://seu-app.onrender.com`).

---

## 3. Atualizando o Frontend (Vercel)

Após o novo backend estar online:

1.  Acesse o painel da **Vercel**.
2.  Vá em **Settings > Environment Variables**.
3.  Atualize a variável `VITE_API_URL` (ou similar usada no seu `api.ts`) com o novo link do Render.
4.  Vá na aba **Deployments** e clique nos três pontinhos do último deploy > **Redeploy** para aplicar a mudança.

---
*Documento de contingência - Sistema Operacional Magalog (S.O.M)*
