"use client";

import { useSyncExternalStore } from "react";

type Tema = "claro" | "escuro";

const consultaEscuro = "(prefers-color-scheme: dark)";

// Tema em vigor: o escolhido no botão (data-theme) ou, sem escolha, o do sistema.
function temaAtual(): Tema {
  const escolhido = document.documentElement.dataset.theme;
  if (escolhido === "claro" || escolhido === "escuro") return escolhido;
  return matchMedia(consultaEscuro).matches ? "escuro" : "claro";
}

// Avisa o React quando o tema muda, seja pelo botão ou pelo sistema.
function observarTema(aoMudar: () => void) {
  const midia = matchMedia(consultaEscuro);
  const observador = new MutationObserver(aoMudar);
  midia.addEventListener("change", aoMudar);
  observador.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => {
    midia.removeEventListener("change", aoMudar);
    observador.disconnect();
  };
}

export default function BotaoTema({ className }: { className?: string }) {
  // No servidor o tema é desconhecido (null); no navegador lemos o real.
  const tema = useSyncExternalStore(observarTema, temaAtual, () => null);

  function alternar() {
    const novo: Tema = temaAtual() === "escuro" ? "claro" : "escuro";
    document.documentElement.dataset.theme = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch {
      // Sem localStorage (modo privado): o tema vale só nesta visita.
    }
  }

  const rotulo = tema === "escuro" ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button type="button" onClick={alternar} aria-label={rotulo} title={rotulo} className={className}>
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        {tema === "escuro" ? (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  );
}
