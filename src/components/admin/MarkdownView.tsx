import type { ReactNode } from 'react';

// Minimal safe Markdown renderer: React text nodes only (escaped), no raw HTML.
const inline = (t: string): ReactNode[] =>
  t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith('`') && p.endsWith('`') && p.length > 2 ? <code key={i}>{p.slice(1, -1)}</code> : p));

export default function MarkdownView({ text }: { text: string }) {
  const out: ReactNode[] = []; let list: { ord: boolean; items: string[] } | null = null; let k = 0;
  const flush = () => { if (!list) return; const L = list; out.push(L.ord ? <ol key={k++}>{L.items.map((x, i) => <li key={i}>{inline(x)}</li>)}</ol> : <ul key={k++}>{L.items.map((x, i) => <li key={i}>{inline(x)}</li>)}</ul>); list = null; };
  for (const line of text.split('\n')) {
    const h = /^(#{1,4})\s+(.*)$/.exec(line); const li = /^\s*(?:[-*]|(\d+)[.)])\s+(.*)$/.exec(line);
    if (li) { const ord = !!li[1]; if (list && list.ord !== ord) flush(); list ??= { ord, items: [] }; list.items.push(li[2]); continue; }
    flush();
    if (h) { const Tag = (`h${Math.min(h[1].length + 1, 4)}`) as 'h2' | 'h3' | 'h4'; out.push(<Tag key={k++}>{inline(h[2])}</Tag>); }
    else if (/^\s*(-{3,}|\|.*\|)\s*$/.test(line)) { if (!/^\s*-{3,}\s*$/.test(line) && !/^\|[\s:|-]+\|$/.test(line.trim())) out.push(<p key={k++}>{inline(line)}</p>); }
    else if (line.trim()) out.push(<p key={k++}>{inline(line)}</p>);
  }
  flush();
  return <div className="adm-md">{out}</div>;
}
