// Voice Agent calling rules (owner rules): business hours per country in LOCAL time, public holidays, daily maximum,
// minimum gap, one attempt per lead, callback slots. Pure functions: storage and enforcement live in voiceAgent.ts.
// Holiday lists are static (2026-2027); Turkish religious holidays are astronomical estimates (verify with the Diyanet calendar).
export type Country = 'DE' | 'TR' | 'GR';
export interface Hours { days: number[]; start: string; end: string }
export interface Planning { hours: Record<Country, Hours>; holidays: boolean; dailyMax: number; minGapMin: number; maxAttempts: number; callbackSlots: string[] }

const H: Hours = { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' };
export const DEF_PLANNING: Planning = { hours: { DE: { ...H }, TR: { ...H }, GR: { ...H } }, holidays: true, dailyMax: 20, minGapMin: 10, maxAttempts: 1, callbackSlots: ['10:00', '14:00', '16:00'] };
export const TZS: Record<Country, string> = { DE: 'Europe/Berlin', TR: 'Europe/Istanbul', GR: 'Europe/Athens' };
export const COUNTRY_TR: Record<Country, string> = { DE: 'Almanya', TR: 'Türkiye', GR: 'Yunanistan' };

export const HOLIDAYS: Record<Country, Record<string, string>> = {
  DE: {
    '2026-01-01': 'Yılbaşı', '2026-04-03': 'Karfreitag (Kutsal Cuma)', '2026-04-06': 'Ostermontag (Paskalya Pazartesisi)', '2026-05-01': 'Emek ve Dayanışma Günü', '2026-05-14': 'Christi Himmelfahrt',
    '2026-05-25': 'Pfingstmontag', '2026-10-03': 'Alman Birlik Günü', '2026-12-25': 'Noel', '2026-12-26': 'Noel (2. gün)',
    '2027-01-01': 'Yılbaşı', '2027-03-26': 'Karfreitag (Kutsal Cuma)', '2027-03-29': 'Ostermontag (Paskalya Pazartesisi)', '2027-05-01': 'Emek ve Dayanışma Günü', '2027-05-06': 'Christi Himmelfahrt',
    '2027-05-17': 'Pfingstmontag', '2027-10-03': 'Alman Birlik Günü', '2027-12-25': 'Noel', '2027-12-26': 'Noel (2. gün)',
  },
  TR: {
    '2026-01-01': 'Yılbaşı', '2026-03-19': 'Ramazan Bayramı arifesi', '2026-03-20': 'Ramazan Bayramı 1. gün', '2026-03-21': 'Ramazan Bayramı 2. gün', '2026-03-22': 'Ramazan Bayramı 3. gün', '2026-04-23': 'Ulusal Egemenlik ve Çocuk Bayramı',
    '2026-05-01': 'Emek ve Dayanışma Günü', '2026-05-19': 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', '2026-05-26': 'Kurban Bayramı arifesi', '2026-05-27': 'Kurban Bayramı 1. gün', '2026-05-28': 'Kurban Bayramı 2. gün',
    '2026-05-29': 'Kurban Bayramı 3. gün', '2026-05-30': 'Kurban Bayramı 4. gün', '2026-07-15': 'Demokrasi ve Milli Birlik Günü', '2026-08-30': 'Zafer Bayramı', '2026-10-28': 'Cumhuriyet Bayramı arifesi', '2026-10-29': 'Cumhuriyet Bayramı',
    '2027-01-01': 'Yılbaşı', '2027-03-08': 'Ramazan Bayramı arifesi', '2027-03-09': 'Ramazan Bayramı 1. gün', '2027-03-10': 'Ramazan Bayramı 2. gün', '2027-03-11': 'Ramazan Bayramı 3. gün', '2027-04-23': 'Ulusal Egemenlik ve Çocuk Bayramı',
    '2027-05-01': 'Emek ve Dayanışma Günü', '2027-05-15': 'Kurban Bayramı arifesi', '2027-05-16': 'Kurban Bayramı 1. gün', '2027-05-17': 'Kurban Bayramı 2. gün', '2027-05-18': 'Kurban Bayramı 3. gün', '2027-05-19': 'Kurban Bayramı 4. gün / Gençlik ve Spor Bayramı',
    '2027-07-15': 'Demokrasi ve Milli Birlik Günü', '2027-08-30': 'Zafer Bayramı', '2027-10-28': 'Cumhuriyet Bayramı arifesi', '2027-10-29': 'Cumhuriyet Bayramı',
  },
  GR: {
    '2026-01-01': 'Yılbaşı', '2026-01-06': 'Epiphania (Theofania)', '2026-02-23': 'Kathara Deftera (Temiz Pazartesi)', '2026-03-25': 'Bağımsızlık Günü', '2026-04-10': 'Megali Paraskevi (Kutsal Cuma)', '2026-04-11': 'Megalo Savvato (Kutsal Cumartesi)',
    '2026-04-12': 'Ortodoks Paskalya', '2026-04-13': 'Paskalya Pazartesisi', '2026-05-01': 'Emek Günü', '2026-06-01': 'Agiou Pnevmatos (Pentikost Pazartesisi)', '2026-08-15': 'Meryem Ana\'nın Göğe Alınışı', '2026-10-28': 'Ochi Günü', '2026-12-25': 'Noel', '2026-12-26': 'Noel (2. gün)',
    '2027-01-01': 'Yılbaşı', '2027-01-06': 'Epiphania (Theofania)', '2027-03-15': 'Kathara Deftera (Temiz Pazartesi)', '2027-03-25': 'Bağımsızlık Günü', '2027-04-30': 'Megali Paraskevi (Kutsal Cuma)', '2027-05-01': 'Emek Günü',
    '2027-05-02': 'Ortodoks Paskalya', '2027-05-03': 'Paskalya Pazartesisi', '2027-06-21': 'Agiou Pnevmatos (Pentikost Pazartesisi)', '2027-08-15': 'Meryem Ana\'nın Göğe Alınışı', '2027-10-28': 'Ochi Günü', '2027-12-25': 'Noel', '2027-12-26': 'Noel (2. gün)',
  },
};

/** Country from the phone's international prefix; null when it cannot be told (national format). */
export const countryOf = (phone: string): Country | null => {
  const d = String(phone ?? '').trim().replace(/[^\d+]/g, '').replace(/^00/, '+');
  return d.startsWith('+49') ? 'DE' : d.startsWith('+90') ? 'TR' : d.startsWith('+30') ? 'GR' : null;
};

const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
export const localParts = (ms: number, tz: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, dow: DOW[p.weekday] ?? 0 };
};
const offMin = (ms: number, tz: string) => {
  const v = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date(ms)).find((x) => x.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-])(\d{2}):?(\d{2})?/.exec(v); return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
};
export const zonedToUtc = (ymd: string, hm: string, tz: string) => {
  const [y, mo, d] = ymd.split('-').map(Number); const [h, mi] = hm.split(':').map(Number);
  const naive = Date.UTC(y, mo - 1, d, h, mi); let t = naive - offMin(naive, tz) * 60000; t = naive - offMin(t, tz) * 60000; return t;
};
const hm = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
const WD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const dayList = (d: number[]) => [1, 2, 3, 4, 5, 6, 0].filter((x) => d.includes(x)).map((x) => WD[x]).join(', ');

export const holidayOn = (c: Country, ymd: string, p: Planning) => (p.holidays ? HOLIDAYS[c][ymd] ?? null : null);

/** Reason (Turkish) why a call must not start at `ms` in country `c`, or null when allowed. */
export function hoursProblem(c: Country, ms: number, p: Planning): string | null {
  const l = localParts(ms, TZS[c]); const h = p.hours[c]; const name = COUNTRY_TR[c];
  const hol = holidayOn(c, l.date, p); if (hol) return `Resmî tatil (${name}): ${hol}.`;
  if (!h.days.includes(l.dow)) return `Arama günü dışında (${name}: yalnızca ${dayList(h.days)}).`;
  if (hm(l.time) < hm(h.start) || hm(l.time) >= hm(h.end)) return `Mesai saati dışında (${name} yerel saati ${l.time}; izinli ${h.start}-${h.end}).`;
  return null;
}

/** Next allowed moment (UTC ISO) from `from`: callback slots first, else business-hours start; looks 21 days ahead. */
export function nextSlot(c: Country, from: number, p: Planning): string | null {
  const tz = TZS[c]; const slots = (p.callbackSlots.length ? [...p.callbackSlots] : [p.hours[c].start]).sort();
  for (let i = 0; i < 22; i++) {
    const day = localParts(from + i * 864e5, tz).date;
    for (const s of slots) { const t = zonedToUtc(day, s, tz); if (t > from + 300_000 && !hoursProblem(c, t, p)) return new Date(t).toISOString(); }
  }
  return null;
}
