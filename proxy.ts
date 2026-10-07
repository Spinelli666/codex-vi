import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE } from "@/lib/cookie-sessao";

// Checagem otimista: sem o cookie de sessão, nem tenta abrir o painel.
// Não é a proteção de verdade (o cookie pode ser falso): cada página e ação
// do admin valida a sessão no banco com exigirSessao().
export function proxy(requisicao: NextRequest) {
  if (!requisicao.cookies.has(NOME_COOKIE)) {
    return NextResponse.redirect(new URL("/admin", requisicao.url));
  }
  return NextResponse.next();
}

export const config = {
  // /admin/qualquer-coisa, mas não /admin (a página de login)
  matcher: ["/admin/:caminho+"],
};
