import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { obterSessao } from "@/lib/sessao";
import FormularioLogin from "./FormularioLogin";
import estilos from "./admin.module.css";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function PaginaLogin() {
  return (
    <main className={estilos.login}>
      <h1>Admin</h1>
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    </main>
  );
}

// Quem já está logado vai direto para a lista de posts.
async function Login() {
  if (await obterSessao()) redirect("/admin/posts");
  return <FormularioLogin />;
}
