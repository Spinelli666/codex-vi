import type { Metadata } from "next";
import ListaArtigos from "@/components/ListaArtigos";
import Tags from "@/components/Tags";
import { listarPublicados, listarTagsUsadas } from "@/lib/posts";
import estilos from "./blog.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Todos os artigos do Codex VI, do mais recente ao mais antigo.",
  alternates: { canonical: "/blog" },
};

export default async function Blog() {
  const [posts, tags] = await Promise.all([listarPublicados(), listarTagsUsadas()]);

  return (
    <main>
      <h1>Blog</h1>
      {tags.length > 0 && (
        <nav aria-label="Filtrar por tag" className={estilos.filtro}>
          <Tags tags={tags} total />
        </nav>
      )}
      <ListaArtigos posts={posts} />
    </main>
  );
}
