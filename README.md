# Codex VI

Blog e portfólio pessoal sobre programação, jogos, literatura e filmes, com identidade visual inspirada na Roma antiga.

**Stack:** Next.js 16 (App Router) · TypeScript · PostgreSQL · Prisma 7 · CSS Modules (sem Tailwind)

## Funcionalidades

| | Status |
|---|---|
| Layout, tema claro/escuro, tipografia e logo | ✅ |
| Schema do banco (posts, tags, curtidas, admin, sessões) | ✅ |
| Lista de artigos, página do artigo, tags e arquivo | ✅ |
| Markdown com realce de sintaxe (Shiki) | ✅ |
| Busca (full-text do Postgres) | 🚧 |
| Curtidas anônimas (cookie + `unique (post_id, visitante_id)`) | 🚧 |
| Comentários via [Giscus](https://giscus.app) (GitHub Discussions) | 🚧 |
| RSS (`/feed.xml`), `sitemap.xml`, Open Graph por post | ✅ |
| Painel `/admin`: login, editor Markdown, upload de imagens | ✅ |

## Rodando localmente

Pré-requisitos: **Node.js 24+** e **Docker Desktop**.

```bash
npm install                # instala dependências e gera o cliente Prisma
cp .env.example .env       # depois edite ADMIN_EMAIL e ADMIN_SENHA
npm run db:up              # sobe o Postgres (porta 5433)
npm run db:migrate         # cria as tabelas
npm run db:seed            # cria o admin e 3 posts de exemplo
npm run dev                # http://localhost:3000
```

O painel fica em [localhost:3000/admin](http://localhost:3000/admin), com o e-mail e a senha do `.env`.

> O `npm run build` lê os posts do banco para gerar as páginas, então o Postgres precisa estar rodando.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run db:up` / `db:down` | Liga/desliga o Postgres do Docker (os dados ficam no volume) |
| `npm run db:migrate` | Cria e aplica uma migration após mudar `prisma/schema.prisma` |
| `npm run db:seed` | Cria o admin ou atualiza a senha dele a partir do `.env` |
| `npm run db:studio` | Interface web para ver os dados |
| `npm run contraste` | Verifica o contraste WCAG de todos os pares de cor dos tokens |
| `npm run icones` | Regera favicon, `icon.svg` e `apple-icon.png` a partir de `lib/marca.ts` |

## Variáveis de ambiente

Veja [`.env.example`](.env.example).

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão com o Postgres |
| `NEXT_PUBLIC_SITE_URL` | URL pública (RSS, sitemap, Open Graph) |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | Credenciais do admin criadas pelo seed (senha com 12+ caracteres) |
| `UPLOAD_DIR` | Pasta onde ficam as imagens enviadas |

## Produção (Nginx)

- Repassar o IP real para o limite de tentativas de login: `proxy_set_header X-Real-IP $remote_addr;`
- Permitir uploads de até 5 MB: `client_max_body_size 6m;`
- Opcional: servir `/uploads/` direto da pasta `UPLOAD_DIR` (mais rápido que passar pelo Next).
