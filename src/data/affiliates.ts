// Partner / affiliate tools: the orbiting ring on the home page, the "Tools I use" overview and one page per tool.
// The referral links themselves are NOT here (never shipped to the browser): they live in server/affiliates.ts and the
// visitor reaches them only through the button on the tool page (/api/go/<id>), which counts the click (cookieless).
// HOW TO ADD ONE: official logo from the program's brand kit into public/partners/, an entry here, the referral link in
// server/affiliates.ts, the texts in src/site/i18n/tools.ts (4 languages), and the new URLs in public/sitemap.xml.
// Brand colours: each pill shows the brand as the brand shows itself (owner, 2026-11-18). This is the ONLY place where
// partner brand colours (incl. Hostinger's purple) are allowed; the site's own palette rule stays unchanged elsewhere.
export type ToolId = 'hostinger' | 'n26' | 'wise';

export interface Affiliate {
  id: ToolId;
  name: string;     // brand name, also the alt text
  active: boolean;  // false = hidden on the live site (shown greyed out only in development)
  logo: string;     // logo drawn on the brand pill
  pill: string;     // brand background of the pill
  pillEdge?: string; // thin edge for light pills that would melt into a light page
}

export const AFFILIATES: Affiliate[] = [
  // Hostinger's own wordmark (from hostinger.com), white on Hostinger purple, as the brand presents itself.
  { id: 'hostinger', name: 'Hostinger', active: true, logo: '/partners/hostinger-white.svg', pill: '#673de6' },
  // N26's own wordmark (from the n26.com header), black on white, as on n26.com.
  { id: 'n26', name: 'N26', active: true, logo: '/partners/n26-dark.svg', pill: '#ffffff', pillEdge: 'rgba(12, 21, 48, 0.12)' },
  // Wise's own wordmark (from the wise.com header), forest green on Wise's bright green, as on wise.com.
  { id: 'wise', name: 'Wise', active: true, logo: '/partners/wise.svg', pill: '#9fe870' },
];

export const toolById = (id: string | undefined) => AFFILIATES.find((a) => a.id === id);
