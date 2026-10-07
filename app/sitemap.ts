import type { MetadataRoute } from "next";
import { listarPublicados, listarTagsUsadas } from "@/lib/posts";
import { site } from "@/lib/site";

// Índice do site para buscadores: páginas fixas, cada artigo e cada tag.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([listarPublicados(), listarTagsUsadas()]);
  const maisRecente = posts[0]?.atualizadoEm;

  const fixas = ["", "/blog", "/arquivo", "/portfolio", "/sobre"].map((caminho) => ({
    url: `${site.url}${caminho}`,
    ...(maisRecente && caminho !== "/portfolio" && caminho !== "/sobre" && { lastModified: maisRecente }),
  }));

  const artigos = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.atualizadoEm,
  }));

  const paginasDeTag = tags.map((tag) => ({ url: `${site.url}/tags/${tag.slug}` }));

  return [...fixas, ...artigos, ...paginasDeTag];
}
