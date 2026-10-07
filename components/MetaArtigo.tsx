import type { PostResumo } from "@/lib/posts";
import { formatarData } from "@/lib/texto";
import estilos from "./MetaArtigo.module.css";

// "7 de outubro de 2026 · 4 min de leitura"
export default function MetaArtigo({ post }: { post: Pick<PostResumo, "publicadoEm" | "minutosLeitura"> }) {
  return (
    <p className={estilos.meta}>
      <time dateTime={post.publicadoEm.toISOString()}>{formatarData(post.publicadoEm)}</time>
      <span aria-hidden="true"> · </span>
      {post.minutosLeitura} min de leitura
    </p>
  );
}
