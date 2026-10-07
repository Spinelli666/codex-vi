import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main>
      <h1>Página não encontrada</h1>
      <p>
        Este pergaminho se perdeu no incêndio da biblioteca. Talvez o endereço esteja errado, ou o artigo tenha sido
        removido.
      </p>
      <p>
        <Link href="/blog">Ver todos os artigos</Link> · <Link href="/">Voltar ao início</Link>
      </p>
    </main>
  );
}
