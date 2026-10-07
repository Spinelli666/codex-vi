"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { loginBloqueado, registrarTentativa } from "@/lib/limite-login";
import { ipDoCliente, origemConfiavel } from "@/lib/requisicao";
import { criarSessao, encerrarSessao } from "@/lib/sessao";
import { gerarHashSenha, verificarSenha } from "@/lib/senha";

export type EstadoLogin = { erro?: string; email?: string };

// Hash de uma senha qualquer, usado quando o e-mail não existe. Assim o login
// leva o mesmo tempo nos dois casos, e ninguém descobre e-mails válidos
// medindo quanto a resposta demora.
let hashFalso: Promise<string> | undefined;

export async function entrar(_anterior: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const email = String(dados.get("email") ?? "").trim().toLowerCase();
  const senha = String(dados.get("senha") ?? "");

  if (!(await origemConfiavel())) return { erro: "Requisição inválida.", email };
  // Senhas absurdamente longas deixariam o Argon2 lento de propósito (ataque de negação de serviço).
  if (!email || !senha || email.length > 254 || senha.length > 256) {
    return { erro: "Preencha e-mail e senha.", email };
  }

  const ip = await ipDoCliente();
  if (await loginBloqueado(ip, email)) {
    return { erro: "Muitas tentativas. Espere 15 minutos e tente de novo.", email };
  }

  const usuario = await db.usuarioAdmin.findUnique({ where: { email } });
  hashFalso ??= gerarHashSenha("senha-que-nao-existe");
  const senhaOk = await verificarSenha(senha, usuario?.senhaHash ?? (await hashFalso));
  const sucesso = Boolean(usuario) && senhaOk;

  await registrarTentativa(ip, email, sucesso);
  // A mesma mensagem para e-mail inexistente e senha errada.
  if (!usuario || !sucesso) return { erro: "E-mail ou senha incorretos.", email };

  await criarSessao(usuario.id);
  redirect("/admin/posts");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin");
}
