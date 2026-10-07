import rehypeShiki from "@shikijs/rehype";
import type { Element, Root } from "hast";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

// Imagens carregam só quando chegam perto da tela.
function rehypeImagensPreguicosas() {
  return (arvore: Root) => {
    visit(arvore, "element", (no: Element) => {
      if (no.tagName === "img") {
        no.properties.loading = "lazy";
        no.properties.decoding = "async";
      }
    });
  };
}

// Pipeline: Markdown → árvore Markdown → árvore HTML → HTML.
// 1. remark-gfm: tabelas, ~~riscado~~, listas de tarefas, links automáticos.
// 2. remark-rehype sem `allowDangerousHtml`: HTML escrito no Markdown é descartado.
// 3. rehype-sanitize: remove atributos e protocolos perigosos (ex.: javascript:).
// 4. rehype-slug: ids nos títulos, para links do tipo /blog/post#secao.
// 5. Shiki: realce de sintaxe. Roda depois do sanitize porque gera estilos próprios.
const processador = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeSlug)
  .use(rehypeImagensPreguicosas)
  .use(rehypeShiki, {
    // Dois temas: o CSS escolhe qual usar com light-dark() (veja Prosa.module.css).
    themes: { claro: "github-light-high-contrast", escuro: "github-dark-default" },
    defaultColor: false,
    // O cinza dos comentários tinha 4,2:1 no nosso fundo bege; este passa com 5:1.
    colorReplacements: { "github-light-high-contrast": { "#66707b": "#5a636d" } },
    lazy: true, // carrega só as linguagens que aparecem no texto
    fallbackLanguage: "text",
    addLanguageClass: true,
  })
  .use(rehypeStringify);

export async function renderizarMarkdown(markdown: string) {
  return String(await processador.process(markdown));
}
