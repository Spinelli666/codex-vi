// Cria (ou atualiza a senha do) usuário admin a partir do .env.
// Uso: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { gerarHashSenha } from "../lib/senha";

function lerCredenciais() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;

  if (!email || !senha) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_SENHA no .env");
  }
  if (senha.length < 12) {
    throw new Error("ADMIN_SENHA precisa ter pelo menos 12 caracteres");
  }
  return { email, senha };
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const { email, senha } = lerCredenciais();
  const senhaHash = await gerarHashSenha(senha);

  await db.usuarioAdmin.upsert({
    where: { email },
    update: { senhaHash },
    create: { email, senhaHash },
  });

  console.log(`Admin pronto: ${email}`);
}

main().finally(() => db.$disconnect());
