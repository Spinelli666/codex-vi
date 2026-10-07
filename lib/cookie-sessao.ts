// Nome do cookie de sessão, separado de lib/sessao.ts para o proxy.ts poder
// importá-lo sem carregar o banco de dados.
//
// O prefixo __Host- obriga o navegador a só aceitar o cookie com Secure,
// path=/ e sem domínio. Em desenvolvimento (http) usamos um nome simples.
export const NOME_COOKIE = process.env.NODE_ENV === "production" ? "__Host-codex_sessao" : "codex_sessao";
