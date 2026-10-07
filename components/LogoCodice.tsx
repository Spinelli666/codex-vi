import { camadasCodice, viewBoxCodice } from "@/lib/marca";

// Logo inline: as cores vêm dos tokens, então acompanha o tema claro/escuro.
export default function LogoCodice({ tamanho = 36, className }: { tamanho?: number; className?: string }) {
  return (
    <svg
      viewBox={viewBoxCodice}
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={camadasCodice.paginas} fill="var(--cor-dourado)" />
      <path d={camadasCodice.capa} fill="var(--cor-purpura)" />
      <path d={camadasCodice.lombada} fill="var(--cor-dourado)" />
      <path d={camadasCodice.recorte} fill="var(--cor-fundo)" />
    </svg>
  );
}
