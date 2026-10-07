import type { Metadata } from "next";
import Link from "next/link";
import { sair } from "../acoes";
import estilos from "./painel.module.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Codex VI" },
  robots: { index: false, follow: false },
};

// Barra do painel. Não lê a sessão: cada página faz isso dentro de <Suspense>.
export default function LayoutPainel({ children }: LayoutProps<"/admin">) {
  return (
    <div className={estilos.painel}>
      <nav aria-label="Admin" className={estilos.barra}>
        <Link href="/admin/posts">Posts</Link>
        <Link href="/admin/posts/novo">Novo artigo</Link>
        <Link href="/" target="_blank">
          Ver site ↗
        </Link>
        <form action={sair} className={estilos.sair}>
          <button type="submit">Sair</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
