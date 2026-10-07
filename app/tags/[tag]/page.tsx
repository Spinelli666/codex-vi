import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ListaArtigos from "@/components/ListaArtigos";
import { postsDaTag } from "@/lib/posts";

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  const resultado = await postsDaTag(tag);
  if (!resultado) return { title: "Tag não encontrada" };

  return {
    title: `#${resultado.tag.nome}`,
    description: `Artigos do Codex VI com a tag ${resultado.tag.nome}.`,
    alternates: { canonical: `/tags/${resultado.tag.slug}` },
  };
}

export default function PaginaTag({ params }: PageProps<"/tags/[tag]">) {
  return (
    <main>
      <Suspense fallback={<p>Carregando…</p>}>
        <ArtigosDaTag params={params} />
      </Suspense>
    </main>
  );
}

async function ArtigosDaTag({ params }: Pick<PageProps<"/tags/[tag]">, "params">) {
  const { tag } = await params;
  const resultado = await postsDaTag(tag);
  if (!resultado) notFound();

  const { posts } = resultado;
  return (
    <>
      <h1>#{resultado.tag.nome}</h1>
      <p>
        {posts.length} {posts.length === 1 ? "artigo" : "artigos"} · <Link href="/blog">ver todos</Link>
      </p>
      <ListaArtigos posts={posts} />
    </>
  );
}
