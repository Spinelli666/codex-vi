// Utilitários de texto usados no blog e no admin.

const fusoHorario = "America/Sao_Paulo";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: fusoHorario,
});

const formatoMes = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: fusoHorario });
const formatoAno = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: fusoHorario });

/** "7 de outubro de 2026" */
export function formatarData(data: Date) {
  return formatoData.format(data);
}

/** "outubro" */
export function nomeDoMes(data: Date) {
  return formatoMes.format(data);
}

/** 2026 (no fuso de São Paulo, não no do servidor) */
export function anoDe(data: Date) {
  return Number(formatoAno.format(data));
}

/** "Olá, Mundo!" → "ola-mundo" */
export function gerarSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Markdown → texto corrido, sem a sintaxe. Usado no resumo automático e na contagem de palavras. */
export function markdownParaTexto(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // blocos de código
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // imagens
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → só o texto
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // títulos, citações, listas
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Minutos de leitura, a ~200 palavras por minuto. Código conta como texto. */
export function minutosDeLeitura(markdown: string) {
  const palavras = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

/** Primeiras ~160 letras do texto, cortando numa palavra inteira. */
export function resumoAutomatico(markdown: string, limite = 160) {
  const texto = markdownParaTexto(markdown);
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  return corte.slice(0, corte.lastIndexOf(" ")).replace(/[,.;:]$/, "") + "…";
}
