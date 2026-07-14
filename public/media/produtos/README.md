# 📸 Mídia dos Produtos — Loja MEEC

Coloque aqui as **imagens ou vídeos** de cada produto para exibição nos cards do estoque.

## Formatos Suportados

| Formato | Extensão | Prioridade | Uso |
|:--------|:---------|:-----------|:----|
| **Vídeo** | `.mp4` | ⭐ Primeira | Reprodução automática, sem som (autoplay muted loop) |
| **GIF** | `.gif` | Segunda | Imagem animada (fallback se não houver MP4) |
| **Imagem** | `.jpg`, `.png`, `.webp` | Terceira | Foto estática do produto |

> 🔄 **Ordem de prioridade**: O site primeiro tenta carregar `.mp4`. Se não existir ou falhar, tenta `.gif`. Se também falhar, exibe o placeholder 📦.

## Como Adicionar

1. Descubra o ID do produto (veja tabela na API)
2. Salve o arquivo em `media/produtos/{id}.mp4` (vídeo) ou `media/produtos/{id}.gif` (imagem)
3. O card do produto exibirá automaticamente a mídia

### 📹 Para Vídeos (MP4)

| Atributo | Recomendação |
|:---------|:-------------|
| **Codec** | H.264 (maior compatibilidade) |
| **Resolução** | Máx 640×480 (proporção 4:3) |
| **Duração** | 3–10 segundos |
| **Tamanho** | Máximo 3 MB |
| **Áudio** | Sem áudio (o player usa `muted`) |
| **Loop** | Sim, em loop infinito |

### 📸 Para Imagens (GIF/JPG/PNG)

| Atributo | Recomendação |
|:---------|:-------------|
| **Tamanho** | Máximo **500 KB** |
| **Dimensões** | 400×300px (proporção 4:3) |
| **Nome** | `{id-do-produto}.gif` (ex: `1.gif`, `2.gif`) |

## Mapeamento Produto → Arquivo

| ID | Produto | Arquivo esperado |
|:---|:--------|:----------------|
| 1 | Óleo Motor 5W30 1L | `media/produtos/1.mp4` ou `media/produtos/1.gif` |
| 2 | Óleo Motor 10W40 1L | `media/produtos/2.mp4` ou `media/produtos/2.gif` |
| ... | ... | ... |

> 💡 **Dica:** Use [ezgif.com](https://ezgif.com) para otimizar GIFs ou converter vídeos para GIF. Para conversão de vídeos, use `ffmpeg -i input.mp4 -c:v libx264 -vf scale=640:-1 -an output.mp4`.

---

## Mapeamento Completo de IDs

```bash
curl -s https://crm-garagem-production.up.railway.app/api/public/meec-stock | python3 -c "import json,sys; [print(f'{p[\"id\"]:3d} | {p[\"nome\"]}') for p in json.load(sys.stdin)]"
```
