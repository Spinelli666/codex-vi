import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/sessao";
import EditorPost from "../EditorPost";

export const metadata: Metadata = { title: "Editar artigo" };

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mensagem mostrada depois de salvar (a ação redireciona com ?ok=...).
const mensagens: Record<string, string> = {
  salvar: "Alterações salvas.",
  publicar: "Publicado! Já está no blog.",
  despublicar: "Post despublicado. Ele voltou a ser rascunho.",
};

export default function EditarPost({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  return (
    <main>
      <h1>Editar artigo</h1>
      <Suspense fallback={<p>Carregando…</p>}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Editor({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  await exigirSessao();
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  if (!FORMATO_UUID.test(id)) notFound();

  const post = await db.post.findUnique({
    where: { id },
    include: { tags: { select: { tag: { select: { nome: true } } }, orderBy: { tag: { nome: "asc" } } } },
  });
  if (!post) notFound();

  return (
    <>
      {post.status === "publicado" && (
        <p>
          <Link href={`/blog/${post.slug}`} target="_blank">
            Ver no blog ↗
          </Link>
        </p>
      )}
      <EditorPost
        // Remonta o editor com os dados novos a cada salvamento.
        key={post.atualizadoEm.toISOString()}
        mensagem={typeof ok === "string" ? mensagens[ok] : undefined}
        inicial={{
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          resumo: post.resumo ?? "",
          conteudo: post.conteudo,
          tags: post.tags.map((t) => t.tag.nome).join(", "),
          status: post.status,
        }}
      />
    </>
  );
}
