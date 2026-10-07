import type { Metadata } from "next";
import { Fraunces, Newsreader } from "next/font/google";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--fonte-titulo",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--fonte-corpo",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.nome, template: `%s · ${site.nome}` },
  description: site.descricao,
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: site.nome }] },
  },
  openGraph: { siteName: site.nome, locale: "pt_BR", type: "website" },
};

// Roda antes da pintura da página: aplica o tema salvo e evita o "piscar"
// do tema errado. Sem tema salvo, o CSS segue o tema do sistema.
const scriptTema = `try{var t=localStorage.getItem("tema");if(t==="claro"||t==="escuro")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script acima altera data-theme antes do React carregar
    <html lang="pt-BR" className={`${fraunces.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Cabecalho />
        {children}
        <Rodape />
      </body>
    </html>
  );
}
