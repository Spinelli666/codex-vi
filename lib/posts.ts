// Leitura dos posts publicados, para as páginas públicas.
//
// Cada função usa "use cache": o resultado fica guardado e é reaproveitado
// entre visitas. Quando o admin salva um post, ele chama updateTag(TAG_POSTS)
// e o cache é descartado na hora (veja app/admin/posts/acoes.ts).
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { renderizarMarkdown } from "@/lib/markdown";
import { minutosDeLeitura, resumoAutomatico } from "@/lib/texto";

export const TAG_POSTS = "posts";

export type TagResumo = { nome: string; slug: string };

export type PostResumo = {
  titulo: string;
  slug: string;
  resumo: string;
  publicadoEm: Date;
  atualizadoEm: Date;
  minutosLeitura: number;
  tags: TagResumo[];
};

export type PostCompleto = PostResumo & {
  html: string;
  imagemCapa: string | null;
};

const ordemTags = { tag: { nome: "asc" as const } };

/** Todos os posts publicados, do mais recente para o mais antigo. */
export async function listarPublicados(): Promise<PostResumo[]> {
  "use cache";
  cacheTag(TAG_POSTS);
  cacheLife("max");

  const posts = await db.post.findMany({
    where: { status: "publicado" },
    orderBy: { publicadoEm: "desc" },
    select: {
      titulo: true,
      slug: true,
      resumo: true,
      conteudo: true,
      publicadoEm: true,
      atualizadoEm: true,
      tags: { select: { tag: { select: { nome: true, slug: true } } }, orderBy: ordemTags },
    },
  });

  return posts.map((p) => ({
    titulo: p.titulo,
    slug: p.slug,
    resumo: p.resumo || resumoAutomatico(p.conteudo),
    publicadoEm: p.publicadoEm ?? p.atualizadoEm,
    atualizadoEm: p.atualizadoEm,
    minutosLeitura: minutosDeLeitura(p.conteudo),
    tags: p.tags.map((t) => t.tag),
  }));
}

/** Um post publicado, com o Markdown já convertido em HTML. */
export async function obterPostPublicado(slug: string): Promise<PostCompleto | null> {
  "use cache";
  cacheTag(TAG_POSTS);
  cacheLife("max");

  const p = await db.post.findFirst({
    where: { slug, status: "publicado" },
    include: { tags: { select: { tag: { select: { nome: true, slug: true } } }, orderBy: ordemTags } },
  });
  if (!p) return null;

  return {
    titulo: p.titulo,
    slug: p.slug,
    resumo: p.resumo || resumoAutomatico(p.conteudo),
    publicadoEm: p.publicadoEm ?? p.atualizadoEm,
    atualizadoEm: p.atualizadoEm,
    minutosLeitura: minutosDeLeitura(p.conteudo),
    tags: p.tags.map((t) => t.tag),
    imagemCapa: p.imagemCapa,
    html: await renderizarMarkdown(p.conteudo),
  };
}

/** Tags que têm pelo menos um post publicado, com a contagem. */
export async function listarTagsUsadas(): Promise<(TagResumo & { total: number })[]> {
  "use cache";
  cacheTag(TAG_POSTS);
  cacheLife("max");

  const posts = await listarPublicados();
  const contagem = new Map<string, TagResumo & { total: number }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const atual = contagem.get(tag.slug) ?? { ...tag, total: 0 };
      atual.total++;
      contagem.set(tag.slug, atual);
    }
  }
  return [...contagem.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Os posts de uma tag, ou null se a tag não existir ou não tiver posts publicados. */
export async function postsDaTag(slugTag: string) {
  const posts = await listarPublicados();
  const daTag = posts.filter((p) => p.tags.some((t) => t.slug === slugTag));
  if (daTag.length === 0) return null;
  const tag = daTag[0].tags.find((t) => t.slug === slugTag)!;
  return { tag, posts: daTag };
}

/** O post anterior (mais antigo) e o próximo (mais novo), para a navegação no fim do artigo. */
export async function vizinhosDe(slug: string) {
  const posts = await listarPublicados();
  const i = posts.findIndex((p) => p.slug === slug);
  return {
    anterior: i >= 0 ? (posts[i + 1] ?? null) : null,
    proximo: i > 0 ? posts[i - 1] : null,
  };
}
