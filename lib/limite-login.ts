// Limite de tentativas de login contra força bruta.
// Conta só as falhas dos últimos 15 minutos, por IP e por e-mail.
import { db } from "@/lib/db";

const JANELA_MS = 15 * 60 * 1000;
const MAX_FALHAS_POR_IP = 5;
const MAX_FALHAS_POR_EMAIL = 10; // pega ataques vindos de vários IPs

export async function loginBloqueado(ip: string, email: string) {
  const desde = new Date(Date.now() - JANELA_MS);
  const [porIp, porEmail] = await Promise.all([
    db.tentativaLogin.count({ where: { ip, sucesso: false, criadoEm: { gte: desde } } }),
    db.tentativaLogin.count({ where: { email, sucesso: false, criadoEm: { gte: desde } } }),
  ]);
  return porIp >= MAX_FALHAS_POR_IP || porEmail >= MAX_FALHAS_POR_EMAIL;
}

export async function registrarTentativa(ip: string, email: string, sucesso: boolean) {
  await db.tentativaLogin.create({ data: { ip, email, sucesso } });
  // Mantém a tabela pequena: só o último dia interessa.
  await db.tentativaLogin.deleteMany({ where: { criadoEm: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
}
