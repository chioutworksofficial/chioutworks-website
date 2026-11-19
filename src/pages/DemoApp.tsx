import { memo, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { T, type Lang } from '../translations';
import { useLang } from '../hooks/useLang';
import { isBuiltSlug, type BuiltDemoSlug } from '../data/demos';
import { demoText } from '../components/demos/demoText';
import { getDemoAccess, formatRemaining, fill, type DemoAccess } from '../lib/demoAccess';
import DemoAccessModal from '../components/DemoAccessModal';
import KuaforDemo from '../components/demos/KuaforDemo';
import KlinikDemo from '../components/demos/KlinikDemo';
import TemizlikDemo from '../components/demos/TemizlikDemo';
import SadakatDemo from '../components/demos/SadakatDemo';
import CrmDemo from '../components/demos/CrmDemo';
import EmlakDemo from '../components/demos/EmlakDemo';
import KafeDemo from '../components/demos/KafeDemo';
import KariyerDemo from '../components/demos/KariyerDemo';
import LojistikDemo from '../components/demos/LojistikDemo';
import type { DemoProps } from '../components/demos/ui';
import SharePanel from '../components/demos/SharePanel';
import PackageBuilder from '../components/demos/PackageBuilder';
import { MoneyProvider, CurrencySwitch } from '../lib/currency';
import MessageGuard from '../components/demos/MessageGuard';
import { pagePath } from '../lib/routes';
import Logo from '../site/Logo';
import '../styles/demo-isolation.css';
import BtnArrow from '../site/BtnArrow';


const APPS: Partial<Record<BuiltDemoSlug, (p: DemoProps) => React.ReactElement>> = {
  demokuafor: KuaforDemo,
  demoklinik: KlinikDemo,
  demotemizlik: TemizlikDemo,
  demosadakat: SadakatDemo,
  democrm: CrmDemo,
  demoemlak: EmlakDemo,
  demokafe: KafeDemo,
  demokariyer: KariyerDemo,
  demolojistik: LojistikDemo,
};

const LANGS: Lang[] = ['en', 'de', 'tr', 'el'];

export default function DemoApp() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const [access, setAccess] = useState<DemoAccess | null>(() => getDemoAccess());
  const [, tick] = useState(0);
  const d = T[lang].demos;
  const t = d.app;

  useEffect(() => {
    const id = setInterval(() => {
      setAccess(getDemoAccess());
      tick((n) => n + 1);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Set before children render (idempotent) so language-aware leaves like QrImage read the current language
  if (typeof document !== 'undefined' && document.documentElement.lang !== lang) document.documentElement.lang = lang;

  useEffect(() => {
    if (isBuiltSlug(slug)) document.title = `${slug} · ${demoText(lang, slug).name} · Chioutworks`;
    window.scrollTo(0, 0);
  }, [slug, d]);

  if (!isBuiltSlug(slug) || !APPS[slug]) {
    return (
      <Centered>
        <h1 className="text-3xl tracking-[-0.03em] mb-6" style={{ color: 'var(--lq-white)' }}>{t.notFound}</h1>
        <Link to={pagePath(lang, 'demos')} className="lq-btn-ghost">{t.home}<BtnArrow /></Link>
      </Centered>
    );
  }

  const item = demoText(lang, slug);

  if (!access) {
    return (
      <Centered>
        <p className="text-xs mb-2" style={{ color: 'var(--lq-silver)', fontFamily: 'var(--lq-mono)' }}>{slug}</p>
        <h1 className="text-4xl tracking-[-0.04em] leading-none mb-3" style={{ color: 'var(--lq-white)' }}>{item.name}</h1>
        <p className="text-base mb-1" style={{ color: 'var(--lq-mist)' }}>{t.lockedTitle}</p>
        <p className="text-sm mb-6" style={{ color: 'var(--lq-silver)' }}>{t.lockedSub}</p>
        <DemoAccessModal open lang={lang} demo={slug} onClose={() => navigate(pagePath(lang, 'demos'))} onUnlocked={setAccess} />
      </Centered>
    );
  }

  return (
    <MoneyProvider lang={lang}>
    <MessageGuard lang={lang}>
    <div data-site-theme="liquid" data-mode-lock="" style={{ background: 'var(--lq-abyss)', minHeight: '100vh' }}>
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-3" style={{ background: 'color-mix(in srgb, var(--lq-deep) 88%, transparent)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--lq-line)' }}>
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-3">
          <Link to={pagePath(lang, 'home')} aria-label="Chioutworks" className="mr-1"><Logo size={26} /></Link>
          <Link to={pagePath(lang, 'demos')} className="text-[12px] uppercase tracking-[0.12em]" style={{ color: 'var(--lq-silver)' }}>← {t.back}</Link>
          <span className="hidden sm:block w-px h-5" style={{ background: 'var(--lq-line-strong)' }} />
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm" style={{ color: 'var(--lq-white)' }}>{item.name}</span>
            <span className="text-[11px] rounded-full px-2 py-0.5" style={{ background: 'var(--lq-kelp)', color: 'var(--lq-silver)', fontFamily: 'var(--lq-mono)', border: '1px solid var(--lq-line)' }}>{slug}</span>
          </div>
          <div className="demo-controls flex items-center gap-3">
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] rounded-full px-3 py-1.5" style={{ background: 'var(--color-lime-soft)', color: 'var(--lq-mist)', border: '1px solid var(--lq-line)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lq-g2)' }} />
            {fill(t.remaining, { time: formatRemaining(access.expiresAt - Date.now()) })}
          </span>
          <CurrencySwitch />
          <div className="flex rounded-full p-0.5" style={{ border: '1px solid var(--lq-line-strong)' }}>
            {LANGS.map((l) => (
              <button key={l} onClick={() => setLang(l)} className="text-[11px] font-medium uppercase rounded-full px-2 py-1"
                style={l === lang ? { background: 'color-mix(in srgb, var(--c-lilac) 18%, var(--c-abyss))', color: 'var(--c-quartz)' } : { color: 'var(--lq-silver)' }}>
                {l}
              </button>
            ))}
          </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
          <h1 className="text-4xl md:text-6xl tracking-[-0.04em] leading-none" style={{ color: 'var(--lq-white)' }}>{item.name}</h1>
          <p className="text-xs" style={{ color: 'var(--lq-silver)' }}>{t.demoNote}</p>
        </div>

        {/* key={lang}: switching language reloads the market-specific sample data.
            Memoised so the 30 s access-timer tick never re-renders (and resets) the demo. */}
        <MemoDemo key={lang} slug={slug} lang={lang} />

        <div className="mt-8">
          <SharePanel lang={lang} name={item.name} />
        </div>

        <PackageBuilder key={`${slug}-${lang}`} lang={lang} slug={slug} email={access.email} />

        <section className="mt-12 rounded-2xl p-8 flex flex-col md:flex-row md:items-center gap-6" style={{ background: 'linear-gradient(160deg, color-mix(in srgb, var(--lq-g1) 38%, var(--lq-kelp)), var(--lq-kelp) 70%)', border: '1px solid var(--lq-line)' }}>
          <div className="flex-1">
            <h2 className="text-3xl tracking-[-0.03em] mb-2" style={{ color: 'var(--lq-white)' }}>{t.ctaTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--lq-silver)' }}>{t.ctaSub}</p>
            <p className="text-xs mt-3" style={{ color: 'var(--lq-g2)' }}>✓ {d.custom}</p>
          </div>
          <Link to={pagePath(lang, 'contact')} className="lq-btn-ghost">{t.ctaBtn}<BtnArrow /></Link>
        </section>
      </main>
    </div>
    </MessageGuard>
    </MoneyProvider>
  );
}

const MemoDemo = memo(function MemoDemo({ slug, lang }: { slug: BuiltDemoSlug; lang: Lang }) {
  const Demo = APPS[slug];
  // Industry colour theme (tokens in src/styles/theme.css → [data-demo-theme])
  return Demo ? (
    <div data-demo-theme={slug.replace(/^demo/, '')}>
      <Demo lang={lang} t={T[lang].demos.app} />
    </div>
  ) : null;
});


function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div data-site-theme="liquid" data-mode-lock="" className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: 'var(--lq-abyss)' }}>
      <div className="max-w-md">{children}</div>
    </div>
  );
}
