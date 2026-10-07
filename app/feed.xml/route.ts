import { listarPublicados, obterPostPublicado } from "@/lib/posts";
import { site } from "@/lib/site";

// RSS 2.0 com os 20 posts mais recentes e o texto completo de cada um,
// para dar para ler o artigo inteiro direto no leitor de feed.
const LIMITE = 20;

function escaparXml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Leitores de feed não sabem a que site pertence "/uploads/x.png": deixa os links absolutos.
function urlsAbsolutas(html: string) {
  return html.replace(/(src|href)="\/(?!\/)/g, `$1="${site.url}/`);
}

// CDATA guarda HTML sem precisar escapar; só não pode conter "]]>".
function cdata(html: string) {
  return `<![CDATA[${html.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const posts = (await listarPublicados()).slice(0, LIMITE);
  const completos = await Promise.all(posts.map((p) => obterPostPublicado(p.slug)));

  const itens = completos
    .filter((p) => p !== null)
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      const tags = post.tags.map((t) => `      <category>${escaparXml(t.nome)}</category>`).join("\n");
      return `    <item>
      <title>${escaparXml(post.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.publicadoEm.toUTCString()}</pubDate>
      <description>${escaparXml(post.resumo)}</description>
      <content:encoded>${cdata(urlsAbsolutas(post.html))}</content:encoded>
${tags}
    </item>`;
    })
    .join("\n");

  const ultimaAtualizacao = posts[0]?.publicadoEm ?? new Date(0);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escaparXml(site.nome)}</title>
    <link>${site.url}</link>
    <description>${escaparXml(site.descricao)}</description>
    <language>${site.idioma}</language>
    <lastBuildDate>${ultimaAtualizacao.toUTCString()}</lastBuildDate>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
${itens}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
