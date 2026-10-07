// Imagens enviadas pelo admin. Ficam numa pasta fora do projeto em produção
// (UPLOAD_DIR na VPS) e são servidas em /uploads/AAAA/MM/arquivo.ext.
import path from "node:path";

// A pasta é decidida na hora de rodar (variável de ambiente), não no build:
// o comentário impede o bundler de tentar empacotar o que está nela.
export const PASTA_UPLOADS = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
export const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

export const TIPOS = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
} as const;

export type Extensao = keyof typeof TIPOS;

/**
 * Descobre o tipo pelos primeiros bytes do arquivo ("número mágico"), e não
 * pelo nome ou pelo tipo que o navegador declarou, que podem ser forjados.
 * SVG fica de fora de propósito: ele pode conter JavaScript.
 */
export function detectarTipo(bytes: Uint8Array): Extensao | null {
  const comeca = (...assinatura: number[]) => assinatura.every((b, i) => bytes[i] === b);
  const ascii = (inicio: number, texto: string) =>
    [...texto].every((c, i) => bytes[inicio + i] === c.charCodeAt(0));

  if (comeca(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (comeca(0xff, 0xd8, 0xff)) return "jpg";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "webp";
  return null;
}
