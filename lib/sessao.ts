// Sessões do admin.
//
// O cookie leva um token aleatório de 32 bytes. No banco fica só o SHA-256
// desse token: quem ler o banco não consegue montar um cookie válido.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { NOME_COOKIE } from "@/lib/cookie-sessao";
import { db } from "@/lib/db";

const producao = process.env.NODE_ENV === "production";

const DURACAO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function hashDoToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function criarSessao(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_MS);

  await db.sessao.create({ data: { tokenHash: hashDoToken(token), usuarioId, expiraEm } });
  // Aproveita para limpar sessões vencidas.
  await db.sessao.deleteMany({ where: { expiraEm: { lt: new Date() } } });

  (await cookies()).set(NOME_COOKIE, token, {
    httpOnly: true, // JavaScript da página não consegue ler
    secure: producao, // só trafega por HTTPS
    sameSite: "lax", // não vai junto em POSTs vindos de outros sites
    path: "/",
    expires: expiraEm,
  });
}

/**
 * Sessão válida da requisição atual, ou null.
 * O `cache` do React evita consultar o banco mais de uma vez por requisição.
 */
export const obterSessao = cache(async () => {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  if (!token) return null;

  const sessao = await db.sessao.findUnique({
    where: { tokenHash: hashDoToken(token) },
    select: { id: true, expiraEm: true, usuario: { select: { id: true, email: true } } },
  });
  if (!sessao || sessao.expiraEm < new Date()) return null;

  return { id: sessao.id, usuario: sessao.usuario };
});

/** Para páginas e ações do admin: sem sessão válida, volta para o login. */
export async function exigirSessao() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/admin");
  return sessao;
}

export async function encerrarSessao() {
  const loja = await cookies();
  const token = loja.get(NOME_COOKIE)?.value;
  if (token) await db.sessao.deleteMany({ where: { tokenHash: hashDoToken(token) } });
  loja.delete(NOME_COOKIE);
}
