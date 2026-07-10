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
│   ├── logo oficial .png
│   ├── Create_an_ultra_premium_cinema (1).mp4
│   ├── motor-sujo.png / motor-limpo.png
│   ├── depois .jpeg / coifa mocineica anes.jpeg
│   └── produtos/         ← Pasta para GIFs otimizados dos produtos
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

## 🚀 Deploy (Netlify)

### Via Git (recomendado)

1. Faça push do repositório para o GitHub
2. Conecte no [Netlify](https://app.netlify.com) → "Import from Git"
3. Selecione o repositório
4. Configure:
   - **Build command:** (vazio — site estático)
   - **Publish directory:** `/`
5. Clique em "Deploy"

### Via CLI

```bash
npx netlify deploy --prod --dir=.
```

---

## 📞 Contato

- **WhatsApp:** [(61) 98125-7477](https://wa.me/5561981257477)
- **Instagram:** [@meec_pablo](https://instagram.com/meec_pablo)
- **Endereço:** R. 102, Jardim Ceu Azul — Valparaíso de Goiás · GO, 72871-102
