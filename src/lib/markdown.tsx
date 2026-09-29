import { Fragment, type ReactNode } from 'react';

/**
 * Tiny, safe Markdown renderer for blog posts (no HTML passthrough, so no XSS).
 * Supports: # headings, paragraphs, **bold**, *italic*, `code`, ```code blocks```,
 * - / 1. lists, > quotes, [links](https://…), --- rules.
 */

const SAFE_URL = /^(https?:\/\/|\/|#|mailto:)/i;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<code key={key} className="bg-ink px-1.5 py-0.5 monofont text-[0.9em] text-cyan">{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key} className="font-semibold text-bone">{inline(tok.slice(2, -2), key)}</strong>);
    else if (m[3]) out.push(<em key={key}>{inline(tok.slice(1, -1), key)}</em>);
    else if (m[4]) {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const href = SAFE_URL.test(lm[2]) ? lm[2] : '#';
      const external = /^https?:/i.test(href);
      out.push(
        <a key={key} href={href} className="text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {inline(lm[1], key)}
        </a>
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${k++}`;

    if (/^```/.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key} className="overflow-x-auto border border-signal/30 bg-ink p-4 monofont text-sm leading-relaxed text-bone/90">
          <code className="monofont">{code.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls =
        level === 1
          ? 'font-display text-4xl font-bold uppercase text-bone'
          : level === 2
            ? 'font-display text-3xl font-bold uppercase text-bone'
            : 'font-display text-xl font-bold uppercase text-signal';
      const Tag = (`h${Math.min(level + 1, 5)}`) as 'h2' | 'h3' | 'h4' | 'h5';
      blocks.push(<Tag key={key} className={`${cls} mt-10`}>{inline(h[2], key)}</Tag>);
      i++;
      continue;
    }

    if (/^(---|\*\*\*)\s*$/.test(line)) {
      blocks.push(<hr key={key} className="my-10 border-signal/30" />);
      i++;
      continue;
    }

    if (/^\s*([-*+])\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/).test(lines[i])) {
        items.push(lines[i].replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, ''));
        i++;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List key={key} className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-2 pl-6 marker:text-signal`}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `${key}-${j}`)}</li>
          ))}
        </List>
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(
        <blockquote key={key} className="border-l-2 border-signal bg-signal/5 px-5 py-3 italic text-bone/90">
          {inline(quote.join(' '), key)}
        </blockquote>
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>\s?|\s*[-*+]\s+|\s*\d+\.\s+|---\s*$)/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push(
      <p key={key}>
        {para.map((p, j) => (
          <Fragment key={j}>
            {j > 0 && ' '}
            {inline(p, `${key}-${j}`)}
          </Fragment>
        ))}
      </p>
    );
  }

  return <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{blocks}</div>;
}
