import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// TODO: incluir os posts publicados e as tags quando o banco estiver pronto.
export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = ["", "/blog", "/arquivo", "/portfolio", "/sobre"];
  return paginas.map((caminho) => ({ url: `${site.url}${caminho}` }));
}
