// Geometria do logo "Códice": um livro encadernado com VI recortado na capa.
// Fonte única usada pelo componente <LogoCodice> e pelo script que gera os
// favicons (npm run icones). As camadas são desenhadas nesta ordem.

export const viewBoxCodice = "5.5 4 56 56";

export const camadasCodice = {
  // Bloco de páginas aparecendo à direita da capa (dourado)
  paginas: "M48 9h4.5a1.5 1.5 0 0 1 1.5 1.5v43a1.5 1.5 0 0 1-1.5 1.5H48Z",
  // Capa (púrpura)
  capa: "M16 6h32a3 3 0 0 1 3 3v46a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z",
  // Lombada (dourado)
  lombada: "M16 6h4v52h-4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z",
  // Recortes na cor do fundo: duas faixas na lombada e o "VI" em capitulares romanas
  recorte:
    "M13 14h7v2h-7ZM13 48h7v2h-7Z" +
    "M24.78 24.48L29.58 24.48L33.42 36.32L36.62 24.48L38.22 24.48L33.42 39.84L31.82 39.84Z" +
    "M23.18 23.52L31.18 23.52L31.18 25.12L23.18 25.12Z" +
    "M35.34 23.52L39.82 23.52L39.82 25.12L35.34 25.12Z" +
    "M41.42 24.48L45.9 24.48L45.9 39.84L41.42 39.84Z" +
    "M39.82 23.52L47.5 23.52L47.5 25.12L39.82 25.12Z" +
    "M39.82 38.88L47.5 38.88L47.5 40.48L39.82 40.48Z",
} as const;
