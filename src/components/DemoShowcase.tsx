import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T, type Lang } from '../translations';
import { liveDemos, previewDemos, type DemoMeta, type DemoSlug } from '../data/demos';
import { getDemoAccess, formatRemaining, fill, type DemoAccess } from '../lib/demoAccess';
import { demoText } from './demos/demoText';
import { SHOWCASE_UI } from './demos/i18n/showcase';
import DemoAccessModal from './DemoAccessModal';
import PackageBuilder from './demos/PackageBuilder';
import DemoRequestModal from './demos/DemoRequestModal';
import { CUSTOM_UI } from './demos/i18n/custom';
import { demoPath } from '../lib/routes';
import { lqCard } from '../site/lqCard';
import Duotone from '../site/Duotone';
import BtnArrow from '../site/BtnArrow';

interface Props {
  lang: Lang;
  /** Hide the built-in section header (used under the page hero) */
  hideHeader?: boolean;
}

const BTN_CLS = 'rounded-[6px] py-3 text-[13px] font-medium uppercase tracking-[0.12em]';
const BTN_GHOST = 'lq-btn-ghost lq-btn-block';
const BTN_OUTLINE: React.CSSProperties = { border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)' };
const KICKER: React.CSSProperties = { color: 'var(--lq-silver)', fontFamily: 'var(--lq-mono)' };

export default function DemoShowcase({ lang, hideHeader = false }: Props) {
  const d = T[lang].demos;
  const navigate = useNavigate();
  const [access, setAccess] = useState<DemoAccess | null>(() => getDemoAccess());
  const [pending, setPending] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{ meta: DemoMeta; index: number } | null>(null);
  const [quoteFor, setQuoteFor] = useState<DemoSlug | null>(null);
  const [requestFor, setRequestFor] = useState<DemoSlug | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setAccess(getDemoAccess());
      tick((n) => n + 1);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Coming back from a demo ("/#demos"): SPA navigation doesn't scroll to the anchor by itself
  useEffect(() => {
    if (window.location.hash !== '#demos') return;
    const t = setTimeout(() => document.getElementById('demos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, []);

  const open = (slug: string) => {
    if (getDemoAccess()) navigate(demoPath(lang, slug));
    else setPending(slug);
  };

  const live = liveDemos(lang);
  const previews = previewDemos(lang);
  // +1 for the "custom software" card. Pick a column count that fills every row (no empty gaps)
  const previewCount = previews.length + 1;
  const previewCols = previewCount % 4 === 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <section id="demos" className={hideHeader ? 'pb-24 pt-8 px-5 md:px-9' : 'py-24 px-5 md:px-9'} >
      <div className="max-w-[1440px] mx-auto">
        {!hideHeader && (
          <header className="max-w-3xl mb-12">
            <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] mb-4" style={KICKER}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--lq-gradient)' }} />
              {d.tag}
            </span>
            <h2 className="text-4xl md:text-6xl tracking-[-0.04em] leading-none mb-4" style={{ color: 'var(--lq-white)' }}>{d.title}</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--lq-silver)' }}>{d.sub}</p>
          </header>
        )}
        {access && (
          <p className="inline-flex items-center gap-2 mb-10 text-[12px] uppercase tracking-[0.12em] rounded-[6px] px-4 py-2"
            style={{ background: 'var(--color-lime-soft)', color: 'var(--lq-mist)', border: '1px solid var(--lq-line)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--lq-g2)' }} />
            {fill(d.accessActive, { time: formatRemaining(access.expiresAt - Date.now()) })}
          </p>
        )}

        <h3 className="text-2xl tracking-[-0.02em] mb-5" style={{ color: 'var(--lq-white)' }}>{d.liveTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {live.map((meta, i) => (
            <DemoCard idx={i} key={meta.slug} meta={meta} lang={lang}
              onOpen={() => open(meta.slug)}
              onShots={() => setGallery({ meta, index: 0 })}
              onQuote={() => setQuoteFor(meta.slug)} />
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
          <h3 className="text-2xl tracking-[-0.02em]" style={{ color: 'var(--lq-white)' }}>{d.previewTitle}</h3>
          <p className="text-sm" style={{ color: 'var(--lq-silver)' }}>{d.previewSub}</p>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${previewCols} gap-5`}>
          {/* Not publicly openable: visitors request a personal demo instead */}
          {previews.map((meta, i) => (
            <DemoCard idx={i + 2} key={meta.slug} meta={meta} lang={lang} compact
              onRequest={() => setRequestFor(meta.slug)}
              onShots={() => setGallery({ meta, index: 0 })}
              onQuote={() => setQuoteFor(meta.slug)} />
          ))}
          <CustomCard lang={lang} onQuote={() => setQuoteFor('demoozel')} />
        </div>
      </div>

      <DemoAccessModal
        open={pending !== null}
        lang={lang}
        demo={pending ?? 'all'}
        onClose={() => setPending(null)}
        onUnlocked={(a) => {
          setAccess(a);
          const slug = pending;
          setPending(null);
          if (slug) navigate(demoPath(lang, slug));
        }}
      />

      {gallery && <Gallery lang={lang} meta={gallery.meta} index={gallery.index}
        onIndex={(index) => setGallery({ ...gallery, index })} onClose={() => setGallery(null)} />}

      {quoteFor && <QuoteSheet lang={lang} slug={quoteFor} email={access?.email ?? ''} onClose={() => setQuoteFor(null)} />}

      {requestFor && <DemoRequestModal lang={lang} slug={requestFor} email={access?.email ?? ''} onClose={() => setRequestFor(null)} />}
    </section>
  );
}

function DemoCard({ idx = 0, meta, lang, compact, onOpen, onRequest, onShots, onQuote }: {
  idx?: number; meta: DemoMeta; lang: Lang; compact?: boolean; onOpen?: () => void; onRequest?: () => void; onShots: () => void; onQuote: () => void;
}) {
  const d = T[lang].demos;
  const s = SHOWCASE_UI[lang];
  const item = demoText(lang, meta.slug);
  const [hover, setHover] = useState(false);
  const primary = onOpen ?? onShots;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${lqCard(idx)} overflow-hidden flex flex-col`}
      style={{
        transform: hover ? 'translateY(-4px)' : 'none',
      }}
    >
      <button type="button" onClick={primary} className="block w-full text-left" aria-label={item.name}>
        <Duotone src={meta.card} alt={item.name} active={hover} className="aspect-[16/10]" />
      </button>

      <div className={compact ? 'p-4 flex flex-col flex-1' : 'p-5 flex flex-col flex-1'} style={{ borderTop: '1px solid var(--lq-line)' }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[11px]" style={KICKER}>{meta.slug}</p>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] rounded-full px-2 py-0.5"
            style={{ background: meta.live ? 'var(--color-lime-soft)' : 'var(--lq-deep)', color: 'var(--lq-mist)', border: '1px solid var(--lq-line)' }}>
            {meta.live && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--lq-g2)' }} />}
            {meta.live ? d.liveBadge : d.previewBadge}
          </span>
        </div>
        <h4 className={compact ? 'text-lg tracking-[-0.02em] mb-1.5' : 'text-xl tracking-[-0.02em] mb-1.5'} style={{ color: 'var(--lq-white)' }}>{item.name}</h4>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--lq-silver)' }}>{item.desc}</p>
        <p className="flex gap-2 text-xs leading-relaxed mb-4" style={{ color: 'var(--lq-silver)' }}>
          <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'var(--color-lime-soft)', color: 'var(--lq-g2)' }}>✓</span>
          {d.custom}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2">
          {onOpen ? (
            <button type="button" onClick={onOpen} className={`col-span-2 ${BTN_GHOST}`}>
              {meta.live ? d.openLive : s.open}<BtnArrow />
            </button>
          ) : onRequest ? (
            <button type="button" onClick={onRequest} className={`col-span-2 ${BTN_GHOST}`}>
              {s.requestDemo}<BtnArrow />
            </button>
          ) : null}
          <button type="button" onClick={onShots} className={`${BTN_CLS} !text-[11px]`} style={BTN_OUTLINE}>
            {d.viewShots}
          </button>
          <button type="button" onClick={onQuote} className={`${BTN_CLS} !text-[11px]`} style={BTN_OUTLINE}>
            {s.quote}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Last card: custom software & design for businesses not in the list */
function CustomCard({ lang, onQuote }: { lang: Lang; onQuote: () => void }) {
  const c = CUSTOM_UI[lang];
  const [hover, setHover] = useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: 'var(--lq-kelp)',
        border: `1px solid ${hover ? 'color-mix(in srgb, var(--lq-g2) 55%, transparent)' : 'var(--lq-line-strong)'}`,
        transform: hover ? 'translateY(-4px)' : 'none',
      }}
    >
      <button type="button" onClick={onQuote} className="block w-full text-left" aria-label={c.name}>
        <div className="aspect-[16/10] p-5 flex flex-col justify-center gap-3" style={{ borderBottom: '1px solid var(--lq-line)', background: 'var(--lq-deep)' }}>
          {c.features.map((f) => (
            <p key={f} className="flex items-start gap-2.5 text-[13px] leading-snug" style={{ color: 'var(--lq-mist)' }}>
              <span aria-hidden="true" className="shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lq-g2)' }} />{f}
            </p>
          ))}
        </div>
      </button>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[11px]" style={KICKER}>demoozel</p>
          <span className="text-[10px] uppercase tracking-[0.12em] rounded-full px-2 py-0.5" style={{ background: 'var(--c-quartz)', color: 'var(--c-abyss)' }}>{c.tag}</span>
        </div>
        <h4 className="text-lg tracking-[-0.02em] mb-1.5" style={{ color: 'var(--lq-white)' }}>{c.name}</h4>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--lq-silver)' }}>{c.desc}</p>
        <button type="button" onClick={onQuote} className={`mt-auto ${BTN_GHOST}`}>
          {c.cta}<BtnArrow />
        </button>
      </div>
    </article>
  );
}

/** Full-screen sheet with the same package builder that is inside the demos */
function QuoteSheet({ lang, slug, email, onClose }: { lang: Lang; slug: DemoSlug; email: string; onClose: () => void }) {
  const d = T[lang].demos;
  const item = demoText(lang, slug);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={item.name} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 md:p-8 relative"
        style={{ background: 'var(--lq-deep)', border: '1px solid var(--lq-line)' }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] mb-1" style={KICKER}>{slug}</p>
            <p className="text-xl tracking-[-0.02em]" style={{ color: 'var(--lq-white)' }}>{item.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={d.close}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
            style={{ border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)', background: 'var(--lq-kelp)' }}>
            ×
          </button>
        </div>
        <PackageBuilder lang={lang} slug={slug} email={email} compact />
      </div>
    </div>
  );
}

function Gallery({ lang, meta, index, onIndex, onClose }: {
  lang: Lang; meta: DemoMeta; index: number; onIndex: (i: number) => void; onClose: () => void;
}) {
  const d = T[lang].demos;
  const name = demoText(lang, meta.slug).name;
  const n = meta.shots.length;
  const go = (delta: number) => onIndex((index + delta + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % n);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, n, onClose, onIndex]);

  const navBtn = 'w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0';
  const navStyle = { background: 'var(--lq-kelp)', color: 'var(--lq-white)', border: '1px solid var(--lq-line-strong)' };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-8"
      style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(8px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-5xl flex items-center justify-between mb-3">
        <p className="text-sm rounded-full px-4 py-2" style={navStyle}>
          {name} · {index + 1}/{n}
        </p>
        <button onClick={onClose} aria-label={d.close} className={navBtn} style={navStyle}>×</button>
      </div>
      <div className="w-full max-w-5xl flex items-center gap-3">
        {n > 1 && <button onClick={() => go(-1)} aria-label={d.prev} className={`${navBtn} hidden sm:flex`} style={navStyle}>‹</button>}
        <div className="flex-1 rounded-2xl overflow-hidden flex justify-center" style={{ background: 'var(--lq-deep)', border: '1px solid var(--lq-line)' }}>
          <img src={meta.shots[index]} alt={`${name} ${index + 1}`} className="max-w-full max-h-[72vh] object-contain" />
        </div>
        {n > 1 && <button onClick={() => go(1)} aria-label={d.next} className={`${navBtn} hidden sm:flex`} style={navStyle}>›</button>}
      </div>
      <div className="flex gap-2 mt-4">
        {meta.shots.map((s, i) => (
          <button key={s} onClick={() => onIndex(i)} className="w-16 h-11 rounded-[6px] overflow-hidden"
            style={{ border: `2px solid ${i === index ? 'var(--lq-g2)' : 'transparent'}`, opacity: i === index ? 1 : 0.65 }}>
            <img src={s} alt="" className="w-full h-full object-cover object-top" />
          </button>
        ))}
      </div>
    </div>
  );
}
