import { readFile } from "node:fs/promises";
import path from "node:path";
import { PASTA_UPLOADS, TIPOS, type Extensao } from "@/lib/uploads";

// Serve as imagens enviadas. Em produção o Nginx pode servir a pasta direto
// (mais rápido); esta rota garante que funciona também em desenvolvimento.
export async function GET(_requisicao: Request, { params }: RouteContext<"/uploads/[...caminho]">) {
  const { caminho } = await params;

  // Só aceita o formato que o upload gera: AAAA/MM/nome.ext
  const valido =
    caminho.length === 3 &&
    /^\d{4}$/.test(caminho[0]) &&
    /^\d{2}$/.test(caminho[1]) &&
    /^[\w-]+\.(png|jpg|webp|gif)$/.test(caminho[2]);
  if (!valido) return new Response("Não encontrado", { status: 404 });

  // Defesa extra contra "../": o arquivo precisa estar dentro da pasta de uploads.
  const arquivo = path.join(PASTA_UPLOADS, ...caminho);
  if (path.relative(PASTA_UPLOADS, arquivo).startsWith("..")) {
    return new Response("Não encontrado", { status: 404 });
  }

  try {
    const conteudo = await readFile(arquivo);
    const extensao = path.extname(arquivo).slice(1) as Extensao;
    return new Response(conteudo, {
      headers: {
        "Content-Type": TIPOS[extensao],
        // O nome é aleatório e nunca muda de conteúdo: pode ficar em cache para sempre.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
