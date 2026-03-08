# Arquitetura em Nuvem - Sistema Operacional Magalu (S.O.M)

Este documento detalha a infraestrutura em nuvem escolhida para hospedar o Sistema Operacional Magalu (S.O.M), explicando o papel de cada serviço e seus respectivos custos aplicados.

## A Arquitetura (O Trio de Ouro)

A infraestrutura foi dividida em três partes fundamentais, formando uma arquitetura clássica e moderna de "Full-Stack" (Banco de Dados, Backend e Frontend).

### 1. Neon (O Banco de Dados)
**O que ele guarda:** Dados permanentes (Usuários, Senhas, Perguntas do Checklist, Respostas da Auditoria, etc).

O Neon é um serviço especializado em hospedar bancos de dados relacionais avançados (PostgreSQL) na nuvem.
- **O problema que ele resolve:** Arquivos locais e bancos SQLite são apagados quando o servidor web reinicia. O Neon é um servidor seguro e permanente que fica sempre ligado e nunca deixa os dados se perderem.
- **Na prática:** É o cérebro da memória do sistema. Quando um usuário faz login, a senha dele é validada consultando os dados guardados em segurança no servidor do Neon.

### 2. Railway (O Backend / A "API")
**O que ele roda:** A lógica pesada, regras de negócio e a comunicação restrita com o banco.

O Railway é um serviço de hospedagem para aplicativos, backends e servidores Node.js.
- **O problema que ele resolve:** O Frontend (a tela do usuário) não pode se comunicar com o banco de dados de forma direta por questões de segurança. O Railway atua como um "garçom" seguro entre o restaurante (a tela) e a cozinha (o banco).
- **Na prática:** Quando o usuário clica em "Salvar", a tela envia a informação para o Railway. Ele processa as regras de segurança, pega a senha invisível de conexão, se conecta ao Neon de forma privada, salva os dados e devolve a resposta "Sucesso" para a tela.

### 3. Vercel (O Frontend / A Interface Visual)
**O que ele hospeda:** As telas, os botões, as cores (CSS), as páginas React e toda a navegação.

A Vercel é especialista em entregar sites visuais (HTML/JS/CSS) de forma global e ultra-rápida.
- **O problema que ele resolve:** Entrega a tela da forma mais rápida e leve possível para o navegador do usuário em qualquer lugar do Brasil. Em vez de calcular regras de negócio, ela apenas exibe o projeto estático e reage aos cliques.
- **Na prática:** É o endereço principal que os gerentes acessam. O código na Vercel sabe que, ao interagir com o sistema, deve chamar o endereço do Railway.

---

## Custos e Limites (Plano Gratuito / Free Tier)

É perfeitamente possível rodar este sistema 100% de graça por tempo indeterminado utilizando os limites generosos das plataformas, ideais para Produtos Mínimos Viáveis (MVP) locais.

### Vercel (Frontend)
- **Custo:** 100% Gratuito (Hobby Plan).
- **Limites:** Extremamente generoso. Oferece 100 GB de tráfego de dados por mês.
- **Na prática:** Suficiente para receber dezenas de milhares de visitantes no site sem nenhum custo, para sempre.

### Neon (Banco de Dados)
- **Custo:** 100% Gratuito (Free Tier).
- **Limites:** 1 Projeto Gratuito com até 500 MB de armazenamento de dados.
- **Na Prática:** Como textos, senhas e checklists pesam apenas alguns Kilobytes, 500 MB é espaço suficiente para guardar milhares de relatórios de auditorias e cadastros de funcionários sem estourar o limite. Além disso, no plano gratuito o banco "dorme" após 5 minutos de inatividade para economizar recursos (o que pode gerar 1 a 2 segundos de atraso no primeiro login do dia).

### Railway (Backend)
- **Custo:** Praticamente Gratuito (Hobby Plan baseado em Créditos).
- **Como funciona:** O Railway fornece **$5 dólares de créditos gratuitos todo mês**. O backend (Node.js + Prisma) consome apenas frações de centavos por dia.
- **Na prática:** Para um volume normal de acessos em um CD, os $5 gratuitos que são renovados todo dia 1º cobrem 100% do custo do servidor ligado 24/7. O sistema só desligaria se o uso intenso consumisse todos os 5 dólares antes do fim do mês (o que exigiria milhares de acessos diários contínuos).

---
*Documento gerado para o projeto S.O.M (Sistema Operacional Magalu).*
