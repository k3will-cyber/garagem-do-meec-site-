# 🚗 Garagem do MEEC — Site + CRM

Aplicativo full-stack da **Garagem do MEEC**, oficina mecânica em Valparaíso de Goiás.

> **Arquitetura:** Frontend React no **Netlify** + Backend/API no **Railway** + PostgreSQL.

---

## 🌐 Acessos

| O quê | URL |
|:------|:----|
| **Site Público (React)** | [`https://garagemdomeec.com.br`](https://garagemdomeec.com.br) |
| **Painel Admin (CRM)** | Configurar após deploy no Railway |

---

## 🌐 DNS — Domínio Próprio (Locaweb → Netlify)

O domínio `garagemdomeec.com.br` está registrado na **Locaweb**. Para apontar para o Netlify:

### Opção 1: Usar DNS da Locaweb (recomendado)

No painel da Locaweb, configure estes registros DNS:

| Tipo | Nome | Valor |
|:----|:----|:------|
| **CNAME** | `www` | `garagem-do-meec.netlify.app` |
| **CNAME** | `@` (apex) | `garagem-do-meec.netlify.app` |

> ⚠️ Se a Locaweb não suportar CNAME para domínio apex (`@`), use um **ALIAS** ou **ANAME**. Caso contrário, use a Opção 2.

### Opção 2: Usar DNS do Netlify (trocar nameservers)

No painel da Locaweb, altere os nameservers para:

```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

Depois, no **Netlify Dashboard**:
1. Vá em **Site Settings → Domain Management → Add custom domain**
2. Digite `garagemdomeec.com.br` e confirme
3. Netlify vai gerenciar o DNS automaticamente

---

## ✨ Funcionalidades

- **Dashboard interativo** com métricas, vagas e QR code animado
- **Galeria** com lightbox para fotos reais dos serviços
- **Before/After interativo** com slider de comparação
- **Estoque Virtual** carregado em tempo real do CRM (60+ produtos)
- **Carrinho de compras** com finalização via WhatsApp
- **Formulário de contato** que cria lead no CRM + abre chat WhatsApp
- **Portal do Cliente** para consulta de atendimentos
- **Design responsivo** com tema escuro e animações

---

## 🛠️ Stack

| Tecnologia | Uso |
|:-----------|:----|
| **HTML5 + Tailwind CSS** | Frontend (via CDN) |
| **JavaScript Vanilla** | Interatividade |
| **Netlify** | Hospedagem estática |
| **CRM (Railway/PostgreSQL)** | API de dados (estoque, leads) |

---

## 📁 Estrutura do Projeto

```
/
├── index.html            ← Site completo (única página)
├── netlify.toml          ← Configuração do Netlify
├── _redirects            ← Regras de redirect SPA
├── media/                ← Imagens, vídeos e GIFs dos produtos
│   ├── banner-fundo.jpeg
│   ├── logo-oficial.png
│   ├── logo-animado.mp4
│   ├── motor-sujo.png / motor-limpo.png
│   ├── depois.jpeg / coifa-mocineica-anes.jpeg
│   └── produtos/         ← Pasta para GIFs/imagens dos produtos
├── manifest.json         ← PWA manifest
└── sw.js                 ← Service Worker
```

---

## 🔌 Integração com o CRM

O site consome **APIs públicas** do CRM (não precisa de autenticação):

| Endpoint | Função |
|:---------|:-------|
| `GET /api/public/meec-stock` | Lista produtos do estoque MEEC |
| `GET /api/public/meec-stock/meta/categorias` | Categorias disponíveis |
| `GET /api/public/meec-stock/meta/summary` | Resumo do estoque |
| `POST /api/public/leads` | Cria novo lead (formulário de contato) |

**CRM URL:** `https://crm-garagem-production.up.railway.app`

---

## 📸 Adicionar GIFs de Produtos

1. Gere GIFs otimizados (máx 500 KB, 400×300px)
2. Salve em `media/produtos/{id-do-produto}.gif`
3. Faça deploy no Netlify

> 💡 Use [ezgif.com](https://ezgif.com) ou similar para otimizar.

---

## 🚀 Deploy

### Arquitetura

```
🌐 Netlify (Frontend React)          🖥️ Railway (Backend/API)
   ┌─────────────────────┐              ┌──────────────────┐
   │  client/ (React)    │── fetch()──▶│  server.js        │
   │  /api → Railway     │              │  /api/*           │
   │  media/             │◀── JSON ────│  PostgreSQL DB    │
   └─────────────────────┘              └──────────────────┘
```

O **frontend React** fica no **Netlify**.
O **backend/API** (Express.js + PostgreSQL) fica no **Railway**.

---

### 1️⃣ Backend → Railway

O `railway.json` na raiz do projeto configura tudo automaticamente.

**Como fazer o deploy:**

1. Faça push do repositório para o **GitHub**
2. Acesse o [Railway Dashboard](https://railway.app/dashboard)
3. Clique em **New Project** → **Deploy from GitHub repo**
4. Selecione o repositório `k3will-cyber/garagem-do-meec-site-`
5. Railway vai detectar o `railway.json` e configurar:
   - **Builder:** Nixpacks
   - **Start:** `node server.js`
6. Adicione um banco PostgreSQL: **+ New** → **Database** → **PostgreSQL**
7. Conecte as variáveis de ambiente:
   - Railway automaticamente injeta `DATABASE_URL` do PostgreSQL
   - Configure as variáveis manuais:

| Variável | Valor |
|:---------|:------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://garagem-do-meec.netlify.app,https://garagemdomeec.com.br` |
| `WHATSAPP_ENABLED` | `false` |
| `WHATSAPP_OWNER_NUMBER` | `5561981257477` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | (escolha uma senha forte) |
| `REGISTER_SECRET` | (escolha um segredo) |
| `SESSION_SECRET` | (escolha uma chave aleatória) |

8. Copie a URL gerada do Railway (ex: `https://crm-garagem-production.up.railway.app`)

---

### 2️⃣ Frontend → Netlify

O `netlify.toml` já está configurado para o React.

**Como fazer o deploy:**

1. No Railway, copie a URL do backend (ex: `https://crm-garagem.up.railway.app`)
2. Configure a variável no Netlify:
   - **Netlify Dashboard → Site settings → Environment variables**
   - Adicione: `VITE_API_URL = https://crm-garagem.up.railway.app`
3. O Netlify vai:
   - Rodar `cd client && npm install && npm run build`
   - Publicar a pasta `client/dist`
4. O frontend React vai consumir a API do Railway via `/api`

> O Netlify já está pré-configurado com `netlify.toml` e `_redirects`.

---

## 📞 Contato

- **WhatsApp:** [(61) 98125-7477](https://wa.me/5561981257477)
- **Instagram:** [@meec_pablo](https://instagram.com/meec_pablo)
- **Endereço:** R. 102, Jardim Ceu Azul — Valparaíso de Goiás · GO, 72871-102
