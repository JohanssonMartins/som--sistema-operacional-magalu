# SOM - Sistema Operacional Magalu

Este é o projeto front-end para a página "Em Construção" do **SOM (Sistema Operacional Magalu)**. O projeto foi desenvolvido utilizando tecnologias modernas para garantir alta performance, responsividade e uma interface agradável.

## 🚀 Tecnologias Utilizadas

- **[React 19](https://react.dev/)** - Biblioteca principal para construção da interface.
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática para maior segurança no código.
- **[Vite](https://vitejs.dev/)** - Ferramenta de build extremamente rápida.
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework de CSS utilitário para estilização rápida e responsiva.
- **[Motion (Framer Motion)](https://motion.dev/)** - Biblioteca para animações fluidas.
- **[Lucide React](https://lucide.dev/)** - Conjunto de ícones bonitos e consistentes.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- Um gerenciador de pacotes como `npm`, `yarn` ou `pnpm`.

## 🛠️ Como rodar o projeto localmente

Siga os passos abaixo para executar o site no seu ambiente de desenvolvimento:

1. **Clone o repositório** (se aplicável) ou baixe os arquivos do projeto.
2. **Abra o terminal** na pasta raiz do projeto.
3. **Instale as dependências** executando o comando:
   ```bash
   npm install
   ```
   *(ou `yarn install` / `pnpm install` dependendo do seu gerenciador)*

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse no navegador**:
   O terminal exibirá um link local (geralmente `http://localhost:5173` ou `http://localhost:3000`). Clique nele ou copie e cole no seu navegador.

## 📦 Como gerar o build de produção

Quando o site estiver pronto para ser publicado, você pode gerar a versão otimizada para produção:

```bash
npm run build
```

Isso criará uma pasta `dist/` contendo os arquivos estáticos minificados e prontos para serem hospedados em serviços como Vercel, Netlify, AWS S3, etc.

## 📝 Estrutura do Projeto

- `src/App.tsx`: Componente principal contendo a estrutura da página (Navbar e conteúdo central).
- `src/index.css`: Arquivo de estilos globais onde o Tailwind CSS é importado.
- `src/main.tsx`: Ponto de entrada da aplicação React.
- `vite.config.ts`: Configurações do Vite e plugins.
