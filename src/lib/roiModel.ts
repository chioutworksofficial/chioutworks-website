import type { Lang } from '../translations';

// Pure model of the savings calculator (no React) — shared by the calculator, the
// contact form and the print report, and unit-checked on its own.

export type SectorKey = 'salon' | 'clinic' | 'cleaning' | 'realestate' | 'cafe' | 'agency' | 'other';
export const SECTOR_KEYS: SectorKey[] = ['salon', 'clinic', 'cleaning', 'realestate', 'cafe', 'agency', 'other'];
export type RoiCurrency = 'TRY' | 'EUR' | 'GBP' | 'USD';

export interface RoiTask { name: string; min: number; perWeek: number; auto: number }
export interface RoiCalc {
  v: 1; sector: SectorKey; sectorLabel: string; tasks: RoiTask[]; staff: number; cost: number; currency: RoiCurrency; lang: Lang;
}
export interface RoiResult { weekH: number; monthH: number; yearH: number; moneyMonth: number; moneyYear: number; days: number }

export const STORAGE_KEY = 'cw-roi-calc';
export const MAX_TASKS = 30;
export const WEEKS_PER_YEAR = 52;
export const WORKDAY_H = 8;
/** Default hourly cost in the market currency (TRY / EUR / EUR / GBP) */
export const DEFAULT_COST: Record<Lang, number> = { tr: 250, de: 30, el: 15, en: 25 };
export const LOCALE: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };
/** [minutes per occurrence, occurrences per week, % automatable] per sector task */
export const SECTOR_NUM: Record<SectorKey, [number, number, number][]> = {
  salon: [[2, 60, 70], [4, 40, 60], [5, 10, 50], [1, 30, 80]],
  clinic: [[2, 80, 80], [8, 25, 60], [3, 30, 70], [10, 15, 40]],
  cleaning: [[12, 8, 50], [15, 6, 50], [3, 30, 70], [8, 10, 60]],
  realestate: [[5, 30, 60], [6, 15, 60], [20, 4, 40], [4, 25, 70]],
  cafe: [[3, 25, 60], [20, 2, 40], [15, 3, 50], [10, 3, 40]],
  agency: [[45, 4, 70], [10, 10, 60], [5, 15, 50], [30, 2, 60]],
  other: [[5, 30, 60], [3, 40, 50], [30, 2, 60]],
};
/** Live demo matching a sector (null → solutions overview) */
export const SECTOR_DEMO: Record<SectorKey, string | null> = {
  salon: 'demokuafor', clinic: 'demoklinik', cleaning: 'demotemizlik', realestate: 'demoemlak', cafe: 'demokafe', agency: 'democrm', other: null,
};

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

/** hours saved per week = Σ minutes × per week ÷ 60 × auto% × staff; month = week × 52 ÷ 12; year = week × 52 */
export function calcRoi(tasks: RoiTask[], staff: number, cost: number): RoiResult {
  const weekH = tasks.reduce((s, t) => s + (t.min * t.perWeek) / 60 * (t.auto / 100), 0) * staff;
  const monthH = (weekH * WEEKS_PER_YEAR) / 12;
  const yearH = weekH * WEEKS_PER_YEAR;
  return { weekH, monthH, yearH, moneyMonth: monthH * cost, moneyYear: yearH * cost, days: yearH / WORKDAY_H };
}

export const fmtNum = (lang: Lang, v: number) => new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: v < 100 ? 1 : 0 }).format(v);
export const fmtMoney = (lang: Lang, cur: RoiCurrency, v: number) => new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(v);
export const fmtDate = (lang: Lang, d = new Date()) => new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'long' }).format(d);

export const UNITS: Record<Lang, { h: string; min: string; day: string }> = {
  tr: { h: 'sa', min: 'dk', day: 'iş günü' }, en: { h: 'h', min: 'min', day: 'working days' },
  de: { h: 'Std.', min: 'Min.', day: 'Arbeitstage' }, el: { h: 'ώρ.', min: 'λεπτά', day: 'εργάσιμες ημέρες' },
};

const SUMMARY: Record<Lang, (p: { sector: string; h: string; y: string; money: string; tasks: number }) => string> = {
  tr: (p) => `Hesaplama (${p.sector}, ${p.tasks} görev): yaklaşık ${p.h} saat/ay, yıllık ${p.y} tasarruf tahmini (${p.money}/ay). Bu rakamları birlikte değerlendirmek isterim.`,
  en: (p) => `Calculation (${p.sector}, ${p.tasks} tasks): about ${p.h} hours/month, an estimated ${p.y} saved per year (${p.money}/month). I would like to go through these numbers together.`,
  de: (p) => `Berechnung (${p.sector}, ${p.tasks} Aufgaben): rund ${p.h} Std./Monat, geschätzt ${p.y} Ersparnis pro Jahr (${p.money}/Monat). Ich möchte diese Zahlen gern mit Ihnen besprechen.`,
  el: (p) => `Υπολογισμός (${p.sector}, ${p.tasks} εργασίες): περίπου ${p.h} ώρες/μήνα, εκτιμώμενη εξοικονόμηση ${p.y} τον χρόνο (${p.money}/μήνα). Θα ήθελα να δούμε μαζί αυτά τα νούμερα.`,
};
/** One-line, language-pure summary of a stored calculation */
export function summaryLine(c: RoiCalc, lang: Lang): string {
  const r = calcRoi(c.tasks, c.staff, c.cost);
  return SUMMARY[lang]({ sector: c.sectorLabel, tasks: c.tasks.length, h: fmtNum(lang, r.monthH), y: fmtMoney(lang, c.currency, r.moneyYear), money: fmtMoney(lang, c.currency, r.moneyMonth) });
}

export function saveRoi(c: RoiCalc) { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* ignore */ } }
export function clearRoi() { try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ } }
export function readRoi(): RoiCalc | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (c?.v === 1 && Array.isArray(c.tasks) && c.tasks.length <= MAX_TASKS && SECTOR_KEYS.includes(c.sector)) return c as RoiCalc;
  } catch { /* ignore */ }
  return null;
}
