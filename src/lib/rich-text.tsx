import { Fragment } from "react";

// Mise en forme minimale des textes saisis dans l'admin, sans bibliothèque :
// - une ligne vide sépare deux paragraphes ;
// - les lignes qui commencent par « - » forment une liste à puces ;
// - un retour à la ligne simple est conservé.

export type Block = { kind: "paragraph"; lines: string[] } | { kind: "list"; items: string[] };

export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const last = blocks.at(-1);

    if (line === "") {
      blocks.push({ kind: "paragraph", lines: [] });
    } else if (/^[-•]\s+/.test(line)) {
      const item = line.replace(/^[-•]\s+/, "");
      if (last?.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
    } else if (last?.kind === "paragraph") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "paragraph", lines: [line] });
    }
  }
  return blocks.filter((b) => (b.kind === "list" ? b.items.length > 0 : b.lines.length > 0));
}

export function RichText({ text, lang, className = "" }: { text: string; lang?: string; className?: string }) {
  return (
    <div lang={lang} className={`flex flex-col gap-3 ${className}`}>
      {parseRichText(text).map((block, i) =>
        block.kind === "list" ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
