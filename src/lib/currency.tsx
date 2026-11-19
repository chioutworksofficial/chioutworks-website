import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../translations';

// Currency per market. Sample data in the demos is written in the market's own
// currency (MARKET_CURRENCY); the visitor can switch the display currency.

export type Currency = 'TRY' | 'EUR' | 'GBP' | 'USD';
export const CURRENCIES: Currency[] = ['TRY', 'EUR', 'GBP', 'USD'];

/** Currency the sample data is written in, and the default display currency per language */
export const MARKET_CURRENCY: Record<Lang, Currency> = { tr: 'TRY', de: 'EUR', el: 'EUR', en: 'GBP' };

const LOCALES: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', el: 'el-GR' };

/** Fallback rates (1 EUR = x). Used only if /api/rates cannot be reached. */
const FALLBACK_RATES: Record<Currency, number> = { EUR: 1, USD: 1.15, GBP: 0.87, TRY: 50 };
const CACHE_KEY = 'cw-fx-rates';

async function loadRates(): Promise<Record<Currency, number>> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (cached?.rates) return cached.rates;
  } catch { /* ignore */ }
  try {
    // Rates are fetched and cached server-side (/api/rates); the browser never contacts a third party
    const r = await fetch('/api/rates');
    const data = await r.json();
    const rates = { EUR: 1, USD: data.rates.USD, GBP: data.rates.GBP, TRY: data.rates.TRY } as Record<Currency, number>;
    if (Object.values(rates).every((n) => typeof n === 'number' && n > 0)) {
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rates })); } catch { /* ignore */ }
      return rates;
    }
  } catch { /* offline → fallback */ }
  return FALLBACK_RATES;
}

interface MoneyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert an amount written in the market currency and format it in the display currency */
  money: (amount: number) => string;
  /** Same as money() but in compact notation (12 Mio. €) — for very large values */
  moneyCompact: (amount: number) => string;
}

const Ctx = createContext<MoneyCtx | null>(null);

export function MoneyProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const base = MARKET_CURRENCY[lang];
  const [currency, setCurrency] = useState<Currency>(base);
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);

  useEffect(() => { setCurrency(MARKET_CURRENCY[lang]); }, [lang]);
  useEffect(() => { loadRates().then(setRates); }, []);

  const value = useMemo<MoneyCtx>(() => {
    const fmt = new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency, maximumFractionDigits: 0 });
    const cfmt = new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 });
    const conv = (amount: number) => (currency === base ? amount : (amount / rates[base]) * rates[currency]);
    return {
      currency,
      setCurrency,
      money: (amount: number) => fmt.format(conv(amount)),
      moneyCompact: (amount: number) => cfmt.format(conv(amount)),
    };
  }, [currency, base, rates, lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMoney(): MoneyCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useMoney must be used inside <MoneyProvider>');
  return c;
}

/** Drop-in replacement for formatMoney(n, lang) inside the demos */
export function useMoneyFormatter() {
  const { money } = useMoney();
  return (amount: number, _lang?: Lang) => money(amount);
}

const SYMBOL: Record<Currency, string> = { TRY: '₺', EUR: '€', GBP: '£', USD: '$' };

export function CurrencySwitch() {
  const { currency, setCurrency } = useMoney();
  return (
    <div className="flex rounded-full p-0.5" style={{ border: '1px solid var(--color-border-card)' }}>
      {CURRENCIES.map((c) => (
        <button key={c} type="button" onClick={() => setCurrency(c)} aria-pressed={c === currency} title={c}
          className="text-[11px] font-bold rounded-full px-2 py-1"
          style={c === currency ? { background: 'var(--color-ink-strongest)', color: 'var(--background)' } : { color: 'var(--color-ink-muted)' }}>
          {SYMBOL[c]} {c}
        </button>
      ))}
    </div>
  );
}
