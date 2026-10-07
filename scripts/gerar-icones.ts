// Gera os ícones do site a partir de lib/marca.ts. Uso: npm run icones
//   app/icon.svg        favicon moderno (troca de cor com o tema do navegador)
//   app/favicon.ico     fallback para navegadores antigos (16, 32 e 48 px)
//   app/apple-icon.png  ícone da tela inicial do iPhone (180 px, com fundo)
// O Next detecta esses arquivos em app/ e cria as tags <link> sozinho.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { camadasCodice, viewBoxCodice } from "../lib/marca";

const claro = { purpura: "#4a1942", dourado: "#7d5f2e", fundo: "#f7f5f0" };
const escuro = { purpura: "#c9a0c0", dourado: "#b8935a", fundo: "#161512" };

function caminhos() {
  return [
    `<path class="ouro" d="${camadasCodice.paginas}"/>`,
    `<path class="capa" d="${camadasCodice.capa}"/>`,
    `<path class="ouro" d="${camadasCodice.lombada}"/>`,
    `<path class="recorte" d="${camadasCodice.recorte}"/>`,
  ].join("");
}

function estilo(c: typeof claro) {
  return `.capa{fill:${c.purpura}}.ouro{fill:${c.dourado}}.recorte{fill:${c.fundo}}`;
}

// SVG com cores fixas, para virar PNG. Com `fundo`, pinta um quadrado atrás.
function svgEstatico(fundo?: string) {
  const quadrado = fundo ? `<rect x="-50" y="-50" width="200" height="200" fill="${fundo}"/>` : "";
  const viewBox = fundo ? "1.5 0 64 64" : viewBoxCodice; // margem extra no ícone do iPhone
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><style>${estilo(claro)}</style>${quadrado}${caminhos()}</svg>`;
}

// ICO aceita PNGs embutidos (Windows Vista+ e todos os navegadores atuais).
function montarIco(pngs: { tamanho: number; dados: Buffer }[]) {
  const cabecalho = Buffer.alloc(6);
  cabecalho.writeUInt16LE(0, 0);
  cabecalho.writeUInt16LE(1, 2); // tipo: ícone
  cabecalho.writeUInt16LE(pngs.length, 4);

  let deslocamento = 6 + 16 * pngs.length;
  const entradas = pngs.map(({ tamanho, dados }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(tamanho % 256, 0);
    e.writeUInt8(tamanho % 256, 1);
    e.writeUInt16LE(1, 4); // planos de cor
    e.writeUInt16LE(32, 6); // bits por pixel
    e.writeUInt32LE(dados.length, 8);
    e.writeUInt32LE(deslocamento, 12);
    deslocamento += dados.length;
    return e;
  });

  return Buffer.concat([cabecalho, ...entradas, ...pngs.map((p) => p.dados)]);
}

async function main() {
  const require = createRequire(import.meta.url);
  await initWasm(readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm")));

  const renderizar = (svg: string, tamanho: number) =>
    Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: tamanho } }).render().asPng());

  const svgAdaptavel =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxCodice}">` +
    `<style>${estilo(claro)}@media (prefers-color-scheme:dark){${estilo(escuro)}}</style>` +
    `${caminhos()}</svg>\n`;
  writeFileSync("app/icon.svg", svgAdaptavel);

  const ico = montarIco([16, 32, 48].map((tamanho) => ({ tamanho, dados: renderizar(svgEstatico(), tamanho) })));
  writeFileSync("app/favicon.ico", ico);

  writeFileSync("app/apple-icon.png", renderizar(svgEstatico(claro.fundo), 180));

  console.log("Gerados: app/icon.svg, app/favicon.ico, app/apple-icon.png");
}

main();
