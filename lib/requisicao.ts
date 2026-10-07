// Informações da requisição usadas pela segurança do admin.
import { headers } from "next/headers";

/**
 * IP do visitante. Em produção o Nginx fica na frente do Next e precisa
 * repassar o IP real em X-Real-IP (e sobrescrever o que vier do cliente).
 */
export async function ipDoCliente() {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
}

/**
 * Proteção CSRF: só aceita a requisição se ela veio do próprio site.
 * Navegadores sempre mandam o cabeçalho Origin em POSTs; um formulário em
 * outro site que tente postar aqui terá uma origem diferente.
 * (As Server Actions do Next já fazem essa checagem; aqui ela vale também
 * para as rotas de API.)
 */
export async function origemConfiavel() {
  const h = await headers();
  const origem = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origem || !host) return false;
  try {
    return new URL(origem).host === host;
  } catch {
    return false;
  }
}
