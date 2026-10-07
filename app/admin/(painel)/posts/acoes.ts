"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { renderizarMarkdown } from "@/lib/markdown";
import { TAG_POSTS } from "@/lib/posts";
import { origemConfiavel } from "@/lib/requisicao";
import { exigirSessao } from "@/lib/sessao";
import { gerarSlug } from "@/lib/texto";

export type EstadoEditor = { erro?: string };

const LIMITES = { titulo: 200, resumo: 300, conteudo: 200_000, tags: 10, tag: 40 };
const FORMATO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Toda ação do admin começa aqui: origem do próprio site + sessão válida.
async function autorizar() {
  if (!(await origemConfiavel())) throw new Error("Origem da requisição não permitida.");
  return exigirSessao();
}

function lerTags(texto: string) {
  const nomes = texto
    .split(",")
    .map((t) => t.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  // Sem repetidas (comparando pelo slug: "Godot" e "godot" são a mesma tag).
  // Vale a primeira grafia escrita.
  const unicas = new Map<string, string>();
  for (const nome of nomes) {
    const slug = gerarSlug(nome);
    if (slug && !unicas.has(slug)) unicas.set(slug, nome);
  }
  return [...unicas].map(([slug, nome]) => ({ slug, nome }));
}

export async function salvarPost(_anterior: EstadoEditor, dados: FormData): Promise<EstadoEditor> {
  await autorizar();

  const id = String(dados.get("id") ?? "");
  const acao = String(dados.get("acao") ?? "salvar"); // salvar | publicar | despublicar
  const titulo = String(dados.get("titulo") ?? "").trim();
  const slug = String(dados.get("slug") ?? "").trim();
  const resumo = String(dados.get("resumo") ?? "").trim();
  const conteudo = String(dados.get("conteudo") ?? "");
  const tags = lerTags(String(dados.get("tags") ?? ""));

  if (id && !FORMATO_UUID.test(id)) return { erro: "Post inválido." };
  if (!titulo) return { erro: "O título é obrigatório." };
  if (titulo.length > LIMITES.titulo) return { erro: `O título passa de ${LIMITES.titulo} caracteres.` };
  if (!FORMATO_SLUG.test(slug)) {
    return { erro: "O slug só pode ter letras minúsculas sem acento, números e hífens (ex.: meu-post)." };
  }
  if (resumo.length > LIMITES.resumo) return { erro: `O resumo passa de ${LIMITES.resumo} caracteres.` };
  if (!conteudo.trim()) return { erro: "O artigo está vazio." };
  if (conteudo.length > LIMITES.conteudo) return { erro: "O artigo está grande demais." };
  if (tags.length > LIMITES.tags) return { erro: `Use no máximo ${LIMITES.tags} tags.` };
  if (tags.some((t) => t.nome.length > LIMITES.tag)) return { erro: `Cada tag pode ter até ${LIMITES.tag} caracteres.` };

  const outroComSlug = await db.post.findUnique({ where: { slug }, select: { id: true } });
  if (outroComSlug && outroComSlug.id !== id) return { erro: `Já existe outro post com o slug "${slug}".` };

  const atual = id ? await db.post.findUnique({ where: { id }, select: { status: true, publicadoEm: true } }) : null;
  if (id && !atual) return { erro: "Este post não existe mais." };

  // "salvar" mantém o status atual; post novo nasce rascunho.
  const status = acao === "publicar" ? "publicado" : acao === "despublicar" ? "rascunho" : (atual?.status ?? "rascunho");
  // A data de publicação é a da primeira vez; despublicar e republicar não muda.
  const publicadoEm = status === "publicado" ? (atual?.publicadoEm ?? new Date()) : (atual?.publicadoEm ?? null);

  const salvo = await db.$transaction(async (tx) => {
    const registros = await Promise.all(
      tags.map((t) => tx.tag.upsert({ where: { slug: t.slug }, update: {}, create: t })),
    );
    const campos = { titulo, slug, resumo: resumo || null, conteudo, status, publicadoEm } as const;

    const post = id
      ? await tx.post.update({ where: { id }, data: campos })
      : await tx.post.create({ data: campos });

    await tx.postTag.deleteMany({ where: { postId: post.id } });
    await tx.postTag.createMany({ data: registros.map((tag) => ({ postId: post.id, tagId: tag.id })) });
    // Tags que ficaram sem nenhum post somem.
    await tx.tag.deleteMany({ where: { posts: { none: {} } } });
    return post;
  });

  // Descarta o cache das páginas públicas: a mudança aparece na hora.
  updateTag(TAG_POSTS);
  redirect(`/admin/posts/${salvo.id}?ok=${acao}`);
}

export async function excluirPost(id: string) {
  await autorizar();
  if (!FORMATO_UUID.test(id)) throw new Error("Post inválido.");

  await db.post.deleteMany({ where: { id } });
  await db.tag.deleteMany({ where: { posts: { none: {} } } });
  updateTag(TAG_POSTS);
  redirect("/admin/posts?ok=excluido");
}

/** Converte o Markdown do editor em HTML, exatamente como no blog. */
export async function previsualizar(markdown: string) {
  await autorizar();
  return renderizarMarkdown(markdown.slice(0, LIMITES.conteudo));
}
