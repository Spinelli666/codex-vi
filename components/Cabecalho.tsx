import Link from "next/link";
import BotaoTema from "./BotaoTema";
import LogoCodice from "./LogoCodice";
import estilos from "./Cabecalho.module.css";

const links = [
  { href: "/blog", rotulo: "Blog" },
  { href: "/arquivo", rotulo: "Arquivo" },
  { href: "/portfolio", rotulo: "Portfolio" },
  { href: "/sobre", rotulo: "Sobre" },
];

export default function Cabecalho() {
  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.interno}>
        <Link href="/" className={estilos.logo}>
          <LogoCodice tamanho={34} />
          <span>
            Codex <span className={estilos.numeral}>VI</span>
          </span>
        </Link>

        <nav aria-label="Principal" className={estilos.nav}>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.rotulo}</Link>
              </li>
            ))}
          </ul>
          <BotaoTema className={estilos.botaoTema} />
        </nav>
      </div>
    </header>
  );
}
