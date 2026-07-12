# 🚗 Garagem do MEEC — Site Institucional

Site institucional da **Garagem do MEEC**, oficina mecânica em Valparaíso de Goiás.

> **Status:** Site estático hospedado no **Netlify** com dados via API do CRM.

---

## 🌐 Acessos

| O quê | URL |
|:------|:----|
| **Site Público** | `https://garagem-do-meec.netlify.app` |
| **Painel Administrativo (CRM)** | [`https://crm-garagem-production.up.railway.app/login`](https://crm-garagem-production.up.railway.app/login) |
| **Loja MEEC** | [`https://crm-garagem-production.up.railway.app/meec-stock`](https://crm-garagem-production.up.railway.app/meec-stock) |

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
🌐 Netlify (Site Estático)          🖥️ Render (Backend/API)
   ┌─────────────────┐                 ┌──────────────────┐
   │  index.html      │ ── fetch() ──▶ │  Express.js API   │
   │  media/          │                 │  /api/public/*    │
   │  sw.js           │ ◀── JSON ───── │  PostgreSQL DB    │
   └─────────────────┘                 └──────────────────┘
```

O **site público** (HTML estático) fica no **Netlify**.
O **backend/API** (Express.js + PostgreSQL) fica no **Render**.

---

### 1️⃣ Backend → Render

O `render.yaml` na raiz do projeto já configura tudo automaticamente.

**Como fazer o deploy:**

1. Faça push do repositório para o **GitHub**
2. Acesse o [Render Dashboard](https://dashboard.render.com)
3. Clique em **New +** → **Blueprint**
4. Conecte seu GitHub e selecione este repositório
5. Render vai detectar o `render.yaml` e provisionar:
   - **Web Service:** `crm-garagem` (Express.js)
   - **PostgreSQL:** `crm-garagem-db`
6. As variáveis de ambiente são configuradas automaticamente pelo blueprint

**Variáveis de ambiente** (definidas no `render.yaml`):

| Variável | Origem | Descrição |
|:---------|:-------|:----------|
| `DATABASE_URL` | 📦 Render PostgreSQL | String de conexão (automática) |
| `SESSION_SECRET` | 🔑 Gerado automaticamente | Chave de sessão |
| `CORS_ORIGIN` | ✅ Fixo | URL do Netlify para CORS |
| `BASE_URL` | 🔄 Render | URL do serviço (automática) |
| `ADMIN_PASSWORD` | 🔑 Gerado automaticamente | Senha do admin |
| `REGISTER_SECRET` | 🔑 Gerado automaticamente | Segredo para registro |
| `NODE_ENV` | ✅ Fixo | `production` |
| `WHATSAPP_ENABLED` | ✅ Fixo | `false` (desligado no free) |

> ⚠️ **Atenção:** O plano **free** do Render PostgreSQL expira dados após 90 dias de inatividade. Para produção, faça upgrade para um plano pago.

**Após o deploy**, as rotas públicas ficam disponíveis em:
- `GET /api/public/meec-stock` — Lista produtos
- `GET /api/public/meec-stock/meta/categorias` — Categorias
- `GET /api/public/meec-stock/meta/summary` — Resumo
- `POST /api/public/leads` — Criar lead
- `GET /health` — Health check

---

### 2️⃣ Site Estático → Netlify

**Como fazer o deploy:**

1. No Render, copie a URL do seu Web Service (ex: `https://crm-garagem.onrender.com`)
2. No `index.html`, atualize a URL da API se necessário (buscar por `crm-garagem-production.up.railway.app`)
3. Faça push para o GitHub
4. Acesse o [Netlify](https://app.netlify.com) → **Import from Git**
5. Selecione o repositório
6. Configure:
   - **Build command:** (vazio — site estático)
   - **Publish directory:** `/`
7. Clique em **Deploy**

> O Netlify já está pré-configurado com `netlify.toml` e `_redirects`.

---

## 📞 Contato

- **WhatsApp:** [(61) 98125-7477](https://wa.me/5561981257477)
- **Instagram:** [@meec_pablo](https://instagram.com/meec_pablo)
- **Endereço:** R. 102, Jardim Ceu Azul — Valparaíso de Goiás · GO, 72871-102
