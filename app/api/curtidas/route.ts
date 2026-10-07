import { NextResponse } from "next/server";

// TODO: implementar. Retorna 501 até lá.
function naoImplementado() {
  return NextResponse.json({ erro: "Não implementado" }, { status: 501 });
}

export const GET = naoImplementado;
export const POST = naoImplementado;
