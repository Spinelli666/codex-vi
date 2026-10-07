import type { Metadata } from "next";
import Link from "next/link";
import { listarPublicados, type PostResumo } from "@/lib/posts";
import { anoDe, nomeDoMes } from "@/lib/texto";
import estilos from "./arquivo.module.css";

export const metadata: Metadata = {
  title: "Arquivo",
  description: "Todos os artigos do Codex VI, organizados por ano e mês.",
  alternates: { canonical: "/arquivo" },
};

type Mes = { nome: string; posts: PostResumo[] };

// Agrupa em [ano → meses → posts], mantendo a ordem do mais recente ao mais antigo.
function agrupar(posts: PostResumo[]) {
  const anos = new Map<number, Map<string, Mes>>();
  for (const post of posts) {
    const ano = anoDe(post.publicadoEm);
    const mes = nomeDoMes(post.publicadoEm);
    if (!anos.has(ano)) anos.set(ano, new Map());
    const meses = anos.get(ano)!;
    if (!meses.has(mes)) meses.set(mes, { nome: mes, posts: [] });
    meses.get(mes)!.posts.push(post);
  }
  return [...anos].map(([ano, meses]) => ({ ano, meses: [...meses.values()] }));
}

const formatoDia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" });

export default async function Arquivo() {
  const posts = await listarPublicados();
  const anos = agrupar(posts);

  return (
    <main>
      <h1>Arquivo</h1>
      {anos.length === 0 && <p>Nenhum artigo publicado ainda.</p>}
      {anos.map(({ ano, meses }) => (
        <section key={ano} aria-labelledby={`ano-${ano}`} className={estilos.ano}>
          <h2 id={`ano-${ano}`}>{ano}</h2>
          {meses.map((mes) => (
            <div key={mes.nome} className={estilos.mes}>
              <h3>{mes.nome}</h3>
              <ul>
                {mes.posts.map((post) => (
                  <li key={post.slug}>
                    <time dateTime={post.publicadoEm.toISOString()}>{formatoDia.format(post.publicadoEm)}</time>
                    <Link href={`/blog/${post.slug}`}>{post.titulo}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
