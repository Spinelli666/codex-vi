import { Suspense } from "react";

// O `params` é lido dentro de um componente filho com <Suspense>, assim o
// restante da página pode ser pré-renderizado (Cache Components do Next 16).
export default function Artigo({ params }: PageProps<"/blog/[slug]">) {
  return (
    <main>
      <Suspense fallback={<p>Carregando…</p>}>
        <ConteudoArtigo params={params} />
      </Suspense>
    </main>
  );
}

async function ConteudoArtigo({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;

  return (
    <>
      <h1>{slug}</h1>
      <p>Página do artigo (em construção).</p>
    </>
  );
}
