import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { origemConfiavel } from "@/lib/requisicao";
import { obterSessao } from "@/lib/sessao";
import { detectarTipo, PASTA_UPLOADS, TAMANHO_MAXIMO } from "@/lib/uploads";

function erro(mensagem: string, status: number) {
  return NextResponse.json({ erro: mensagem }, { status });
}

// POST /api/uploads (campo "arquivo") → { url: "/uploads/2026/10/abc123.png" }
export async function POST(requisicao: Request) {
  // Rotas de API não têm a proteção CSRF automática das Server Actions.
  if (!(await origemConfiavel())) return erro("Origem não permitida.", 403);
  if (!(await obterSessao())) return erro("Faça login novamente.", 401);

  // Recusa cedo pelo tamanho declarado, antes de ler o corpo inteiro.
  const declarado = Number(requisicao.headers.get("content-length") ?? 0);
  if (declarado > TAMANHO_MAXIMO + 64 * 1024) return erro("A imagem passa de 5 MB.", 413);

  let arquivo: FormDataEntryValue | null;
  try {
    arquivo = (await requisicao.formData()).get("arquivo");
  } catch {
    return erro("Envio inválido.", 400);
  }
  if (!(arquivo instanceof File)) return erro("Nenhum arquivo enviado.", 400);
  if (arquivo.size > TAMANHO_MAXIMO) return erro("A imagem passa de 5 MB.", 413);

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const extensao = detectarTipo(bytes);
  if (!extensao) return erro("Formato não aceito. Use PNG, JPG, WebP ou GIF.", 415);

  // Nome aleatório: não dá para adivinhar nem sobrescrever arquivos existentes.
  const agora = new Date();
  const ano = String(agora.getFullYear());
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const nome = `${randomBytes(12).toString("base64url")}.${extensao}`;

  const pasta = path.join(PASTA_UPLOADS, ano, mes);
  await mkdir(pasta, { recursive: true });
  // wx: falha se já existir. O comentário evita que o bundler empacote a pasta de uploads.
  await writeFile(path.join(/*turbopackIgnore: true*/ pasta, nome), bytes, { flag: "wx" });

  return NextResponse.json({ url: `/uploads/${ano}/${mes}/${nome}` }, { status: 201 });
}
