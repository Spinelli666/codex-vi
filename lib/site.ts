// Configuração global do site, usada em metadados, RSS e sitemap.
export const site = {
  nome: "Codex VI",
  descricao: "Programação, jogos, literatura e filmes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  idioma: "pt-BR",
} as const;
