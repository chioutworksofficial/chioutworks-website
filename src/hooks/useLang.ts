import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Lang } from '../translations';
import { isLang, preferredLang, switchLangPath } from '../lib/routes';

const KEY = 'cw-lang';

/**
 * Current language. On localized routes (/tr/…, /en/…) the URL is the source of
 * truth; switching language navigates to the same page in the other language.
 * On routes without a language segment (e.g. /admin) it falls back to the saved choice.
 */
export function useLang(): [Lang, (l: Lang) => void] {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const seg = pathname.split('/')[1];
  const [stored, setStored] = useState<Lang>(() => preferredLang());
  const lang: Lang = isLang(seg) ? seg : stored;

  // Remember the language only when the visitor switches it themselves (not when they merely open a link in some language),
  // so the country-based default keeps working for everyone else.
  const prev = useRef<string | undefined>(seg);
  useEffect(() => {
    if (isLang(seg) && isLang(prev.current) && prev.current !== seg) {
      try { localStorage.setItem(KEY, seg); } catch { /* storage blocked */ }
    }
    prev.current = seg;
  }, [seg]);

  const setLang = (l: Lang) => {
    try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
    setStored(l);
    if (isLang(seg) && l !== seg) navigate(switchLangPath(pathname, l));
  };

  return [lang, setLang];
}
