import { useEffect, useState } from 'react';
import type { Lang } from '../translations';

const LABEL: Record<Lang, { toLight: string; toDark: string }> = {
  tr: { toLight: 'Açık moda geç', toDark: 'Koyu moda geç' },
  en: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  de: { toLight: 'Zum hellen Modus wechseln', toDark: 'Zum dunklen Modus wechseln' },
  el: { toLight: 'Μετάβαση σε φωτεινή λειτουργία', toDark: 'Μετάβαση σε σκοτεινή λειτουργία' },
};

export const isLight = () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-mode') === 'light';

/** Current mode for components that draw with canvas colours read once (re-mount them with key={mode}). */
export function useMode(): 'light' | 'dark' {
  const [m, setM] = useState<'light' | 'dark'>(() => (isLight() ? 'light' : 'dark'));
  useEffect(() => {
    const on = () => setM(isLight() ? 'light' : 'dark');
    window.addEventListener('cw-mode', on);
    return () => window.removeEventListener('cw-mode', on);
  }, []);
  return m;
}

/** Light / dark switch (lialive-style round button). The choice is kept in this browser ('cw-mode'); dark is the default. */
export default function ModeToggle({ lang }: { lang: Lang }) {
  const [light, setLight] = useState(isLight);
  useEffect(() => {
    const on = () => setLight(isLight());
    window.addEventListener('cw-mode', on);
    return () => window.removeEventListener('cw-mode', on);
  }, []);
  const flip = () => {
    const next = !light;
    const html = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) html.classList.add('cw-mode-anim');
    if (next) html.setAttribute('data-mode', 'light'); else html.removeAttribute('data-mode');
    try { localStorage.setItem('cw-mode', next ? 'light' : 'dark'); } catch { /* storage blocked: works for this visit only */ }
    setLight(next);
    window.dispatchEvent(new Event('cw-mode'));
    window.setTimeout(() => html.classList.remove('cw-mode-anim'), 450);
  };
  const t = LABEL[lang];
  const icon = (show: boolean): React.CSSProperties => ({ position: 'absolute', transition: 'transform .3s ease, opacity .3s ease', transform: show ? 'none' : 'rotate(45deg) scale(0)', opacity: show ? 1 : 0 });
  return (
    <button type="button" onClick={flip} aria-label={light ? t.toDark : t.toLight} title={light ? t.toDark : t.toLight}
      className="cw-mode-toggle relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: 32, height: 32, color: 'var(--lq-white)', border: '1px solid color-mix(in srgb, currentColor 15%, transparent)', background: 'color-mix(in srgb, currentColor 4%, transparent)' }}>
      {/* dark mode shows the sun (= "switch to light"), light mode shows the moon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={icon(!light)}>
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={icon(light)}>
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
    </button>
  );
}
