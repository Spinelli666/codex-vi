// Verifica o contraste WCAG de todos os pares texto/fundo dos tokens.
// Lê os valores direto de styles/tokens.css. Uso: npm run contraste
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8");
const tokens = {};
for (const [, nome, claro, escuro] of css.matchAll(/--([\w-]+):\s*light-dark\((#\w{6}),\s*(#\w{6})\)/g)) {
  tokens[nome] = { claro, escuro };
}

const fundos = ["cor-fundo", "cor-superficie"];
const textos = ["cor-texto", "cor-texto-suave", "cor-purpura", "cor-dourado", "cor-erro"];
const MINIMO = 4.5;

// Componentes de interface (bordas de campos) precisam de 3:1 contra o fundo.
const interface_ = ["cor-borda-campo"];
const MINIMO_INTERFACE = 3;

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

let falhas = 0;
for (const tema of ["claro", "escuro"]) {
  console.log(`\nTema ${tema}`);
  for (const fundo of fundos) {
    for (const texto of textos) {
      const razao = contraste(tokens[texto][tema], tokens[fundo][tema]);
      const ok = razao >= MINIMO;
      if (!ok) falhas++;
      console.log(`  ${ok ? "ok   " : "FALHA"} ${texto.padEnd(16)} sobre ${fundo.padEnd(15)} ${razao.toFixed(2)}:1`);
    }
  }
  for (const item of interface_) {
    const razao = contraste(tokens[item][tema], tokens["cor-fundo"][tema]);
    const ok = razao >= MINIMO_INTERFACE;
    if (!ok) falhas++;
    console.log(`  ${ok ? "ok   " : "FALHA"} ${item.padEnd(16)} sobre cor-fundo       ${razao.toFixed(2)}:1 (mín. 3)`);
  }
}

if (falhas) {
  console.error(`\n${falhas} par(es) abaixo de ${MINIMO}:1`);
  process.exit(1);
}
console.log(`\nTodos os pares passam (texto ${MINIMO}:1, interface ${MINIMO_INTERFACE}:1).`);
