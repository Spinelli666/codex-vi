import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/sessao";
import { formatarData } from "@/lib/texto";
import admin from "../../admin.module.css";
import estilos from "./posts.module.css";

export const metadata: Metadata = { title: "Posts" };

export default function PaginaPosts({ searchParams }: PageProps<"/admin/posts">) {
  return (
    <main>
      <div className={estilos.topo}>
        <h1>Posts</h1>
        <Link href="/admin/posts/novo" className={admin.botaoPrimario}>
          Novo artigo
        </Link>
      </div>
      <Suspense fallback={<p>Carregando…</p>}>
        <ListaPosts searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ListaPosts({ searchParams }: Pick<PageProps<"/admin/posts">, "searchParams">) {
  await exigirSessao();
  const { ok } = await searchParams;

  // Sem cache: o admin sempre vê o estado real, inclusive rascunhos.
  const posts = await db.post.findMany({
    orderBy: [{ status: "asc" }, { atualizadoEm: "desc" }],
    select: { id: true, titulo: true, slug: true, status: true, publicadoEm: true, atualizadoEm: true },
  });

  return (
    <>
      {ok === "excluido" && (
        <p role="status" className={admin.sucesso}>
          Post excluído.
        </p>
      )}
      {posts.length === 0 ? (
        <p>Nenhum post ainda.</p>
      ) : (
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Status</th>
              <th scope="col">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/admin/posts/${post.id}`}>{post.titulo}</Link>
                  {post.status === "publicado" && (
                    <>
                      {" "}
                      <Link href={`/blog/${post.slug}`} target="_blank" className={estilos.ver}>
                        ver ↗
                      </Link>
                    </>
                  )}
                </td>
                <td>
                  <span className={post.status === "publicado" ? estilos.publicado : estilos.rascunho}>
                    {post.status === "publicado" ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className={estilos.data}>{formatarData(post.atualizadoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
