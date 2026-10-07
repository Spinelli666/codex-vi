import Link from "next/link";
import ListaArtigos from "@/components/ListaArtigos";
import { listarPublicados } from "@/lib/posts";
import estilos from "./page.module.css";

export default async function Home() {
  const recentes = (await listarPublicados()).slice(0, 3);

  return (
    <main>
      <section className={estilos.apresentacao}>
        <h1>Codex VI</h1>
        <p className={estilos.lema}>Programação, jogos, literatura e filmes.</p>
        <p>
          Um caderno de anotações sobre o que eu construo, jogo, leio e assisto. Textos técnicos sem pressa,
          resenhas sem spoiler gratuito e o que mais couber entre uma coisa e outra.
        </p>
      </section>

      <section aria-labelledby="titulo-recentes" className={estilos.recentes}>
        <h2 id="titulo-recentes" className={estilos.rotulo}>
          Últimos artigos
        </h2>
        <ListaArtigos posts={recentes} />
        <p className={estilos.links}>
          <Link href="/blog">Todos os artigos →</Link>
          <Link href="/portfolio">Portfolio →</Link>
        </p>
      </section>
    </main>
  );
}
