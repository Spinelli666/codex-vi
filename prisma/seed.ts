// Cria (ou atualiza a senha do) usuário admin a partir do .env e cria os
// posts de exemplo que ainda não existem. Uso: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { gerarHashSenha } from "../lib/senha";
import { gerarSlug } from "../lib/texto";
import { exemplos } from "./exemplos";

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

async function criarAdmin() {
  const { email, senha } = lerCredenciais();
  const senhaHash = await gerarHashSenha(senha);

  await db.usuarioAdmin.upsert({
    where: { email },
    update: { senhaHash },
    create: { email, senhaHash },
  });

  console.log(`Admin pronto: ${email}`);
}

async function criarExemplos() {
  let criados = 0;

  for (const exemplo of exemplos) {
    const existe = await db.post.findUnique({ where: { slug: exemplo.slug }, select: { id: true } });
    if (existe) continue;

    const publicadoEm = new Date(Date.now() - exemplo.diasAtras * 24 * 60 * 60 * 1000);
    const tags = await Promise.all(
      exemplo.tags.map((nome) =>
        db.tag.upsert({ where: { slug: gerarSlug(nome) }, update: {}, create: { nome, slug: gerarSlug(nome) } }),
      ),
    );

    await db.post.create({
      data: {
        titulo: exemplo.titulo,
        slug: exemplo.slug,
        resumo: exemplo.resumo,
        conteudo: exemplo.conteudo,
        status: "publicado",
        criadoEm: publicadoEm,
        publicadoEm,
        tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
      },
    });
    criados++;
  }

  console.log(`Posts de exemplo: ${criados} criado(s), ${exemplos.length - criados} já existia(m)`);
}

async function main() {
  await criarAdmin();
  await criarExemplos();
}

main().finally(() => db.$disconnect());
