import { useEffect, type ReactNode } from 'react';
import type { Lang } from '../translations';
import { usePageMeta } from '../hooks/usePageMeta';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import App from '../App';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import Docs from '../pages/Docs';
import DemoApp from '../pages/DemoApp';
import SolutionDeck from '../site/pages/SolutionDeck';
import IntakePage from '../site/pages/IntakePage';
import OfferPage from '../site/pages/OfferPage';
import ProjectPage from '../site/pages/ProjectPage';
import NotFound from '../site/pages/NotFound';
import { INTAKE_SLUG, OFFER_SLUG, PROJECT_SLUG, demoPath, isLang, pageFromSlug, pagePath, preferredLang, type PageKey } from '../lib/routes';
import StylePage from '../site/pages/StylePage';
import { toolById } from '../data/affiliates';
import { PACKAGE_IDS } from '../site/i18n/packages';
import { BLOG_POSTS } from '../data/sections';
import { STYLE_SLUG } from '../site/i18n/style';

/** "/" and unknown URLs → home page in the visitor's language */
export function RootRedirect() {
  return <Navigate to={pagePath(preferredLang(), 'home')} replace />;
}

/** Old single-language URLs (/privacy, /terms, /docs) → localized page */
export function LegacyRedirect({ page }: { page: PageKey }) {
  return <Navigate to={pagePath(preferredLang(), page)} replace />;
}

/** Old demo URLs (/demo/:slug) → /:lang/<demos>/:slug */
export function LegacyDemoRedirect() {
  const { slug = '' } = useParams();
  return <Navigate to={demoPath(preferredLang(), slug)} replace />;
}

/** /:lang and /:lang/:page */
export function PageRoute() {
  const { lang, page: pageSlug } = useParams();
  if (!isLang(lang)) return <NotFound />;
  const page = pageFromSlug(lang, pageSlug);
  if (!page) return <NotFound lang={lang} />;
  if (!pageSlug) return <Navigate to={pagePath(lang, 'home')} replace />;
  if (page === 'privacy') return <WithMeta lang={lang} page="privacy"><PrivacyPolicy /></WithMeta>;
  if (page === 'terms') return <WithMeta lang={lang} page="terms"><TermsOfService /></WithMeta>;
  if (page === 'solutions') return <Navigate to={pagePath(lang, 'demos')} replace />;
  if (page === 'docs') return <WithMeta lang={lang} page="docs"><Docs /></WithMeta>;
  return <App page={page} />;
}

/** /:lang/:page/:slug — only valid under the demos page */
export function DemoRoute() {
  const { lang, page: pageSlug, slug } = useParams();
  if (!isLang(lang)) return <RootRedirect />;
  if (pageSlug === INTAKE_SLUG[lang]) return <NoReferrer><IntakePage /></NoReferrer>;
  if (pageSlug === OFFER_SLUG[lang]) return <NoReferrer><OfferPage /></NoReferrer>;
  if (pageSlug === PROJECT_SLUG[lang]) return <NoReferrer><ProjectPage /></NoReferrer>;
  if (pageSlug === STYLE_SLUG[lang]) return <NoReferrer><StylePage /></NoReferrer>;
  if (pageFromSlug(lang, pageSlug) === 'solutions') return <SolutionDeck />;
  if (pageFromSlug(lang, pageSlug) === 'blog') {
    return BLOG_POSTS.en.some((p) => p.id === slug) ? <App page="blog" sub={slug} /> : <Navigate to={pagePath(lang, 'blog')} replace />;
  }
  if (pageFromSlug(lang, pageSlug) === 'packages') {
    return (PACKAGE_IDS as readonly string[]).includes(slug ?? '') ? <App page="packages" sub={slug} /> : <Navigate to={pagePath(lang, 'packages')} replace />;
  }
  if (pageFromSlug(lang, pageSlug) === 'tools') {
    const tool = toolById(slug);
    return tool && (tool.active || import.meta.env.DEV) ? <App page="tools" sub={tool.id} /> : <Navigate to={pagePath(lang, 'tools')} replace />;
  }
  if (pageFromSlug(lang, pageSlug) !== 'demos') return <Navigate to={pagePath(lang, 'home')} replace />;
  return <WithMeta lang={lang} page="demos" demo><DemoApp /></WithMeta>;
}

/** Private link pages (code in the URL): never send the URL to other sites as Referer (security standard §2). */
function NoReferrer({ children }: { children: ReactNode }) {
  useEffect(() => {
    let m = document.head.querySelector<HTMLMetaElement>('meta[name="referrer"]');
    const created = !m;
    if (!m) { m = document.createElement('meta'); m.name = 'referrer'; document.head.appendChild(m); }
    const prev = m.content;
    m.content = 'no-referrer';
    return () => { if (created) m!.remove(); else m!.content = prev; };
  }, []);
  return <>{children}</>;
}

/** Head meta for routes not rendered by <App> (legal pages, single demos) */
function WithMeta({ lang, page, demo, children }: { lang: Lang; page: PageKey; demo?: boolean; children: ReactNode }) {
  const { pathname } = useLocation();
  // Demo pages: own canonical, kept out of search results (title is set by DemoApp)
  usePageMeta(lang, page, demo ? { path: pathname, noindex: true, keepTitle: true } : {});
  return <>{children}</>;
}

/**
 * Makes plain <a href="/…"> and legacy "#section" links behave like in-app
 * navigation (no full reload). External links, new-tab clicks and downloads are untouched.
 */
const HASH_PAGE: Record<string, PageKey> = {
  '#': 'home', '#hero': 'home', '#services': 'services', '#about': 'about',
  '#portfolio': 'portfolio', '#demos': 'demos', '#blog': 'blog', '#contact': 'contact',
};

export function LinkInterceptor() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (href in HASH_PAGE) {
        const seg = pathname.split('/')[1];
        const lang = isLang(seg) ? seg : preferredLang();
        e.preventDefault();
        navigate(pagePath(lang, HASH_PAGE[href]));
        return;
      }
      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/api/')) {
        e.preventDefault();
        navigate(href);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate, pathname]);

  return null;
}
