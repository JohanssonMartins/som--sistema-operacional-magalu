# Arquitetura em Nuvem - Sistema Operacional Magalog (S.O.M)

Este documento detalha a infraestrutura em nuvem escolhida para hospedar o Sistema Operacional Magalog (S.O.M), explicando o papel de cada serviço e como eles se comunicam.

## A Arquitetura (O Trio de Ouro)

A infraestrutura foi dividida em três partes fundamentais, formando uma arquitetura clássica e moderna de "Full-Stack" (Banco de Dados, Backend e Frontend).

### 1. Supabase (O Banco de Dados)
**O que ele guarda:** Dados permanentes (Usuários, Senhas, Perguntas do Checklist, Respostas da Auditoria, Metas, etc).

O Supabase é um serviço poderoso especializado em hospedar bancos de dados relacionais gigantes (PostgreSQL) na nuvem, sendo uma das maiores opções modernas open-source.
- **O problema que ele resolve:** Arquivos locais e bancos SQLite são apagados quando o servidor web reinicia. O Supabase oferece um servidor seguro e permanente que fica sempre ligado, com backups e segurança corporativa.
- **Na prática:** É o cérebro da memória do sistema. Quando um usuário faz login, a validação de acesso bate diretamente no servidor da Supabase.

### 2. Railway (O Backend / "A Inteligência")
**O que ele roda:** A lógica pesada, upload de arquivos e a comunicação restrita com o banco.

O Railway é um serviço de hospedagem para aplicativos, backends e servidores Node.js (Nosso `server/index.ts`).
- **O problema que ele resolve:** O Frontend (a tela do usuário) não pode se comunicar com o banco de dados de forma direta devido as credenciais confidenciais de banco. O Railway atua como um "garçom" seguro entre o restaurante (a tela) e a cozinha (o Supabase). É também onde as imagens e PDFs são processados e enviados ao Google Drive.
- **Na prática:** Quando o usuário clica em "Salvar Check-list", a tela na Vercel envia a informação para o Railway. Ele aplica regras de segurança, conecta de forma privada na Supabase usando o Prisma, salva os dados e devolve a resposta de sucesso.

### 3. Vercel (O Frontend / A Interface Visual)
**O que ele hospeda:** As telas de Dashboard, os botões, arquivos CSS, React.js e toda a mágica que os usuários veem.

A Vercel é líder global em entregar sites HTML/React de forma ultra-rápida.
- **O problema que ele resolve:** Entrega a tela da forma mais leve possível para o navegador do gerente, no celular ou no computador, em qualquer lugar do Brasil, sem precisarem baixar o sistema.
- **Na prática:** É o endereço ou link principal que a diretoria e os auditores acessam. 

---

## Custos e Desempenho (Ideais para MVPs e Sistemas Corporativos)

Essa estrutura utiliza as camadas "Tiers" gratuitos avançados das melhores plataformas do mercado, resultando em altíssima disponibilidade a um custo de infraestrutura quase zero, ideal para o cenário do Sistema Operacional Magalog.

- **Vercel (Frontend):** Entrega tráfego gigantesco 100% de graça (Hobby Tier). O uso de caches locais deixa a aplicação instantânea.
- **Railway (Backend):** Utiliza um modelo de créditos de US$ 5 ao mês (concedidos gratuitamente pela plataforma na versão grátis). Como nosso servidor consome apenas frações de processamento por requisição, o valor permite rodar a API ligada constantemente por meses a fio.
- **Supabase (Banco de Dados):** O plano grátis fornece PostgreSQL dedicado para abrigar gigabytes de dados, quantidade irreal de esgotar apenas salvando formulários e senhas dos colaboradores da Magalog. Arquivos grandes (fotos/PDFs) não gastam o armazenamento do Supabase, pois são espelhados para a API do Google Drive via Railway.

---
*Documento gerado para o projeto S.O.M (Sistema Operacional Magalog).*
