import { useLang } from '../hooks/useLang';
import SiteNav from '../site/SiteNav';
import SiteFooter from '../site/SiteFooter';
import Preloader from '../site/Preloader';

interface Props { children: React.ReactNode; }

export default function LegalLayout({ children }: Props) {
  const [lang] = useLang();

  return (
    <div data-site-theme="liquid" style={{ background: 'var(--lq-abyss)', minHeight: '100vh' }}>
      {/* The index.html intro overlay must be removed here too, or a direct visit (new tab, search result) stays on the logo */}
      <Preloader lang={lang} />
      <SiteNav lang={lang} />
      <main style={{ paddingTop: 76 }}>{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}
