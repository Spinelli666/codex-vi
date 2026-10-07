import { Suspense } from "react";

export default function EditarPost({ params }: PageProps<"/admin/posts/[id]">) {
  return (
    <main>
      <h1>Editar artigo</h1>
      <Suspense fallback={<p>Carregando…</p>}>
        <Editor params={params} />
      </Suspense>
    </main>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/posts/[id]">, "params">) {
  const { id } = await params;

  return <p>Editor do post {id} (em construção).</p>;
}
