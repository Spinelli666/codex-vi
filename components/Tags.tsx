import Link from "next/link";
import type { TagResumo } from "@/lib/posts";
import estilos from "./Tags.module.css";

export default function Tags({ tags, total }: { tags: (TagResumo & { total?: number })[]; total?: boolean }) {
  if (tags.length === 0) return null;

  return (
    <ul className={estilos.tags} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link href={`/tags/${tag.slug}`}>
            #{tag.nome}
            {total && tag.total !== undefined && <span className={estilos.total}> {tag.total}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
