// Adaptive intake: declarative `showIf` conditions on earlier answers. Pure; shared by client and server.
// A question with no answer yet stays visible unless the condition needs a positive answer (in / includes / eq / filled).
export type Answers = Record<string, string | boolean | undefined>;
export type Cond =
  | { q: string; in: string[] }
  | { q: string; includes: string }
  | { q: string; eq: string }
  | { q: string; filled: boolean }
  | { q: string; matches: string }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond };

const filled = (a: Answers, q: string) =>
  typeof a[q] === 'string' ? (a[q] as string).trim() !== '' : Object.keys(a).some((k) => k.startsWith(`${q}__`) && a[k] === true && !k.endsWith('__other') && !k.endsWith('__detail'));

export function evalCond(c: Cond, a: Answers): boolean {
  if ('all' in c) return c.all.every((x) => evalCond(x, a));
  if ('any' in c) return c.any.some((x) => evalCond(x, a));
  if ('not' in c) return !evalCond(c.not, a);
  if ('in' in c) return typeof a[c.q] === 'string' && c.in.includes(a[c.q] as string);
  if ('includes' in c) return a[`${c.q}__${c.includes}`] === true || a[c.q] === c.includes;
  if ('eq' in c) return a[c.q] === c.eq;
  if ('matches' in c) return typeof a[c.q] === 'string' && new RegExp(c.matches, 'i').test((a[c.q] as string).trim());
  return filled(a, c.q) === c.filled;
}

interface Q { id: string; showIf?: Cond }
interface S<T extends Q> { id: string; kind?: string; showIf?: Cond; qs: T[] }
interface D<T extends Q, X extends S<T>> { sections: X[] }

export const isVisible = (q: { showIf?: Cond }, a: Answers) => !q.showIf || evalCond(q.showIf, a);

/** Sections with their visible questions only. A section left empty is dropped (style pages follow their own rule and stay). */
export function visibleSections<T extends Q, X extends S<T>>(def: D<T, X>, a: Answers): X[] {
  return def.sections
    .filter((s) => isVisible(s, a))
    .map((s) => ({ ...s, qs: s.qs.filter((q) => isVisible(q, a)) }))
    .filter((s) => s.qs.length > 0 || s.kind === 'style');
}

export const countPages = <T extends Q, X extends S<T>>(def: D<T, X>, a: Answers) => visibleSections(def, a).length;
export const countQuestions = <T extends Q, X extends S<T>>(def: D<T, X>, a: Answers) => visibleSections(def, a).reduce((n, s) => n + s.qs.length, 0);
