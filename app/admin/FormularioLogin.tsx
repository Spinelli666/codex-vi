"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./acoes";
import estilos from "./admin.module.css";

export default function FormularioLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={acao} className={estilos.formulario}>
      <label>
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          defaultValue={estado.email}
          // React 19 limpa o formulário depois da ação; o defaultValue traz o e-mail de volta
          key={estado.email}
        />
      </label>
      <label>
        Senha
        <input type="password" name="senha" autoComplete="current-password" required />
      </label>

      {estado.erro && (
        <p role="alert" className={estilos.erro}>
          {estado.erro}
        </p>
      )}

      <button type="submit" className={estilos.botaoPrimario} disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
