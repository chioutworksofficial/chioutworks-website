// Abuse guard for the assistant (owner, 2026-11-19): salted hashes only (IP + browser id), never raw values.
// Escalation per person (browser id, or the same IP after clearing site data):
//   strike 1 → chat ends, a new chat is possible after a short pause (default 10 min)
//   strike 2 within 30 days → 24 h pause, firm warning
//   strike 3 within 30 days → this browser is closed permanently (until the owner unlocks it in the admin panel);
//                             the IP gets a 24 h pause on every further strike (IPs are shared, never closed for good)
// Paused/closed visitors are rejected before any model call (no tokens spent). Retention: strikes 30 days,
// permanent closures 12 months (storage limitation, GDPR Art. 5(1)(e)), message counters 48 h.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dbOn, dbInsert, dbSelect, dbDelete } from './db.js';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/abuse.json');
interface Ev { h: string[]; t: number; k: 'msg' }
interface Strike { h: string[]; t: number }
interface Pause { k: string; until: number }
interface Perm { k: string; t: number }
interface Store { salt: string; ev: Ev[]; strikes?: Strike[]; pauses?: Pause[]; perm?: Perm[] }
const HOUR = 3600_000, DAY = 24 * HOUR;
const num = (k: string, d: number) => { const n = Number(process.env[k]); return Number.isFinite(n) && n > 0 ? n : d; };
const FIRST_PAUSE_MIN = () => num('ABUSE_FIRST_PAUSE_MIN', 10);
export const TEXT_SESSION_MAX = () => num('ABUSE_TEXT_SESSION_MAX', 25);
const TEXT_IP_DAY = () => num('ABUSE_TEXT_IP_DAY_MAX', 60);

let st: Store | null = null;
function load(): Store {
  if (st) return st;
  try { st = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Store; } catch { st = { salt: process.env.ABUSE_SALT || crypto.randomBytes(16).toString('hex'), ev: [] }; }
  st.strikes ??= []; st.pauses ??= []; st.perm ??= [];
  return st;
}
function save() {
  const s = load(), now = Date.now();
  s.ev = s.ev.filter((e) => e.t > now - 48 * HOUR);
  s.strikes = s.strikes!.filter((e) => e.t > now - 30 * DAY);
  s.pauses = s.pauses!.filter((e) => e.until > now);
  s.perm = s.perm!.filter((e) => e.t > now - 365 * DAY);
  try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(s)); } catch { /* best effort */ }
}
// Salt: with Supabase the salt must come from ABUSE_SALT (the file does not exist on Vercel); without it, the file salt is used.
let saltWarned = false;
const salt = () => {
  if (dbOn()) {
    if (process.env.ABUSE_SALT) return process.env.ABUSE_SALT;
    if (!saltWarned) { saltWarned = true; console.warn('[abuse] ABUSE_SALT is not set: falling back to a local salt (hashes change on every restart). Set ABUSE_SALT.'); }
  }
  return load().salt;
};
const hash = (v: string) => crypto.createHash('sha256').update(salt() + '|' + v).digest('hex').slice(0, 24);
/** [ipHash, browserIdHash?] */
export const ids = (ip: string, bid?: unknown): string[] => {
  const b = typeof bid === 'string' && /^[\w-]{8,64}$/.test(bid) ? bid : '';
  return [hash('ip:' + ip), ...(b ? [hash('b:' + b)] : [])];
};

// ---- Supabase helpers (hashes are hex, safe in filters; never logged) ----
const iso = (ms: number) => new Date(ms).toISOString();
const ov = (h: string[]) => `ov.${encodeURIComponent(`{${h.join(',')}}`)}`;
const inList = (h: string[]) => `in.(${h.join(',')})`;
const ms = (v: string) => Date.parse(v);
/** Exact row count via PostgREST (HEAD-style, no rows transferred). */
async function dbCount(table: string, filter: string, col = 'id'): Promise<number> {
  const r = await fetch(`${(process.env.SUPABASE_URL ?? '').replace(/\/$/, '')}/rest/v1/${table}?select=${col}&${filter}`, {
    headers: { apikey: process.env.SUPABASE_SECRET_KEY ?? '', Prefer: 'count=exact', Range: '0-0', 'Range-Unit': 'items' },
  });
  if (!r.ok) throw new Error(`[db] count ${table} → ${r.status}`);
  return Number(r.headers.get('content-range')?.split('/')[1] ?? 0);
}
let lastPrune = 0;
async function prune() {
  const now = Date.now();
  if (now - lastPrune < HOUR) return;
  lastPrune = now;
  await Promise.all([
    dbDelete('abuse_msgs', `t=lt.${iso(now - 48 * HOUR)}`),
    dbDelete('abuse_strikes', `t=lt.${iso(now - 30 * DAY)}`),
    dbDelete('abuse_pauses', `until=lte.${iso(now)}`),
    dbDelete('abuse_perm', `t=lt.${iso(now - 365 * DAY)}`),
  ]);
}
/** Guard must not take the site down when the database hiccups: log (no identifiers) and use the fallback. */
async function guard<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (e) { console.warn('[abuse] database error:', String((e as Error).message).split('?')[0].slice(0, 80)); return fallback; }
}

const countMsg = (h: string[], span: number) => {
  const cut = Date.now() - span;
  return load().ev.filter((e) => e.k === 'msg' && e.t > cut && e.h.includes(h[0])).length;
};

export interface ChatState { blocked: boolean; permanent: boolean; until: number | null }
/** Is this visitor paused or closed? Checked before every model call. */
export async function chatState(h: string[]): Promise<ChatState> {
  const open: ChatState = { blocked: false, permanent: false, until: null };
  const now = Date.now();
  if (dbOn()) return guard(async () => {
    if (h[1] && (await dbSelect('abuse_perm', `select=k&k=eq.${h[1]}&t=gte.${iso(now - 365 * DAY)}`)).length) return { blocked: true, permanent: true, until: null };
    const rows = await dbSelect<{ until: string }>('abuse_pauses', `select=until&k=${inList(h)}&until=gt.${iso(now)}`);
    const until = Math.max(0, ...rows.map((p) => ms(p.until)));
    return until ? { blocked: true, permanent: false, until } : open;
  }, open);
  const s = load();
  if (h[1] && s.perm!.some((p) => p.k === h[1])) return { blocked: true, permanent: true, until: null };
  const until = Math.max(0, ...s.pauses!.filter((p) => h.includes(p.k) && p.until > now).map((p) => p.until));
  return until ? { blocked: true, permanent: false, until } : open;
}

/** Record one strike (a chat ended for abuse) and apply the next level. Returns the level reached (1, 2, 3). */
export async function recordStrike(h: string[]): Promise<{ level: 1 | 2 | 3; until: number | null }> {
  const now = Date.now();
  if (dbOn()) return guard(async () => {
    await dbInsert('abuse_strikes', { h, t: iso(now) });
    const mine = await dbSelect<{ h: string[] }>('abuse_strikes', `select=h&h=${ov(h)}&t=gte.${iso(now - 30 * DAY)}`);
    const n = mine.length;
    const pause = async (span: number, keys: string[]) => { await dbInsert('abuse_pauses', keys.map((k) => ({ k, until: iso(now + span) }))); return now + span; };
    let res: { level: 1 | 2 | 3; until: number | null };
    if (n <= 1) res = { level: 1, until: await pause(FIRST_PAUSE_MIN() * 60_000, h) };
    else if (n === 2) res = { level: 2, until: await pause(DAY, h) };
    else {
      const bids = [...new Set(mine.map((e) => e.h[1]).filter(Boolean))];
      if (bids.length) {
        const have = new Set((await dbSelect<{ k: string }>('abuse_perm', `select=k&k=${inList(bids)}`)).map((p) => p.k));
        const fresh = bids.filter((k) => !have.has(k));
        if (fresh.length) await dbInsert('abuse_perm', fresh.map((k) => ({ k, t: iso(now) })));
      }
      await pause(DAY, [h[0]]);
      res = { level: 3, until: null };
    }
    await prune().catch(() => {});
    return res;
  }, { level: 1, until: now + FIRST_PAUSE_MIN() * 60_000 });
  const s = load();
  s.strikes!.push({ h, t: now });
  const n = s.strikes!.filter((e) => e.t > now - 30 * DAY && e.h.some((x) => h.includes(x))).length;
  const pause = (span: number) => { for (const k of h) s.pauses!.push({ k, until: now + span }); return now + span; };
  let res: { level: 1 | 2 | 3; until: number | null };
  if (n <= 1) res = { level: 1, until: pause(FIRST_PAUSE_MIN() * 60_000) };
  else if (n === 2) res = { level: 2, until: pause(DAY) };
  else {
    // close every browser id seen in this person's strikes (also the ones used before clearing site data)
    const bids = new Set(s.strikes!.filter((e) => e.t > now - 30 * DAY && e.h.some((x) => h.includes(x))).map((e) => e.h[1]).filter(Boolean));
    for (const k of bids) if (!s.perm!.some((p) => p.k === k)) s.perm!.push({ k, t: now });
    s.pauses!.push({ k: h[0], until: now + DAY });
    res = { level: 3, until: null };
  }
  save();
  return res;
}
/** Voice: closed when the chat is closed/paused for this visitor. */
export const voiceBlocked = async (h: string[]) => (await chatState(h)).blocked;
/** Voice client reports abuse → counts as a strike. */
export const recordAbuse = async (h: string[]) => { await recordStrike(h); };

/** Count one text message; false when the per-IP daily cap is exceeded. */
export const textMsgAllowed = async (h: string[]) => {
  if (dbOn()) return guard(async () => {
    if (await dbCount('abuse_msgs', `h=${ov(h.slice(0, 1))}&t=gte.${iso(Date.now() - DAY)}`) >= TEXT_IP_DAY()) return false;
    await dbInsert('abuse_msgs', { h: h.slice(0, 1), t: iso(Date.now()) });
    await prune().catch(() => {});
    return true;
  }, true);
  if (countMsg(h, DAY) >= TEXT_IP_DAY()) return false;
  load().ev.push({ h: h.slice(0, 1), t: Date.now(), k: 'msg' }); save(); return true;
};

/** Speed limit (owner 2026-11-19): a person types at most a few messages a minute, a bot dozens. In memory. */
const PER_MIN = () => num('ABUSE_PER_MIN', 6), IP_PER_MIN = () => num('ABUSE_IP_PER_MIN', 15);
const recent = new Map<string, number[]>();
export const rateOk = (h: string[]) => {
  const now = Date.now(), keys: [string, number][] = [[h[0], IP_PER_MIN()], ...(h[1] ? [[h[1], PER_MIN()] as [string, number]] : [])];
  for (const [k, max] of keys) if ((recent.get(k) ?? []).filter((t) => now - t < 60_000).length >= max) return false;
  for (const [k] of keys) recent.set(k, (recent.get(k) ?? []).filter((t) => now - t < 60_000).concat(now));
  if (recent.size > 5000) for (const [k, v] of recent) if (!v.some((t) => now - t < 60_000)) recent.delete(k);
  return true;
};
/** Daily budget fuse for the whole site: once this many chat messages were answered in 24 h, the assistant
 *  pauses (no model calls) and points to the form. Protects the bill even against many IPs. */
export const globalOk = async () => {
  const max = num('ABUSE_GLOBAL_DAY_MAX', 2000);
  if (dbOn()) return guard(async () => (await dbCount('abuse_msgs', `t=gte.${iso(Date.now() - DAY)}`)) < max, true);
  return load().ev.filter((e) => e.k === 'msg' && e.t > Date.now() - DAY).length < max;
};

/** Owner testing: on a non-production server, this machine and the local network are never paused
 *  (set ABUSE_TEST=1 to test the guard locally). ABUSE_ALLOW_IPS = comma list of IPs that are never paused. */
export const abuseExempt = (ip: string) => {
  const ipv4 = ip.replace(/^::ffff:/, '');
  if ((process.env.ABUSE_ALLOW_IPS ?? '').split(',').map((x) => x.trim()).filter(Boolean).includes(ipv4)) return true;
  if (process.env.NODE_ENV === 'production' || process.env.ABUSE_TEST === '1') return false;
  return ipv4 === '::1' || ipv4 === 'anon' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ipv4);
};

/** Admin panel: closed and paused visitors (hashes only) and unlocking. */
export async function adminList() {
  const now = Date.now();
  if (dbOn()) return guard(async () => {
    const perm = await dbSelect<{ k: string; t: string }>('abuse_perm', `select=k,t&t=gte.${iso(now - 365 * DAY)}`);
    const paused = await dbSelect<{ k: string; until: string }>('abuse_pauses', `select=k,until&until=gt.${iso(now)}`);
    const strikes = perm.length ? await dbSelect<{ h: string[] }>('abuse_strikes', `select=h&h=${ov(perm.map((p) => p.k))}&t=gte.${iso(now - 30 * DAY)}`) : [];
    return {
      permanent: perm.map((p) => ({ k: p.k, t: ms(p.t), strikes: strikes.filter((e) => e.h.includes(p.k)).length })),
      paused: paused.map((p) => ({ k: p.k, until: ms(p.until) })),
    };
  }, { permanent: [], paused: [] });
  const s = load();
  return {
    permanent: s.perm!.map((p) => ({ k: p.k, t: p.t, strikes: s.strikes!.filter((e) => e.h.includes(p.k)).length })),
    paused: s.pauses!.filter((p) => p.until > now).map((p) => ({ k: p.k, until: p.until })),
  };
}
export async function adminUnlock(k: string): Promise<boolean> {
  if (dbOn()) return guard(async () => {
    const n = (await dbCount('abuse_perm', `k=eq.${k}`, 'k')) + (await dbCount('abuse_pauses', `k=eq.${k}`)) + (await dbCount('abuse_strikes', `h=${ov([k])}`));
    await Promise.all([dbDelete('abuse_perm', `k=eq.${k}`), dbDelete('abuse_pauses', `k=eq.${k}`), dbDelete('abuse_strikes', `h=${ov([k])}`)]);
    return n > 0;
  }, false);
  const s = load(), before = s.perm!.length + s.pauses!.length + s.strikes!.length;
  s.perm = s.perm!.filter((p) => p.k !== k);
  s.pauses = s.pauses!.filter((p) => p.k !== k);
  s.strikes = s.strikes!.filter((e) => !e.h.includes(k));
  save();
  return s.perm!.length + s.pauses!.length + s.strikes!.length < before;
}

/** Cheap safety net for the model's [[OFF]] flag: obvious insults in the visitor's last message. */
export const insult = (t: string) => /(?<![\p{L}])(aptal|salak|gerizekal\p{L}*|siktir|orospu|fuck\p{L}*|idiot|stupid|dumm\p{L}*|arschloch|scheiß\p{L}*|ηλίθι\p{L}*|μαλάκ\p{L}*|βλάκ\p{L}*|χαζ\p{L}*)(?![\p{L}])/iu.test(t);

type L4 = Record<'tr' | 'en' | 'de' | 'el', string>;
const pick = (m: L4, l: string) => m[l as keyof L4] ?? m.en;
const wait = (l: string, until: number) => {
  const min = Math.max(1, Math.ceil((until - Date.now()) / 60_000));
  if (min < 90) return pick({ tr: `${min} dakika`, en: `${min} minute${min > 1 ? 's' : ''}`, de: `${min} Minute${min > 1 ? 'n' : ''}`, el: `${min} λεπτ${min > 1 ? 'ά' : 'ό'}` }, l);
  const h = Math.ceil(min / 60);
  return pick({ tr: `${h} saat`, en: `${h} hours`, de: `${h} Stunden`, el: `${h} ώρες` }, l);
};
export const MSG = {
  /** 2nd flagged turn in one chat: clear warning */
  warn: (l: string) => pick({
    tr: 'Lütfen işletmenizle ilgili konuya dönelim. Böyle devam ederse sohbeti sonlandırmak zorunda kalacağım.',
    en: "Let's please get back to your business needs. If this continues, I will have to end the chat.",
    de: 'Bitte kehren wir zu Ihrem Anliegen zurück. Wenn es so weitergeht, muss ich den Chat beenden.',
    el: 'Ας επιστρέψουμε, παρακαλώ, στις ανάγκες της επιχείρησής σας. Αν συνεχιστεί έτσι, θα χρειαστεί να τερματίσω τη συνομιλία.',
  }, l),
  /** strike 1: chat ends, new chat after a short pause */
  end1: (l: string, until: number) => pick({
    tr: `Bu sohbeti burada sonlandırmak zorundayım. ${wait('tr', until)} sonra yeni bir sohbet başlatabilirsiniz.`,
    en: `I have to end this chat here. You can start a new chat in ${wait('en', until)}.`,
    de: `Ich muss diesen Chat hier beenden. In ${wait('de', until)} können Sie einen neuen Chat starten.`,
    el: `Πρέπει να τερματίσω εδώ τη συνομιλία. Μπορείτε να ξεκινήσετε νέα συνομιλία σε ${wait('el', until)}.`,
  }, l),
  /** strike 2: 24 h pause, firm warning */
  end2: (l: string) => pick({
    tr: 'Bu sohbeti de sonlandırmak zorundayım. Tekrarlanan kötüye kullanım tespit edildiği için sohbet 24 saat kapalı kalacak. Bir sonraki seferde bu cihaz için kalıcı olarak kapatılır.',
    en: 'I have to end this chat as well. Repeated misuse was detected, so the chat stays closed for 24 hours. Next time it will be closed permanently for this device.',
    de: 'Ich muss auch diesen Chat beenden. Wiederholter Missbrauch wurde erkannt, der Chat bleibt 24 Stunden geschlossen. Beim nächsten Mal wird er für dieses Gerät dauerhaft geschlossen.',
    el: 'Πρέπει να τερματίσω και αυτή τη συνομιλία. Εντοπίστηκε επαναλαμβανόμενη κατάχρηση, γι’ αυτό η συνομιλία μένει κλειστή για 24 ώρες. Την επόμενη φορά θα κλείσει οριστικά για αυτή τη συσκευή.',
  }, l),
  /** strike 3 / permanently closed */
  perm: (l: string) => pick({
    tr: 'Tekrarlanan kötüye kullanım nedeniyle sohbet bu cihaz için kalıcı olarak kapatıldı. Talebiniz varsa sayfadaki formu kullanabilirsiniz.',
    en: 'Because of repeated misuse, the chat has been closed permanently for this device. If you have a request, please use the form on the page.',
    de: 'Wegen wiederholten Missbrauchs wurde der Chat für dieses Gerät dauerhaft geschlossen. Für Anfragen nutzen Sie bitte das Formular auf der Seite.',
    el: 'Λόγω επαναλαμβανόμενης κατάχρησης, η συνομιλία έκλεισε οριστικά για αυτή τη συσκευή. Για αίτημα, χρησιμοποιήστε τη φόρμα στη σελίδα.',
  }, l),
  /** new chat attempt while paused */
  paused: (l: string, until: number) => pick({
    tr: `Yeni bir sohbet için biraz beklemeniz gerekiyor. Yaklaşık ${wait('tr', until)} sonra tekrar deneyebilirsiniz.`,
    en: `Please wait a little before starting a new chat. You can try again in about ${wait('en', until)}.`,
    de: `Bitte warten Sie etwas, bevor Sie einen neuen Chat starten. In etwa ${wait('de', until)} können Sie es erneut versuchen.`,
    el: `Περιμένετε λίγο πριν ξεκινήσετε νέα συνομιλία. Μπορείτε να δοκιμάσετε ξανά σε περίπου ${wait('el', until)}.`,
  }, l),
  /** speed limit hit */
  slow: (l: string) => pick({
    tr: 'Biraz yavaşlayalım; birkaç saniye sonra tekrar yazabilirsiniz.',
    en: "Let's slow down a little; you can write again in a few seconds.",
    de: 'Etwas langsamer bitte; in ein paar Sekunden können Sie wieder schreiben.',
    el: 'Ας πάμε λίγο πιο αργά· μπορείτε να γράψετε ξανά σε λίγα δευτερόλεπτα.',
  }, l),
  /** site-wide daily budget reached */
  busy: (l: string) => pick({
    tr: 'Şu an çok yoğunum ve yeni mesajlara cevap veremiyorum. Talebinizi sayfadaki formdan iletebilirsiniz; yazılı olarak dönüş yapılır.',
    en: 'I am very busy right now and cannot answer new messages. Please send your request through the form on the page; you will get a written reply.',
    de: 'Ich bin gerade sehr ausgelastet und kann keine neuen Nachrichten beantworten. Bitte senden Sie Ihre Anfrage über das Formular auf der Seite; Sie erhalten eine schriftliche Antwort.',
    el: 'Αυτή τη στιγμή έχω πολύ φόρτο και δεν μπορώ να απαντήσω σε νέα μηνύματα. Στείλτε το αίτημά σας μέσω της φόρμας στη σελίδα· θα λάβετε γραπτή απάντηση.',
  }, l),
  /** kept for older callers: generic end */
  bye: (l: string) => pick({
    tr: 'Sohbeti şimdilik burada bırakıyorum. Biraz sonra yeniden yazabilir ya da sayfadaki formu kullanabilirsiniz.',
    en: 'I will pause the chat here for now. You can write again a little later or use the form on the page.',
    de: 'Ich pausiere den Chat an dieser Stelle. Sie können etwas später wieder schreiben oder das Formular auf der Seite nutzen.',
    el: 'Σταματώ τη συνομιλία εδώ προς το παρόν. Μπορείτε να γράψετε ξανά λίγο αργότερα ή να χρησιμοποιήσετε τη φόρμα στη σελίδα.',
  }, l),
  redirect: (l: string) => pick({
    tr: 'Yalnızca işletmeniz için web, otomasyon ve yapay zeka çözümleri konusunda yardımcı olabilirim. Bu alanda neye ihtiyacınız var?',
    en: 'I can only help with web, automation and AI solutions for your business. What do you need in that area?',
    de: 'Ich kann nur bei Web-, Automatisierungs- und KI-Lösungen für Ihr Unternehmen helfen. Was benötigen Sie in diesem Bereich?',
    el: 'Μπορώ να βοηθήσω μόνο με λύσεις web, αυτοματισμού και τεχνητής νοημοσύνης για την επιχείρησή σας. Τι χρειάζεστε σε αυτόν τον τομέα;',
  }, l),
  limit: (l: string) => pick({
    tr: 'Bu sohbet için mesaj sınırına ulaşıldı. Devam etmek için lütfen sayfadaki formu kullanabilirsiniz.',
    en: 'This chat has reached its message limit. Please use the form on the page to continue.',
    de: 'Für diesen Chat ist das Nachrichtenlimit erreicht. Bitte nutzen Sie zum Fortfahren das Formular auf der Seite.',
    el: 'Η συνομιλία έφτασε το όριο μηνυμάτων. Παρακαλούμε χρησιμοποιήστε τη φόρμα στη σελίδα για να συνεχίσετε.',
  }, l),
  voice: (l: string) => pick({
    tr: 'Sesli asistan şu an kullanılamıyor; yazarak veya form üzerinden ulaşabilirsiniz.',
    en: 'The voice assistant is currently unavailable; you can reach the studio by typing or through the form.',
    de: 'Der Sprachassistent ist derzeit nicht verfügbar; Sie erreichen das Studio schriftlich oder über das Formular.',
    el: 'Ο φωνητικός βοηθός δεν είναι διαθέσιμος αυτή τη στιγμή· μπορείτε να επικοινωνήσετε γράφοντας ή μέσω της φόρμας.',
  }, l),
};
/** Message for a visitor who is paused or closed right now. */
export const blockedMsg = (l: string, c: ChatState) => (c.permanent ? MSG.perm(l) : MSG.paused(l, c.until ?? Date.now()));
