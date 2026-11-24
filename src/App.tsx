import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from './hooks/useLang';
import SiteNav from './site/SiteNav';
import Preloader from './site/Preloader';
import SiteHero, { openAssistant } from './site/SiteHero';
import { ChatLauncher } from './site/VoiceOrb';
const VoiceIntake = lazy(() => import('./site/VoiceIntake'));
const loadAssistantChunks = () => Promise.all([import('./components/AIAssistant'), import('./site/VoiceIntake')]);
import { SITE_UI } from './site/i18n';
import StatementReveal from './site/StatementReveal';
// FaqSection / ProjectsCarousel removed from home (owner request); FAQ lives on its own page
const ServicesPage = lazy(() => import('./site/pages/ServicesPage'));
const AboutPage = lazy(() => import('./site/pages/AboutPage'));
const PortfolioPage = lazy(() => import('./site/pages/PortfolioPage'));
const BlogPage = lazy(() => import('./site/pages/BlogPage'));
const ContactPage = lazy(() => import('./site/pages/ContactPage'));
const DemosPage = lazy(() => import('./site/pages/DemosPage'));
const FaqPage = lazy(() => import('./site/pages/FaqPage'));
const ResourcesPage = lazy(() => import('./site/pages/ResourcesPage'));
const ToolsPage = lazy(() => import('./site/pages/ToolsPage'));
const ToolPage = lazy(() => import('./site/pages/ToolsPage').then((m) => ({ default: m.ToolPage })));
const PackagePage = lazy(() => import('./site/pages/PackagePage'));
const SiteCheckPage = lazy(() => import('./site/pages/SiteCheckPage'));
const BlogArticle = lazy(() => import('./site/pages/BlogArticle'));
import { BLOG_IDS } from './data/blogIds.js';
import { PACKAGE_IDS, type PackageId } from './site/i18n/packageIds.js';
import { toolById } from './data/affiliates';
import SectionDots from './site/SectionDots';
import SiteCheckCta from './site/SiteCheckCta';
const AIAssistant = lazy(() => import('./components/AIAssistant'));
import type { PageKey } from './lib/routes';
import { initSmoothScroll, getLenis } from './lib/smoothScroll';
import { usePageMeta } from './hooks/usePageMeta';
import type { Lang } from './translations';
import { useMode } from './site/ModeToggle';

// Below-the-fold home sections load as separate chunks (smaller first bundle, less main-thread work on phones)
const loaders = {
  features: () => import('./site/FeaturesScroll'), industries: () => import('./site/IndustriesWheel'),
  roi: () => import('./site/RoiCalculator'), partners: () => import('./site/PartnerStrip'),
  finale: () => import('./site/SiteFinale'), popular: () => import('./site/PopularPackages'),
};
// Pinned sections stay eager (owner, 2026-11-23): a lazily created pin after an earlier-created pin broke the scroll
// order and the next section slid over the cards. Only non-pinned sections are deferred.
import FeaturesScroll from './site/FeaturesScroll';
import NewsletterBand from './site/NewsletterBand';
import IndustriesWheel from './site/IndustriesWheel';
const RoiCalculator = lazy(loaders.roi);
const PartnerStrip = lazy(loaders.partners);
const SiteFinale = lazy(loaders.finale);
const PopularPackages = lazy(loaders.popular);

let refreshTimer = 0;
/** Pinned ScrollTriggers measure on mount: re-measure (batched) once a lazy section has appeared; SectionDots rescans on resize. */
function Mounted() {
  useEffect(() => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => requestAnimationFrame(() => { void import('gsap/ScrollTrigger').then((m) => m.ScrollTrigger.refresh()); window.dispatchEvent(new Event('resize')); }), 120);
  }, []);
  return null;
}
/** Lazy section: placeholder (same id + height, no layout shift, anchors keep a target) until it is within ~1.2 screens, then the chunk loads. */
function Defer({ id, minH, children }: { id?: string; minH: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const ph = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ph.current;
    if (on || !el) return;
    if (!('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { rootMargin: '1200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  const fb = <section ref={ph} id={id} aria-hidden="true" style={{ minHeight: minH }} />;
  // Stable wrapper (hotfix 2026-11-23): GSAP pins move sections into a pin-spacer; without a wrapper React's insertBefore
  // used a pinned sibling as reference and crashed the page with NotFoundError on phones. Inside its own div React only
  // ever appends here, so pinned neighbours are never touched.
  return <div data-defer="">{on ? <Suspense fallback={fb}>{children}<Mounted /></Suspense> : fb}</div>;
}

/**
 * Assistant + voice dialog are not needed for the first paint: mount them once the intro is done and the browser is idle,
 * on the first interaction, or when something asks to open them (that early event is replayed once they are mounted). Both devices; no visible change.
 */
function LateAssistants({ lang }: { lang: Lang }) {
  // Mounted right away again (owner, 2026-11-23: the assistant must stay reliable). The deferred start could swallow the
  // first open-voice tap and start audio outside the user's gesture; the chunks still load in parallel, not in the entry.
  const [armed, setArmed] = useState(true);
  const pending = useRef<CustomEvent | null>(null);
  useEffect(() => {
    if (armed) return;
    const w = window as unknown as { requestIdleCallback?: (f: () => void, o: { timeout: number }) => void };
    const arm = () => { off(); setArmed(true); };
    const idle = () => (w.requestIdleCallback ? w.requestIdleCallback(arm, { timeout: 2500 }) : void window.setTimeout(arm, 1500));
    const early = (e: Event) => { pending.current = new CustomEvent(e.type, { detail: (e as CustomEvent).detail }); e.stopImmediatePropagation(); arm(); };
    const input = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
    const done = (window as unknown as { __cwPreDone?: boolean }).__cwPreDone;
    const t = window.setTimeout(arm, 6000);
    if (done) idle(); else window.addEventListener('cw:preloader-done', idle, { once: true });
    input.forEach((n) => window.addEventListener(n, arm, { passive: true, once: true }));
    window.addEventListener('cw:open-assistant', early, true);
    window.addEventListener('cw:open-voice', early, true);
    function off() {
      window.clearTimeout(t);
      window.removeEventListener('cw:preloader-done', idle);
      input.forEach((n) => window.removeEventListener(n, arm));
      window.removeEventListener('cw:open-assistant', early, true);
      window.removeEventListener('cw:open-voice', early, true);
    }
    return off;
  }, [armed]);
  useEffect(() => {
    if (!armed || !pending.current) return;
    const ev = pending.current;
    pending.current = null;
    void loadAssistantChunks().then(() => window.setTimeout(() => window.dispatchEvent(ev), 150));
  }, [armed]);
  // Stable wrapper: React never inserts/removes next to a GSAP-pinned node (see Defer)
  return (
    <div data-late="">
      {armed && <Suspense fallback={null}>
        <AIAssistant lang={lang} hideLauncher />
        <VoiceIntake lang={lang} />
      </Suspense>}
    </div>
  );
}

type SitePage = Exclude<PageKey, 'privacy' | 'terms' | 'docs' | 'solutions'>;

/** Which sections make up each page. Content stays in translations.ts / data — only layout lives here. */
const PAGES: Record<SitePage, (lang: Lang) => ReactNode> = {
  // lialive order: hero → features (pinned) → statement → industries wheel → FAQ → savings → projects → CTA
  home: (lang) => (
    <>
      <SiteHero lang={lang} />
      <FeaturesScroll lang={lang} />
      <StatementReveal lang={lang} />
      <Defer id="popular" minH="80vh"><PopularPackages lang={lang} /></Defer>
      <IndustriesWheel lang={lang} />
      <div data-sc=""><SiteCheckCta lang={lang} /></div>
      <Defer minH="40vh"><PartnerStrip lang={lang} /></Defer>
      <Defer id="roi" minH="100vh"><RoiCalculator lang={lang} /></Defer>
    </>
  ),
  services: (lang) => <ServicesPage lang={lang} />,
  about: (lang) => <AboutPage lang={lang} />,
  portfolio: (lang) => <PortfolioPage lang={lang} />,
  demos: (lang) => <DemosPage lang={lang} />,
  blog: (lang) => <BlogPage lang={lang} />,
  faq: (lang) => <FaqPage lang={lang} />,
  resources: (lang) => <ResourcesPage lang={lang} />,
  contact: (lang) => <ContactPage lang={lang} />,
  tools: (lang) => <ToolsPage lang={lang} />,
  siteCheck: (lang) => <SiteCheckPage lang={lang} />,
  packages: (lang) => <Defer id="popular" minH="80vh"><PopularPackages lang={lang} /></Defer>,
};

export default function App({ page = 'home', sub }: { page?: SitePage; sub?: string }) {
  const [lang] = useLang();
  const mode = useMode();   // canvas sections read their colours once: re-mount on light/dark change
  // Partner tool page (/:lang/<tools>/:id): own title, description, canonical and language alternates
  const tool = page === 'tools' ? toolById(sub) : undefined;
  // Package page (/:lang/<packages>/:id)
  const pkg = page === 'packages' && (PACKAGE_IDS as readonly string[]).includes(sub ?? '') ? (sub as PackageId) : undefined;
  // Blog article (/:lang/blog/:id)
  const post = page === 'blog' && (BLOG_IDS as readonly string[]).includes(sub ?? '') ? sub : undefined;

  // Detail pages (tool, package, article) set their own title/canonical in their lazy chunk, so their texts stay out of the entry
  usePageMeta(lang, page, { skip: !!(tool || pkg || post) });

  useEffect(() => initSmoothScroll(), []);

  // Warm the lazy section chunks on the first scroll/touch (or after 10 s) so a placeholder is rarely seen
  useEffect(() => {
    const go = () => { off(); Object.values(loaders).forEach((l) => void l()); };
    const t = window.setTimeout(go, 10000);
    const ev = ['scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel'] as const;
    const off = () => { window.clearTimeout(t); ev.forEach((e) => window.removeEventListener(e, go)); };
    ev.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    return off;
  }, []);

  // New page → start at the top
  useEffect(() => {
    // Lenis keeps its own target position: reset it too, or the new page opens where the old one was (e.g. at the bottom)
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [lang, page, sub]);

  return (
    <div data-site-theme="liquid" style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <a href="#main" className="cw-skip" onClick={(e) => { e.preventDefault(); const m = document.getElementById('main'); m?.focus({ preventScroll: true }); m?.scrollIntoView(); }}>{SITE_UI[lang].skipToContent}</a>
      <Preloader lang={lang} />
      <SiteNav lang={lang} />
      {/* Fixed navbar: keep inner pages' first section clear of it (PageHero pages clear it themselves) */}
      {page !== 'home' && page !== 'blog' && page !== 'faq' && page !== 'resources' && <div aria-hidden="true" style={{ height: 76 }} />}
      {/* Page change: the new page sharpens out of a short blur and rises slightly (lialive-style) */}
      <main id="main" tabIndex={-1} key={`${lang}-${page}-${sub ?? ''}`} className="cw-page-enter"><Suspense fallback={<div style={{ minHeight: '60vh' }} aria-busy="true" />}>{tool ? <ToolPage lang={lang} a={tool} /> : pkg ? <PackagePage lang={lang} id={pkg} /> : post ? <BlogArticle lang={lang} id={post} /> : PAGES[page](lang)}</Suspense></main>
      <NewsletterBand lang={lang} />
      <Defer id="start" minH="calc(660px + clamp(240px, 30vw, 460px))"><SiteFinale key={mode} lang={lang} /></Defer>
      <SectionDots lang={lang} page={page} />
      <LateAssistants lang={lang} />
      <ChatLauncher label={SITE_UI[lang].openChat} onOpen={() => openAssistant(false)} />
    </div>
  );
}
