# Como Configurar a Inteligência Artificial (Gemini)

Para que as funcionalidades de **Sugestão de Plano de Ação** e **Análise de Evidências** funcionem, você precisa configurar uma chave de API do Google Gemini.

### Passo 1: Obter a Chave de API
1.  Acesse o [Google AI Studio](https://aistudio.google.com/).
2.  Faça login com sua conta Google.
3.  Clique em **"Get API key"** no menu lateral.
4.  Clique em **"Create API key"** (pode ser em um projeto novo ou existente).
5.  Copie a chave gerada.

### Passo 2: Configurar no Projeto
1.  Abra o arquivo `.env` na raiz do projeto `som--sistema-operacional-magalu`.
2.  Localize a linha:
    ```env
    GEMINI_API_KEY="MY_GEMINI_API_KEY"
    ```
3.  Substitua `"MY_GEMINI_API_KEY"` pela sua chave copiada:
    ```env
    GEMINI_API_KEY="AIzaSyA..."
    ```
4.  Salve o arquivo.

### Passo 3: Reiniciar o Servidor
1.  Pare o servidor que está rodando no terminal (geralmente com `Ctrl+C`).
2.  Inicie-o novamente com:
    ```bash
    npm run server
    ```

---
**Nota:** A versão gratuita do Gemini tem limites de requisições por minuto, o que é suficiente para testes e apresentações pequenas. Para uso em larga escala, verifique os planos no Google Cloud.
