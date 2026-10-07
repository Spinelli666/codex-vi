import Link from "next/link";
import type { PostResumo } from "@/lib/posts";
import MetaArtigo from "./MetaArtigo";
import Tags from "./Tags";
import estilos from "./ListaArtigos.module.css";

// Lista enxuta: título, data, tempo de leitura, tags e resumo.
export default function ListaArtigos({ posts, comResumo = true }: { posts: PostResumo[]; comResumo?: boolean }) {
  if (posts.length === 0) {
    return <p className={estilos.vazio}>Nenhum artigo publicado ainda.</p>;
  }

  return (
    <ol className={estilos.lista}>
      {posts.map((post) => (
        <li key={post.slug} className={estilos.item}>
          <article>
            <h2 className={estilos.titulo}>
              <Link href={`/blog/${post.slug}`}>{post.titulo}</Link>
            </h2>
            <MetaArtigo post={post} />
            {comResumo && post.resumo && <p className={estilos.resumo}>{post.resumo}</p>}
            <Tags tags={post.tags} />
          </article>
        </li>
      ))}
    </ol>
  );
}
