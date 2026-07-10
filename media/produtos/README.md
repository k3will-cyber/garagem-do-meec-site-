# 📸 Imagens dos Produtos — Loja MEEC

Coloque aqui os **GIFs otimizados** de cada produto para exibição na loja virtual.

## Formato Recomendado

| Atributo | Valor |
|:---------|:------|
| **Formato** | `.gif` (animado) ou `.webp` / `.jpg` (estático) |
| **Tamanho** | Máximo **500 KB** por arquivo |
| **Dimensões** | 400×300px (proporção 4:3) |
| **Nome** | `{id-do-produto}.gif` (ex: `1.gif`, `2.gif`) |

## Como Adicionar

1. Gere o GIF do produto (máx 500 KB)
2. Salve em `media/produtos/{id}.gif`
3. O estoque virtual exibirá automaticamente a imagem

## Mapeamento Produto → Arquivo

| ID | Produto | Arquivo |
|:---|:--------|:--------|
| 1 | Óleo Motor 5W30 1L | `media/produtos/1.gif` |
| 2 | Óleo Motor 10W40 1L | `media/produtos/2.gif` |
| ... | ... | ... |

> 💡 **Dica:** Use ferramentas como [ezgif.com](https://ezgif.com) para otimizar GIFs. Para imagens estáticas, priorize `.webp` pela melhor compressão.

---

## Mapeamento Completo de IDs

Execute o comando abaixo para listar todos os produtos e seus IDs:

```bash
# Local (SQLite)
node -e "const Database=require('better-sqlite3');const db=new Database('./data/garagem.db');db.prepare('SELECT id, nome FROM estoque ORDER BY id').all().forEach(p=>console.log(p.id,p.nome))"

# Ou veja no banco do CRM (PostgreSQL)
# curl -s https://crm-garagem-production.up.railway.app/api/public/meec-stock | python3 -m json.tool
```
