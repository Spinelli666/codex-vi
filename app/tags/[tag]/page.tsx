import { Suspense } from "react";

export default function Tag({ params }: PageProps<"/tags/[tag]">) {
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

  return (
    <>
      <h1>#{tag}</h1>
      <p>Artigos com esta tag (em construção).</p>
    </>
  );
}
