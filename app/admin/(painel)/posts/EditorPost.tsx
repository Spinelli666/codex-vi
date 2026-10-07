"use client";

import { type ClipboardEvent, useActionState, useEffect, useRef, useState, useTransition } from "react";
import prosa from "@/components/Prosa.module.css";
import { gerarSlug } from "@/lib/texto";
import admin from "../../admin.module.css";
import { excluirPost, previsualizar, salvarPost, type EstadoEditor } from "./acoes";
import estilos from "./editor.module.css";

export type DadosPost = {
  id?: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  tags: string; // "Godot, GDScript"
  status: "rascunho" | "publicado";
};

const vazio: DadosPost = { titulo: "", slug: "", resumo: "", conteudo: "", tags: "", status: "rascunho" };

export default function EditorPost({ inicial = vazio, mensagem }: { inicial?: DadosPost; mensagem?: string }) {
  const [estado, salvar, salvando] = useActionState<EstadoEditor, FormData>(salvarPost, {});
  const [post, setPost] = useState(inicial);
  // Enquanto o slug não for editado à mão, ele acompanha o título.
  const [slugManual, setSlugManual] = useState(Boolean(inicial.slug));
  const [aba, setAba] = useState<"escrever" | "visualizar">("escrever");
  const [html, setHtml] = useState("");
  const [carregandoPrevia, iniciarPrevia] = useTransition();
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const textoRef = useRef<HTMLTextAreaElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  const alterado = JSON.stringify(post) !== JSON.stringify(inicial);

  // Avisa antes de fechar a aba com alterações não salvas.
  useEffect(() => {
    if (!alterado || salvando) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado, salvando]);

  function mudar<K extends keyof DadosPost>(campo: K, valor: DadosPost[K]) {
    setPost((atual) => {
      const novo = { ...atual, [campo]: valor };
      if (campo === "titulo" && !slugManual) novo.slug = gerarSlug(String(valor));
      return novo;
    });
  }

  function abrirPrevia() {
    setAba("visualizar");
    iniciarPrevia(async () => setHtml(await previsualizar(post.conteudo)));
  }

  // Colar (Ctrl+V) um print ou uma imagem copiada envia e insere no texto.
  // Texto colado continua funcionando normalmente.
  function colar(evento: ClipboardEvent<HTMLTextAreaElement>) {
    const imagem = [...evento.clipboardData.files].find((f) => f.type.startsWith("image/"));
    if (!imagem) return;
    evento.preventDefault();
    if (!enviandoImagem) enviarImagem(imagem, "imagem");
  }

  // Envia a imagem e insere o Markdown dela onde o cursor estava.
  async function enviarImagem(arquivo: File, descricaoPadrao?: string) {
    setErroImagem("");
    setEnviandoImagem(true);
    try {
      const dados = new FormData();
      dados.append("arquivo", arquivo);
      const resposta = await fetch("/api/uploads", { method: "POST", body: dados });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Falha no envio.");

      // Prints colados chegam como "image.png": nesse caso usa uma descrição genérica.
      const descricao = descricaoPadrao ?? arquivo.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
      const trecho = `![${descricao}](${corpo.url})`;
      const campo = textoRef.current;
      const inicio = campo?.selectionStart ?? post.conteudo.length;
      const fim = campo?.selectionEnd ?? inicio;
      mudar("conteudo", post.conteudo.slice(0, inicio) + trecho + post.conteudo.slice(fim));
    } catch (erro) {
      setErroImagem(erro instanceof Error ? erro.message : "Falha no envio.");
    } finally {
      setEnviandoImagem(false);
      if (arquivoRef.current) arquivoRef.current.value = "";
    }
  }

  const publicado = post.status === "publicado";

  return (
    <div className={estilos.editor}>
      <form action={salvar} className={admin.formulario}>
        {post.id && <input type="hidden" name="id" value={post.id} />}

        {mensagem && !alterado && (
          <p role="status" className={admin.sucesso}>
            {mensagem}
          </p>
        )}
        {estado.erro && (
          <p role="alert" className={admin.erro}>
            {estado.erro}
          </p>
        )}

        <label>
          Título
          <input name="titulo" value={post.titulo} onChange={(e) => mudar("titulo", e.target.value)} required maxLength={200} />
        </label>

        <label>
          Slug
          <input
            name="slug"
            value={post.slug}
            onChange={(e) => {
              setSlugManual(true);
              mudar("slug", e.target.value);
            }}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Letras minúsculas sem acento, números e hífens"
          />
          <span className={admin.ajuda}>Endereço do artigo: /blog/{post.slug || "…"}</span>
        </label>

        <label>
          Resumo <span className={admin.ajuda}>(opcional, aparece na lista e nas prévias de link)</span>
          <textarea name="resumo" rows={2} maxLength={300} value={post.resumo} onChange={(e) => mudar("resumo", e.target.value)} />
          <span className={admin.ajuda}>
            {post.resumo.length}/300. Vazio: usa o começo do texto.
          </span>
        </label>

        <label>
          Tags <span className={admin.ajuda}>(separadas por vírgula)</span>
          <input name="tags" value={post.tags} onChange={(e) => mudar("tags", e.target.value)} placeholder="Godot, GDScript, Game dev" />
        </label>

        <div className={estilos.conteudo}>
          <div className={estilos.abas} role="tablist" aria-label="Modo do editor">
            <button type="button" role="tab" aria-selected={aba === "escrever"} onClick={() => setAba("escrever")}>
              Escrever
            </button>
            <button type="button" role="tab" aria-selected={aba === "visualizar"} onClick={abrirPrevia}>
              Visualizar
            </button>
            <span className={estilos.espaco} />
            <button
              type="button"
              className={admin.botao}
              onClick={() => arquivoRef.current?.click()}
              disabled={enviandoImagem || aba !== "escrever"}
            >
              {enviandoImagem ? "Enviando…" : "Inserir imagem"}
            </button>
            <input
              ref={arquivoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={(e) => e.target.files?.[0] && enviarImagem(e.target.files[0])}
            />
          </div>
          {erroImagem && (
            <p role="alert" className={admin.erro}>
              {erroImagem}
            </p>
          )}

          {/* O textarea continua no formulário mesmo na prévia, para ser enviado ao salvar. */}
          <textarea
            ref={textoRef}
            name="conteudo"
            rows={24}
            value={post.conteudo}
            onChange={(e) => mudar("conteudo", e.target.value)}
            onPaste={colar}
            hidden={aba !== "escrever"}
            aria-label="Conteúdo em Markdown"
            aria-describedby="dica-conteudo"
            spellCheck
          />
          {aba === "escrever" && (
            <p id="dica-conteudo" className={admin.ajuda}>
              Markdown. Para pôr uma imagem, use o botão acima ou cole (Ctrl+V) um print ou uma imagem copiada.
            </p>
          )}
          {aba === "visualizar" && (
            <div className={estilos.previa} aria-busy={carregandoPrevia}>
              {carregandoPrevia ? (
                <p className={admin.ajuda}>Gerando prévia…</p>
              ) : (
                <div className={prosa.prosa} dangerouslySetInnerHTML={{ __html: html }} />
              )}
            </div>
          )}
        </div>

        <div className={estilos.acoes}>
          <span className={estilos.status}>
            {publicado ? "Publicado" : "Rascunho"}
            {alterado && " · alterações não salvas"}
          </span>
          {publicado ? (
            <>
              <button type="submit" name="acao" value="despublicar" className={admin.botao} disabled={salvando}>
                Despublicar
              </button>
              <button type="submit" name="acao" value="salvar" className={admin.botaoPrimario} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </>
          ) : (
            <>
              <button type="submit" name="acao" value="salvar" className={admin.botao} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar rascunho"}
              </button>
              <button type="submit" name="acao" value="publicar" className={admin.botaoPrimario} disabled={salvando}>
                Publicar
              </button>
            </>
          )}
        </div>
      </form>

      {post.id && (
        <form
          action={excluirPost.bind(null, post.id)}
          onSubmit={(e) => {
            if (!confirm(`Excluir "${inicial.titulo}" para sempre? Não dá para desfazer.`)) e.preventDefault();
          }}
          className={estilos.zonaPerigo}
        >
          <button type="submit" className={admin.botaoPerigo}>
            Excluir post
          </button>
        </form>
      )}
    </div>
  );
}
