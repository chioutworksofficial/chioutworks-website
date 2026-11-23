import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CookieConsent from './components/CookieConsent.tsx'
import ServerTracker from './components/ServerTracker.tsx'
import { DemoRoute, LegacyDemoRedirect, LegacyRedirect, LinkInterceptor, PageRoute, RootRedirect } from './components/Routing.tsx'
import NotFound from './site/pages/NotFound.tsx'
import './index.css'
import { startDynamicFavicon } from './lib/favicon.ts'
import { startMonitoring } from './lib/monitoring.ts'

startDynamicFavicon()
startMonitoring()

// Safety net: if a page without <Preloader> was opened directly, never leave the index.html intro overlay on screen
window.setTimeout(() => {
  const pre = document.getElementById('cw-pre');
  if (!pre || pre.hasAttribute('data-out')) return;
  pre.remove();
  document.body.style.overflow = '';
  (window as unknown as { __cwPreDone?: boolean }).__cwPreDone = true;
  window.dispatchEvent(new Event('cw:preloader-done'));
}, 2800)   // after the normal intro maximum (Preloader MAX 2500 ms)

const Admin = lazy(() => import('./pages/Admin.tsx'))
const DevTts = import.meta.env.DEV ? lazy(() => import('./pages/DevTts.tsx')) : null

// URL scheme (see src/lib/routes.ts): /:lang/:page and /:lang/<demos>/:slug,
// e.g. /tr/ana-sayfa, /en/home, /de/startseite, /el/arxiki, /tr/demolar/demokuafor
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CookieConsent />
      <ServerTracker />
      <LinkInterceptor />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/admin/voice-agent"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
        {DevTts && <Route path="/dev/tts" element={<Suspense fallback={null}><DevTts /></Suspense>} />}
        {/* Old single-language URLs keep working */}
        <Route path="/privacy" element={<LegacyRedirect page="privacy" />} />
        <Route path="/terms" element={<LegacyRedirect page="terms" />} />
        <Route path="/docs" element={<LegacyRedirect page="docs" />} />
        <Route path="/demo/:slug" element={<LegacyDemoRedirect />} />
        {/* Localized pages */}
        <Route path="/:lang" element={<PageRoute />} />
        <Route path="/:lang/:page" element={<PageRoute />} />
        <Route path="/:lang/:page/:slug" element={<DemoRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
