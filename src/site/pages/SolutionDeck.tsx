import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLang } from '../../hooks/useLang';
import { usePageMeta } from '../../hooks/usePageMeta';
import { T, type Lang } from '../../translations';
import { liveDemos, previewDemos, type DemoMeta } from '../../data/demos';
import { demoText } from '../../components/demos/demoText';
import { getDemoAccess } from '../../lib/demoAccess';
import { demoPath, pagePath, solutionPath } from '../../lib/routes';
import PackageBuilder from '../../components/demos/PackageBuilder';
import DemoRequestModal from '../../components/demos/DemoRequestModal';
import SiteNav from '../SiteNav';
import SiteFinale from '../SiteFinale';
import NewsletterBand from '../NewsletterBand';
import BtnArrow from '../BtnArrow';
import { SOLUTION_UI } from '../i18n/solutionDeck';
import type { DemoSlug } from '../../data/demos';

const N = 10;
const fillN = (s: string, n: number) => s.replace('{n}', String(n));

interface Ctx {
  lang: Lang; slug: DemoSlug; meta: DemoMeta; sector: string;
  text: { name: string; desc: string; features: string[] };
  ui: (typeof SOLUTION_UI)[Lang]; thumb: boolean;
  onPackage: () => void; onRequest: () => void;
}

const ICONS = [
  'M5 13l4 4L19 7', 'M13 2L4 14h7l-1 8 9-12h-7z', 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5', 'M4 5h16v11H8l-4 4z',
];
const Icon = ({ i }: { i: number }) => (
  <span className="ic" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[i % ICONS.length]} /></svg>
  </span>
);

function Cta({ thumb, to, onClick, primary, children }: { thumb: boolean; to?: string; onClick?: () => void; primary?: boolean; children: ReactNode }) {
  const cls = primary ? 'cta cta-p' : 'cta';
  if (thumb) return <span className={cls}>{children}</span>;
  if (to) return <Link to={to} className={cls}>{children}<BtnArrow /></Link>;
  return <button type="button" onClick={onClick} className={cls}>{children}<BtnArrow /></button>;
}

function Content({ n, c }: { n: number; c: Ctx }) {
  const { ui, text, meta, sector } = c;
  const f = text.features;
  const head = (k: string, t: string) => (<><p className="k">{k}</p><h2>{t}</h2></>);
  const shot = (src: string) => <img src={src} alt="" loading="lazy" decoding="async" className="shot" />;
  switch (n) {
    case 0: return (
      <div className="g2 grow mid">
        <div>
          <p className="k">{ui.solutionOf.replace('{sector}', sector)}</p>
          <h1>{text.name}</h1>
          <p className="lead">{text.desc}</p>
        </div>
        <div className="frame">{shot(meta.card)}</div>
      </div>);
    case 1: return (<>
      {head(sector, ui.challengeT)}
      <p className="lead">{ui.challengeLead}</p>
      <ul className="cards grow">{ui.challenge.map((t, i) => <li key={i}><Icon i={i + 3} /><span>{t}</span></li>)}</ul>
    </>);
    case 2: return (<div className="g2 grow mid">
      <div>{head(text.name, ui.solutionT)}<p className="lead">{ui.solutionLead}</p></div>
      <div className="panel"><p className="big">{text.desc}</p></div>
    </div>);
    case 3: case 4: {
      const part = f.slice((n - 3) * 2, (n - 3) * 2 + 2);
      const list = part.length ? part : f.slice(0, 2);
      return (<>{head(text.name, ui.featuresT)}<ul className="cards grow">{list.map((t, i) => <li key={i}><Icon i={i + (n - 3) * 2} /><span>{t}</span></li>)}</ul></>);
    }
    case 5: return (<>{head(text.name, ui.moreT)}<ul className="cards grow">{ui.more.map((t, i) => <li key={i}><Icon i={i} /><span>{t}</span></li>)}</ul></>);
    case 6: return (<><p className="k">{ui.shotsT}</p><div className="frame grow">{shot(meta.shots[0])}</div></>);
    case 7: return (<><p className="k">{ui.shotsT2}</p><div className="row grow">{[meta.card, ...meta.shots.slice(1)].map((s) => <div key={s} className="frame">{shot(s)}</div>)}</div></>);
    case 8: return (<>{head(text.name, ui.gainsT)}<ul className="cards grow">{ui.gains.map((t, i) => <li key={i}><Icon i={i} /><span>{t}</span></li>)}</ul></>);
    default: return (
      <div className="grow mid col">
        <h2>{ui.ctaT}</h2>
        <p className="lead">{ui.ctaSub}</p>
        <div className="btns">
          {meta.live ? (<>
            <Cta thumb={c.thumb} to={demoPath(c.lang, c.slug)} primary>{ui.ctaLive}</Cta>
            <Cta thumb={c.thumb} onClick={c.onPackage}>{ui.ctaPackage}</Cta>
          </>) : (<>
            <Cta thumb={c.thumb} onClick={c.onRequest} primary>{ui.ctaRequest}</Cta>
            <Cta thumb={c.thumb} to={pagePath(c.lang, 'contact')}>{ui.ctaContact}</Cta>
          </>)}
        </div>
      </div>);
  }
}

function Slide({ n, c, tall }: { n: number; c: Ctx; tall: boolean }) {
  return (
    <div className={`sdw${tall ? ' tall' : ''}`}>
      <div className="sd"><Content n={n} c={c} /><span className="pg">{String(n + 1).padStart(2, '0')}</span></div>
    </div>
  );
}

const CSS = `
.sdw{container-type:inline-size;position:relative;overflow:hidden;border-radius:16px;aspect-ratio:16/9;background:var(--c-abyss);border:1px solid var(--c-edge)}
.sdw.tall{aspect-ratio:3/4}
.sd{position:absolute;inset:0;text-align:left;font-size:1.5625cqw;padding:4em 4.5em;display:flex;flex-direction:column;color:var(--c-quartz);font-family:var(--font-body);
background:radial-gradient(60em 40em at 100% 0,color-mix(in srgb,var(--c-signal) 28%,transparent),transparent 70%),radial-gradient(50em 30em at 0 100%,color-mix(in srgb,var(--c-cobalt) 80%,transparent),transparent 70%),linear-gradient(160deg,var(--c-deep-sea),var(--c-void))}
.sd .k{font-size:.85em;letter-spacing:.16em;text-transform:uppercase;color:var(--c-lilac);margin:0 0 1.2em;font-weight:600}
.sd h1,.sd h2{font-family:var(--font-display);font-weight:500;letter-spacing:-.02em;line-height:1.05;margin:0 0 .5em;font-size:calc(3.6em*var(--fit,1))}
.sd h1{font-size:calc(4.4em*var(--fit,1))}
.sd h1,.sd h2,.sd-hl h1,.sd-rail>h2{overflow-wrap:normal;word-break:normal;hyphens:manual}
.sd .lead{font-size:1.4em;line-height:1.5;color:var(--c-mist);margin:0;max-width:30em}
.sd .big{font-size:1.5em;line-height:1.4;margin:0;color:var(--c-quartz)}
.sd .grow{flex:1;min-height:0}.sd .mid{align-items:center}
.sd .col{display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.sd .g2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:3em}.sd .g2>*{min-width:0}.sd .lead,.sd .big{overflow-wrap:anywhere}
.sd .panel{background:color-mix(in srgb,var(--c-cobalt) 70%,transparent);border:1px solid var(--c-hairline);border-radius:1em;padding:2.2em}
.sd .cards{list-style:none;margin:1.4em 0 0;padding:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:1.6em;align-content:start}
.sd .cards li{background:color-mix(in srgb,var(--c-cobalt) 60%,transparent);border:1px solid var(--c-hairline);border-radius:1em;padding:1.4em;display:flex;flex-direction:column;gap:.8em;font-size:1.15em;line-height:1.4;overflow:hidden}
.sd .ic{width:2.4em;height:2.4em;border-radius:50%;flex:none;background:color-mix(in srgb,var(--c-signal) 16%,transparent);border:1px solid color-mix(in srgb,var(--c-signal) 45%,transparent);color:var(--c-lilac);display:inline-flex;align-items:center;justify-content:center}
.sd .ic svg{width:1.3em;height:1.3em}
.sd .frame{border-radius:.9em;overflow:hidden;border:1px solid var(--c-hairline);background:var(--c-void);min-height:0;min-width:0}
.sd .frame.grow{display:flex;justify-content:center}
.sd .shot{display:block;max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain}
.sd .g2 .frame .shot{height:auto;object-fit:cover}
.sd .row{display:flex;gap:1.6em;justify-content:center}.sd .row .frame{height:100%}.sd .row .shot{width:auto}
.sd .btns{display:flex;gap:1em;flex-wrap:wrap;margin-top:2.4em}
.sd .cta{display:inline-flex;align-items:center;gap:.7em;border-radius:9999px;padding:.9em 1.8em;font-size:1.2em;font-weight:600;border:1.5px solid var(--c-lilac);color:var(--c-quartz);background:transparent;cursor:pointer}
.sd .cta-p{background:var(--c-signal);border-color:var(--c-signal)}
.sd .pg{position:absolute;right:2.4em;bottom:1.6em;font-family:var(--font-mono);font-size:.8em;color:var(--c-ash)}
.sdw.tall .sd{font-size:3.6cqw;padding:2.2em 1.6em}.sdw.tall .sd .k{letter-spacing:.08em}
.sdw.tall .sd h1{font-size:calc(2.5em*var(--fit,1))}.sdw.tall .sd h2{font-size:calc(2.3em*var(--fit,1))}.sdw.tall .sd .lead{font-size:1.1em}.sdw.tall .sd .big{font-size:1.2em}
.sdw.tall .sd .g2{grid-template-columns:minmax(0,1fr);gap:1.4em}
.sdw.tall .sd .cards{grid-auto-flow:row;gap:.8em;margin-top:1em}.sdw.tall .sd .cards li{font-size:1em;padding:1em;flex-direction:row;align-items:center}
.sdw.tall .sd .row .shot{width:100%}.sdw.tall .sd .row{flex-direction:column}
.sdt .sdw{border-radius:0}
.sd-root{background:var(--c-void)}
.sd-hero{display:grid;grid-template-columns:calc(62vw - 62px) minmax(0,470px);gap:32px;padding:126px 30px 0}
.sd-hl h1{font-family:var(--font-display);font-size:calc(clamp(40px,4.6vw,66px)*var(--fit,1));font-weight:300;line-height:1.1;color:var(--c-quartz);margin:0}
.sd-hl .sub{font-size:19px;color:var(--c-mist);margin:26px 0 0;max-width:300px}
.sd-hl .hd{font-size:25px;font-weight:400;line-height:1.35;color:var(--c-lilac);margin:45px 0 0;max-width:380px}
.sd-hr{width:100%}
.sd-hr p{font-size:16px;line-height:1.7;color:var(--c-ash);margin:0 0 1em}
.sd-hbtn{display:inline-flex;align-items:center;gap:14px;height:43px;padding:0 30px;margin-top:29px;border:1px solid color-mix(in srgb,var(--c-quartz) 30%,transparent);background:transparent;color:var(--c-quartz);font-size:12px;text-transform:uppercase;letter-spacing:.2em;cursor:pointer;transition:border-color .2s}
.sd-hbtn:hover{border-color:var(--c-lilac)}
.sd-deck{display:grid;grid-template-columns:150px minmax(0,1fr);gap:24px;padding:90px 30px 96px}
.sd-rail{position:sticky;top:92px;align-self:start;height:calc(100vh - 110px);display:flex;flex-direction:column;min-height:0}
.sd-rail>h2{font-size:calc(13px*var(--fit,1));font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--c-quartz);margin:0 0 6px;line-height:1.5}
.sd-rail .cnt{font-size:12px;color:var(--c-ash);margin:0 0 18px}
.sd-thumbs{list-style:none;margin:0;padding:3px;flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:9px;scrollbar-width:none}
.sd-thumb{display:block;width:166px;max-width:100%;height:47px;overflow:hidden;position:relative;border:1px solid color-mix(in srgb,var(--c-quartz) 10%,transparent);padding:0;background:var(--c-deep-sea);border-radius:4px;line-height:0;opacity:.5;cursor:pointer;transition:opacity .2s,border-color .2s,box-shadow .25s}
.sd-thumb:hover{opacity:.8}
.sd-thumb[aria-current=true]{opacity:1;border-color:var(--c-lilac);box-shadow:0 0 0 1px var(--c-lilac),0 0 14px color-mix(in srgb,var(--c-signal) 45%,transparent)}
.sd-thumb:active{box-shadow:0 0 0 1px var(--c-lilac),0 0 22px color-mix(in srgb,var(--c-lilac) 60%,transparent)}
.sd-thumb:focus-visible{outline:2px solid var(--c-quartz);outline-offset:2px}
.sd-thumb .sdt{pointer-events:none}
.sd-num{position:absolute;right:6px;bottom:5px;font:600 10px var(--font-mono);background:var(--c-void);color:var(--c-quartz);border-radius:4px;padding:1px 5px}
.sd-tools{display:flex;gap:10px;align-items:center;margin-top:14px}
.sd-seg{display:inline-flex;border:1px solid var(--c-hairline);border-radius:9999px;padding:3px}
.sd-seg button{width:34px;height:30px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:var(--c-ash);background:none;border:0;cursor:pointer}
.sd-seg button[aria-pressed=true]{background:var(--c-cobalt);color:var(--c-quartz)}
.sd-pdf{border:1px solid var(--c-hairline);border-radius:9999px;padding:0 16px;height:36px;font:600 12px var(--font-body);letter-spacing:.12em;color:var(--c-quartz);background:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.sd-rail button:focus-visible,.sd-rail a:focus-visible{outline:2px solid var(--c-lilac);outline-offset:2px}
.sd-stack{display:flex;flex-direction:column;gap:24px}
.sd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.sd-slidebtn{cursor:zoom-in}
.sd-float{position:fixed;right:24px;bottom:24px;z-index:50;display:flex;align-items:center;gap:12px;pointer-events:none}
.sd-float .c{font:500 13px var(--font-mono);background:var(--c-void);border:1px solid var(--c-hairline);color:var(--c-quartz);border-radius:9999px;padding:6px 14px}
.sd-float .p{font:600 34px var(--font-display);color:var(--c-lilac);letter-spacing:-.02em}
@media (max-width:1023px){
 .sd-hero{grid-template-columns:1fr;padding:110px 16px 0;gap:28px}
}
@media (max-width:767px){
 .sd-hero{grid-template-columns:1fr;padding:110px 16px 0;gap:28px}
 .sd-hl .hd{margin-top:28px}
 .sd-deck{grid-template-columns:minmax(0,1fr);gap:12px;padding:48px 16px 72px}
 .sd-rail{top:76px;height:auto;z-index:40;background:var(--c-void);padding:8px 0;margin:0 -16px;padding-inline:16px}
 .sd-rail>h2,.sd-rail .cnt,.sd-tools{display:none}
 .sd-thumbs{flex-direction:row;overflow-x:auto;overflow-y:hidden}
 .sd-thumb{width:64px;flex:none}
 .sd-grid{grid-template-columns:1fr}
 .sd-float{right:12px;bottom:12px}.sd-float .p{font-size:24px}
}
@media print{
 @page{size:1280px 720px;margin:0}
 .sd-root>:not(.sd-deck){display:none!important}
 .sd-deck{display:block;padding:0}
 .sd-rail,.sd-float{display:none!important}
 .sd-stack,.sd-grid{display:block}
 .sd-slidebtn{display:block;width:1280px;break-after:page;break-inside:avoid}
 .sdw{border-radius:0;border:0;width:1280px;aspect-ratio:16/9!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 .sdw.tall .sd{font-size:1.5625cqw}
}
`;

export default function SolutionDeck() {
  const [lang] = useLang();
  const { slug = '' } = useParams();
  const ui = SOLUTION_UI[lang];
  const meta = useMemo(() => [...liveDemos(lang), ...previewDemos(lang)].find((d) => d.slug === slug), [lang, slug]);
  const name = meta ? demoText(lang, meta.slug).name : '';
  const sector = meta ? ui.sectors[meta.slug] ?? name : '';
  const desc = meta ? demoText(lang, meta.slug).desc : '';
  usePageMeta(lang, 'solutions', { title: `${name} — ${ui.solutionOf.replace('{sector}', sector)}`, description: desc, path: solutionPath(lang, slug) });

  const [view, setView] = useState<'stack' | 'grid'>('stack');
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const [tall, setTall] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 767px)').matches);
  const [sheet, setSheet] = useState<'package' | 'request' | null>(null);
  const deckRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const access = getDemoAccess();

  useEffect(() => { window.scrollTo(0, 0); }, [slug, lang]);
  // whole words never split: shrink any heading whose longest word overflows its box
  useLayoutEffect(() => {
    const fit = () => document.querySelectorAll<HTMLElement>('.sd h1,.sd h2,.sd-hl h1,.sd-rail>h2').forEach((el) => {
      el.style.setProperty('--fit', '1');
      let f = 1;
      while (el.scrollWidth > el.clientWidth + 1 && f > 0.4) { f -= 0.03; el.style.setProperty('--fit', f.toFixed(2)); }
    });
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [slug, lang, view, tall]);
  useEffect(() => {
    const mq = matchMedia('(max-width: 767px)');
    const h = () => setTall(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0, bd = Infinity;
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      setActive(best);
      const deck = deckRef.current;
      if (deck) {
        const top = deck.getBoundingClientRect().top + window.scrollY;
        const span = deck.offsetHeight - window.innerHeight;
        setPct(span > 0 ? Math.max(0, Math.min(1, (window.scrollY - top + 80) / span)) : 0);
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [view, slug, tall]);

  // keep the active thumbnail visible inside the rail (no page scroll)
  useEffect(() => {
    const list = listRef.current;
    const el = list?.children[active] as HTMLElement | undefined;
    if (!list || !el) return;
    if (tall) list.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' });
    else if (el.offsetTop < list.scrollTop || el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  }, [active, tall]);

  const goTo = useCallback((i: number) => {
    slideRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (!meta) return <Navigate to={pagePath(lang, 'demos')} replace />;

  const ctx = (thumb: boolean): Ctx => ({
    lang, slug: meta.slug, meta, sector, ui, thumb, text: demoText(lang, meta.slug),
    onPackage: () => setSheet('package'), onRequest: () => setSheet('request'),
  });
  const main = ctx(false), th = ctx(true);
  const d = T[lang].demos;
  const slides = Array.from({ length: N }, (_, i) => i);

  return (
    <div data-site-theme="liquid" className="sd-root" style={{ background: 'var(--c-void)', minHeight: '100vh' }}>
      <style>{CSS}</style>
      <SiteNav lang={lang} />
      <section className="sd-hero">
        <div className="sd-hl">
          <h1>{name}</h1>
          <p className="sub">{ui.solutionOf.replace('{sector}', sector)}</p>
          <p className="hd">{ui.heroHead.replace('{name}', name)}</p>
        </div>
        <div className="sd-hr">
          <p>{desc}</p>
          <p>{ui.heroP2.replace('{name}', name)}</p>
          <button type="button" className="sd-hbtn" onClick={() => window.print()}>
            {ui.pdfLabel}
            <svg width="36" height="10" viewBox="0 0 36 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M0 5h35M31 1l4 4-4 4" /></svg>
          </button>
        </div>
      </section>

      <section ref={deckRef} className="sd-deck" aria-label={name}>
        <aside className="sd-rail">
          <h2>{name}</h2>
          <p className="cnt">{fillN(ui.pages, N)}</p>
          <ul className="sd-thumbs" ref={listRef} aria-label={ui.thumbs}>
            {slides.map((i) => (
              <li key={i} style={{ listStyle: 'none', flex: 'none' }}>
                <button type="button" className="sd-thumb lq-square" aria-current={active === i} aria-label={`${ui.slide} ${i + 1}`} onClick={() => { setView('stack'); window.setTimeout(() => goTo(i), 30); }}>
                  <div className="sdt" aria-hidden="true"><Slide n={i} c={th} tall={tall} /></div>
                  <span className="sd-num">{String(i + 1).padStart(2, '0')}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="sd-tools">
            <div className="sd-seg" role="group">
              <button type="button" aria-pressed={view === 'stack'} aria-label={ui.viewStack} title={ui.viewStack} onClick={() => setView('stack')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16" /></svg>
              </button>
              <button type="button" aria-pressed={view === 'grid'} aria-label={ui.viewGrid} title={ui.viewGrid} onClick={() => setView('grid')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 4v16M4 12h16" /></svg>
              </button>
            </div>
            <button type="button" className="sd-pdf" onClick={() => window.print()}>
              PDF
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
            </button>
          </div>
        </aside>
        <div className={view === 'stack' ? 'sd-stack' : 'sd-grid'}>
          {slides.map((i) => (
            <div key={i} ref={(el) => { slideRefs.current[i] = el; }} className={view === 'grid' ? 'sd-slidebtn' : 'sd-slidebtn'} style={{ cursor: view === 'grid' ? 'zoom-in' : 'auto' }}
              onClick={view === 'grid' ? () => { setView('stack'); window.setTimeout(() => goTo(i), 60); } : undefined}>
              <Slide n={i} c={main} tall={tall} />
            </div>
          ))}
        </div>
      </section>

      <div className="sd-float" aria-hidden="true">
        <span className="c">{String(active + 1).padStart(2, '0')} / {N}</span>
        <span className="p">{Math.round(pct * 100)}%</span>
      </div>

      <NewsletterBand lang={lang} />
      <SiteFinale lang={lang} />

      {sheet === 'request' && <DemoRequestModal lang={lang} slug={meta.slug} email={access?.email ?? ''} onClose={() => setSheet(null)} />}
      {sheet === 'package' && (
        <div role="dialog" aria-modal="true" aria-label={name} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
          style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(6px)' }} onMouseDown={(e) => e.target === e.currentTarget && setSheet(null)}>
          <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 md:p-8" style={{ background: 'var(--lq-deep)', border: '1px solid var(--lq-line)' }}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <p className="text-xl" style={{ color: 'var(--lq-white)' }}>{name}</p>
              <button type="button" onClick={() => setSheet(null)} aria-label={d.close} className="w-10 h-10 rounded-full text-xl shrink-0" style={{ border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)', background: 'var(--lq-kelp)' }}>×</button>
            </div>
            <PackageBuilder lang={lang} slug={meta.slug} email={access?.email ?? ''} compact />
          </div>
        </div>
      )}
    </div>
  );
}
