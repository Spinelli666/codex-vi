import type { NextConfig } from "next";

// Cabeçalhos de segurança enviados em todas as respostas.
const cabecalhosSeguranca = [
  // Navegador não "adivinha" o tipo do arquivo (evita tratar imagem como HTML)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Outros sites não podem abrir o Codex VI dentro de um iframe (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Ao clicar num link externo, o outro site só vê o domínio, não a URL inteira
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desliga recursos do navegador que o blog não usa
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false, // não anuncia "X-Powered-By: Next.js"
  async headers() {
    return [{ source: "/:caminho*", headers: cabecalhosSeguranca }];
  },
};

export default nextConfig;
