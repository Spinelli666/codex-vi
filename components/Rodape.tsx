import estilos from "./Rodape.module.css";

export default function Rodape() {
  return (
    <footer className={estilos.rodape}>
      <p>
        Codex VI · <a href="/feed.xml">RSS</a>
      </p>
    </footer>
  );
}
