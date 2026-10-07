import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirSessao } from "@/lib/sessao";
import EditorPost from "../EditorPost";

export const metadata: Metadata = { title: "Novo artigo" };

export default function NovoPost() {
  return (
    <main>
      <h1>Novo artigo</h1>
      <Suspense fallback={<p>Carregando…</p>}>
        <Editor />
      </Suspense>
    </main>
  );
}

async function Editor() {
  await exigirSessao();
  return <EditorPost />;
}
