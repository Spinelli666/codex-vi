import { site } from "@/lib/site";

// TODO: listar os posts publicados quando o banco estiver pronto.
export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${site.nome}</title>
    <link>${site.url}</link>
    <description>${site.descricao}</description>
    <language>${site.idioma}</language>
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
