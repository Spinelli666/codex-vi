import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MetaArtigo from "@/components/MetaArtigo";
import Tags from "@/components/Tags";
import prosa from "@/components/Prosa.module.css";
import { obterPostPublicado, vizinhosDe } from "@/lib/posts";
import { site } from "@/lib/site";
import estilos from "./artigo.module.css";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await obterPostPublicado(slug);
  if (!post) return { title: "Artigo não encontrado" };

  return {
    title: post.titulo,
    description: post.resumo,
    alternates: { canonical: `/blog/${post.slug}` },
    // Open Graph: a prévia que aparece ao compartilhar o link (WhatsApp, Discord, LinkedIn…)
    openGraph: {
      type: "article",
      title: post.titulo,
      description: post.resumo,
      url: `/blog/${post.slug}`,
      siteName: site.nome,
      locale: "pt_BR",
      publishedTime: post.publicadoEm.toISOString(),
      modifiedTime: post.atualizadoEm.toISOString(),
      tags: post.tags.map((t) => t.nome),
      ...(post.imagemCapa && { images: [post.imagemCapa] }),
    },
    twitter: { card: post.imagemCapa ? "summary_large_image" : "summary" },
  };
}

// O `params` é lido dentro de um componente com <Suspense>, assim o restante
// da página pode ser pré-renderizado (Cache Components do Next 16).
export default function PaginaArtigo({ params }: PageProps<"/blog/[slug]">) {
  return (
    <main>
      <Suspense fallback={<p className={estilos.carregando}>Carregando…</p>}>
        <Artigo params={params} />
      </Suspense>
    </main>
  );
}

async function Artigo({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const [post, vizinhos] = await Promise.all([obterPostPublicado(slug), vizinhosDe(slug)]);
  if (!post) notFound();

  return (
    <article>
      <header className={estilos.cabecalho}>
        <h1>{post.titulo}</h1>
        <MetaArtigo post={post} />
        <Tags tags={post.tags} />
      </header>

      <div className={prosa.prosa} dangerouslySetInnerHTML={{ __html: post.html }} />

      {(vizinhos.anterior || vizinhos.proximo) && (
        <nav aria-label="Outros artigos" className={estilos.vizinhos}>
          {vizinhos.anterior && (
            <Link href={`/blog/${vizinhos.anterior.slug}`} rel="prev" className={estilos.anterior}>
              <span>← Anterior</span>
              {vizinhos.anterior.titulo}
            </Link>
          )}
          {vizinhos.proximo && (
            <Link href={`/blog/${vizinhos.proximo.slug}`} rel="next" className={estilos.proximo}>
              <span>Próximo →</span>
              {vizinhos.proximo.titulo}
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
