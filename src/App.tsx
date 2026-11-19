import { useEffect, type ReactNode } from 'react';
import { useLang } from './hooks/useLang';
import SiteNav from './site/SiteNav';
import Preloader from './site/Preloader';
import SiteHero, { openAssistant } from './site/SiteHero';
import { ChatLauncher } from './site/VoiceOrb';
import VoiceIntake from './site/VoiceIntake';
import { SITE_UI } from './site/i18n';
import StatementReveal from './site/StatementReveal';
import FeaturesScroll from './site/FeaturesScroll';
import IndustriesWheel from './site/IndustriesWheel';
// FaqSection / ProjectsCarousel removed from home (owner request); FAQ lives on its own page
import RoiCalculator from './site/RoiCalculator';
import PartnerStrip from './site/PartnerStrip';
import SiteFinale from './site/SiteFinale';
import ServicesPage from './site/pages/ServicesPage';
import AboutPage from './site/pages/AboutPage';
import PortfolioPage from './site/pages/PortfolioPage';
import BlogPage from './site/pages/BlogPage';
import ContactPage from './site/pages/ContactPage';
import DemosPage from './site/pages/DemosPage';
import FaqPage from './site/pages/FaqPage';
import ResourcesPage from './site/pages/ResourcesPage';
import ToolsPage, { ToolPage } from './site/pages/ToolsPage';
import PackagePage from './site/pages/PackagePage';
import BlogArticle from './site/pages/BlogArticle';
import { BLOG_POSTS } from './data/sections';
import { PACKAGE_IDS, PACKAGE_TEXT, type PackageId } from './site/i18n/packages';
import { POPULAR_UI } from './site/i18n/popular';
import { toolById } from './data/affiliates';
import { TOOL_TEXT } from './site/i18n/tools';
import PopularPackages from './site/PopularPackages';
import SectionDots from './site/SectionDots';
import AIAssistant from './components/AIAssistant';
import { toolPath, packagePath, blogPath, type PageKey } from './lib/routes';
import { initSmoothScroll, getLenis } from './lib/smoothScroll';
import { usePageMeta } from './hooks/usePageMeta';
import type { Lang } from './translations';
import { useMode } from './site/ModeToggle';

type SitePage = Exclude<PageKey, 'privacy' | 'terms' | 'docs' | 'solutions'>;

/** Which sections make up each page. Content stays in translations.ts / data — only layout lives here. */
const PAGES: Record<SitePage, (lang: Lang) => ReactNode> = {
  // lialive order: hero → features (pinned) → statement → industries wheel → FAQ → savings → projects → CTA
  home: (lang) => (
    <>
      <SiteHero lang={lang} />
      <FeaturesScroll lang={lang} />
      <StatementReveal lang={lang} />
      <PopularPackages lang={lang} />
      <IndustriesWheel lang={lang} />
      <PartnerStrip lang={lang} />
      <RoiCalculator lang={lang} />
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
  packages: (lang) => <PopularPackages lang={lang} />,
};

export default function App({ page = 'home', sub }: { page?: SitePage; sub?: string }) {
  const [lang] = useLang();
  const mode = useMode();   // canvas sections read their colours once: re-mount on light/dark change
  // Partner tool page (/:lang/<tools>/:id): own title, description, canonical and language alternates
  const tool = page === 'tools' ? toolById(sub) : undefined;
  const toolText = tool ? TOOL_TEXT[tool.id][lang] : undefined;
  // Package page (/:lang/<packages>/:id)
  const pkg = page === 'packages' && (PACKAGE_IDS as readonly string[]).includes(sub ?? '') ? (sub as PackageId) : undefined;
  const pkgTitle = pkg ? POPULAR_UI[lang].items[PACKAGE_IDS.indexOf(pkg)].title : '';
  // Blog article (/:lang/blog/:id)
  const post = page === 'blog' && sub ? BLOG_POSTS[lang].find((p) => p.id === sub) : undefined;

  usePageMeta(lang, page, tool && toolText ? { title: `${toolText.tagline} — Chioutworks`, description: toolText.short, path: toolPath(lang, tool.id), alt: (l) => toolPath(l, tool.id) }
    : pkg ? { title: `${pkgTitle} — Chioutworks`, description: PACKAGE_TEXT[pkg][lang].intro.slice(0, 155), path: packagePath(lang, pkg), alt: (l) => packagePath(l, pkg) }
    : post ? { title: `${post.title} — Chioutworks`, description: post.excerpt.slice(0, 155), path: blogPath(lang, post.id), alt: (l) => blogPath(l, post.id) } : {});

  useEffect(() => initSmoothScroll(), []);

  // New page → start at the top
  useEffect(() => {
    // Lenis keeps its own target position: reset it too, or the new page opens where the old one was (e.g. at the bottom)
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [lang, page, sub]);

  return (
    <div data-site-theme="liquid" style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <Preloader lang={lang} />
      <SiteNav lang={lang} />
      {/* Fixed navbar: keep inner pages' first section clear of it (PageHero pages clear it themselves) */}
      {page !== 'home' && page !== 'blog' && page !== 'faq' && page !== 'resources' && <div aria-hidden="true" style={{ height: 76 }} />}
      {/* Page change: the new page sharpens out of a short blur and rises slightly (lialive-style) */}
      <main key={`${lang}-${page}-${sub ?? ''}`} className="cw-page-enter">{tool ? <ToolPage lang={lang} a={tool} /> : pkg ? <PackagePage lang={lang} id={pkg} /> : post ? <BlogArticle lang={lang} post={post} /> : PAGES[page](lang)}</main>
      <SiteFinale key={mode} lang={lang} />
      <SectionDots lang={lang} page={page} />
      <AIAssistant lang={lang} hideLauncher />
      <VoiceIntake lang={lang} />
      <ChatLauncher label={SITE_UI[lang].openChat} onOpen={() => openAssistant(false)} />
    </div>
  );
}
