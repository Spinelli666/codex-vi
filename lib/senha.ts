import { randomBytes } from "node:crypto";
import { argon2id, argon2Verify } from "hash-wasm";

// Argon2id com os parâmetros mínimos recomendados pela OWASP
// (19 MiB de memória, 2 iterações, 1 thread). Usamos a versão WebAssembly
// (hash-wasm) para não depender de binário nativo.
export function gerarHashSenha(senha: string) {
  return argon2id({
    password: senha,
    salt: randomBytes(16),
    parallelism: 1,
    iterations: 2,
    memorySize: 19456, // KiB
    hashLength: 32,
    outputType: "encoded", // "$argon2id$v=19$m=...": guarda salt e parâmetros junto
  });
}

export function verificarSenha(senha: string, hash: string) {
  return argon2Verify({ password: senha, hash });
}
