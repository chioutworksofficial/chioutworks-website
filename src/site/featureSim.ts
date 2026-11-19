import { useEffect, useReducer, useRef } from 'react';
import type { Lang } from '../translations';

export type Rng = { f: () => number; i: (a: number, b: number) => number; pick: <T>(a: T[]) => T };
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const f = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { f, i: (lo, hi) => lo + Math.floor(f() * (hi - lo + 1)), pick: (arr) => arr[Math.floor(f() * arr.length)] };
}

const LOC: Record<Lang, [string, string]> = { tr: ['tr-TR', 'TRY'], de: ['de-DE', 'EUR'], el: ['el-GR', 'EUR'], en: ['en-GB', 'GBP'] };
export const RATE: Record<Lang, number> = { tr: 25, de: 2.5, el: 2.5, en: 2.5 };
export function makeFmt(lang: Lang) {
  const [loc, cur] = LOC[lang];
  const n = new Intl.NumberFormat(loc);
  const c = new Intl.NumberFormat(loc, { style: 'currency', currency: cur, maximumFractionDigits: 0 });
  const d1 = new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return { loc, d1: (v: number) => d1.format(v), n: (v: number) => n.format(v), cur: (v: number) => c.format(v), dt: (o: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat(loc, o).format(d) };
}

/** Compressed demo clock: 4 s of real time reads as 1 minute. */
export const ageText = (since: number, now: string, ago: string) => {
  const m = Math.floor((Date.now() - since) / 4000);
  return m < 1 ? now : ago.replace('{n}', String(m));
};

/** Mutable simulation: runs only while the root element is on screen; static under reduced motion. */
export function useSim<S>(init: () => S, step: (s: S, r: Rng) => number | void, seed: number) {
  const ref = useRef<HTMLDivElement>(null);
  const sim = useRef<{ s: S; r: Rng } | null>(null);
  if (!sim.current) sim.current = { s: init(), r: makeRng(seed) };
  const stepRef = useRef(step);
  stepRef.current = step;
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let to = 0;
    const run = () => { const d = stepRef.current(sim.current!.s, sim.current!.r); bump(); to = window.setTimeout(run, d ?? 2000); };
    const io = new IntersectionObserver(([e]) => { window.clearTimeout(to); if (e.isIntersecting) to = window.setTimeout(run, 500); });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(to); };
  }, []);
  return [sim.current.s, ref] as const;
}
