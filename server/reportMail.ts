// Site-analysis report by e-mail + "Shall I call you?" answer page. Security: context/GUVENLIK.md.
// Mail goes ONLY to a person who asked for the analysis (lead tag opt_in = confirmed double opt-in of the free site check); cold leads
// (admin-entered domains) can only get the PDF as a download. Answer links are HMAC-signed, expire after 14 days and are single use.
// Consent proof (time, hashed IP, user agent, wording version) is written to the consents table (local fallback data/consents.json).
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { dbOn, dbInsert, kvGet, kvSet } from './db.js';
import { rlStore } from './rateStore.js';
import { botGate } from './botcheck.js';
import { validate as v, s as str, bool } from './validate.js';
import { sendMail, shell, button, esc, originOf, mailOn, type L } from './mail.js';
import { addCalendarEntry } from './calendar.js';
import { nlSuppress } from './newsletter.js';
import { buildReportPdf, problemsOf, leadLang, rlOf } from './reportPdf.js';
import type { Scan } from './siteScan.js';

type Row = { id: string; createdAt: string; [k: string]: any };
export interface ReportDeps {
  admin: (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) => unknown;
  find: (id: string) => Promise<Row | undefined>;
  put: (rec: Row) => Promise<unknown>;
  limit: ReturnType<typeof rateLimit>;
  rateSkip?: () => boolean;
}
const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data');
const SENDS_FILE = path.join(DATA, 'report-sends.json');
const CONSENT_FILE = path.join(DATA, 'consents.json');
const KEY = 'sales.reportSends';
export const CONSENT_V = 'report-callback-2026-11a';
const DAY = 864e5;
const salt = () => process.env.ABUSE_SALT || 'chioutworks-form-v1';
const hmac = (t: string) => crypto.createHmac('sha256', salt()).update(t).digest('base64url');
const ipHash = (req: Request) => hmac(`ip|${req.ip ?? ''}`).slice(0, 32);
const ua = (req: Request) => String(req.get('user-agent') ?? '').slice(0, 200);
const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };

// ── send records (kv when Supabase is on, else local file) ──
interface Send { id: string; leadId: string; lang: L; createdAt: string; exp: number; status: 'sent' | 'answered'; answer?: 'yes' | 'no'; answeredAt?: string }
const loadSends = async (): Promise<Send[]> => { if (dbOn()) return (await kvGet<Send[]>(KEY)) ?? []; try { return JSON.parse(fs.readFileSync(SENDS_FILE, 'utf8')); } catch { return []; } };
const saveSends = async (l: Send[]) => {
  const keep = l.slice(-500);
  if (dbOn()) return kvSet(KEY, keep);
  fs.mkdirSync(DATA, { recursive: true }); const tmp = `${SENDS_FILE}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(keep, null, 2)); fs.renameSync(tmp, SENDS_FILE);
};
let chain: Promise<unknown> = Promise.resolve();   // serialises read-modify-write inside one instance
const withSends = <T,>(fn: (l: Send[]) => Promise<T> | T): Promise<T> => { const r = chain.then(async () => { const l = await loadSends(); const out = await fn(l); await saveSends(l); return out; }); chain = r.catch(() => undefined); return r; };

// ── tokens: id.exp.sig (answer, 14 days) and u.id.sig (unsubscribe, no expiry) ──
const answerTok = (s: Send) => { const e = s.exp.toString(36); return `${s.id}.${e}.${hmac(`rp|${s.id}|${e}`).slice(0, 24)}`; };
const unsubTok = (id: string) => `${id}.${hmac(`rp-unsub|${id}`).slice(0, 24)}`;
export function parseAnswerTok(t: string): { id: string; exp: number } | null {
  const [id, e, sig] = String(t).split('.'); if (!id || !e || !sig || !/^[A-Za-z0-9_-]{1,64}$/.test(id) || !/^[a-z0-9]{1,12}$/.test(e)) return null;
  return eq(sig, hmac(`rp|${id}|${e}`).slice(0, 24)) ? { id, exp: parseInt(e, 36) } : null;
}
const parseUnsub = (t: string) => { const i = String(t).lastIndexOf('.'); if (i < 1) return null; const id = t.slice(0, i); return /^[A-Za-z0-9_-]{1,64}$/.test(id) && eq(t.slice(i + 1), hmac(`rp-unsub|${id}`).slice(0, 24)) ? id : null; };

/** Mail only when the site owner asked for the analysis (double opt-in tag) and has not opted out. */
export const canMail = (l: Row) => Boolean(l.email) && Array.isArray(l.tags) && l.tags.includes('opt_in') && !l.reportStop;
export const COLD_MSG = 'Bu kişi analiz istemedi; yalnızca PDF indirebilirsiniz (soğuk e-posta yok).';

// ── mail texts ──
const M: Record<L, { subject: (d: string) => string; hi: string; intro: string; found: string; pdf: string; cta: string; ctaText: string; yes: string; no: string; note: string; reason: string; unsub: string; disc: string; opted: string }> = {
  tr: { subject: (d) => `Web siteniz için kısa not: ${d}`, hi: 'Merhaba,', intro: 'İstediğiniz ücretsiz web sitesi kontrolünü tamamladım. Tüm sonuçlar ekteki PDF raporda; en önemli bulgular şunlar:', found: 'Öne çıkanlar', pdf: 'Raporun tamamı ekte (PDF).', cta: 'Sizi arayayım mı?', ctaText: 'İsterseniz bu bulguları telefonda kısaca konuşabilirim; yazılı yanıt da yeterliyse onu seçin. Aşağıdaki iki düğmeden birine basmanız yeterli.', yes: 'Evet, arayın', no: 'Hayır, e-posta yeterli', note: 'Siz seçmeden hiçbir şey olmaz; telefon numaranızı yalnızca siz yazarsanız saklarım.', reason: 'Bu e-postayı, ücretsiz web sitesi kontrolü istediğiniz için alıyorsunuz.', unsub: 'Bu e-postaları artık almak istemiyorum', disc: 'Herkese açık sayfalarınızın otomatik analizidir. Bir tahmindir, garanti değildir.', opted: '' },
  en: { subject: (d) => `A short note about your website: ${d}`, hi: 'Hello,', intro: 'I have finished the free website check you asked for. All results are in the attached PDF report; the most important findings are:', found: 'Highlights', pdf: 'The full report is attached (PDF).', cta: 'Shall I call you?', ctaText: 'If you like, I can talk through these findings with you briefly by phone; if a written answer is enough, choose that instead. One click on either button is all it takes.', yes: 'Yes, please call', no: 'No, e-mail is enough', note: 'Nothing happens until you choose; I only keep your phone number if you type it in yourself.', reason: 'You receive this e-mail because you asked for the free website check.', unsub: 'I no longer want to receive these e-mails', disc: 'Automated analysis of your public pages. It is an estimate, not a guarantee.', opted: '' },
  de: { subject: (d) => `Eine kurze Notiz zu Ihrer Website: ${d}`, hi: 'Guten Tag,', intro: 'Ich habe den von Ihnen angeforderten kostenlosen Website-Check abgeschlossen. Alle Ergebnisse stehen im angehängten PDF-Bericht; die wichtigsten Befunde sind:', found: 'Das Wichtigste', pdf: 'Der vollständige Bericht ist angehängt (PDF).', cta: 'Soll ich Sie anrufen?', ctaText: 'Wenn Sie möchten, bespreche ich die Befunde kurz telefonisch mit Ihnen; genügt Ihnen eine schriftliche Antwort, wählen Sie das. Ein Klick auf einen der beiden Buttons genügt.', yes: 'Ja, bitte anrufen', no: 'Nein, E-Mail genügt', note: 'Ohne Ihre Auswahl passiert nichts; Ihre Telefonnummer speichere ich nur, wenn Sie sie selbst eintragen.', reason: 'Sie erhalten diese E-Mail, weil Sie den kostenlosen Website-Check angefordert haben.', unsub: 'Ich möchte diese E-Mails nicht mehr erhalten', disc: 'Automatisierte Analyse Ihrer öffentlichen Seiten. Es ist eine Einschätzung, keine Garantie.', opted: '' },
  el: { subject: (d) => `Μια σύντομη σημείωση για την ιστοσελίδα σας: ${d}`, hi: 'Γεια σας,', intro: 'Ολοκλήρωσα τον δωρεάν έλεγχο ιστοσελίδας που ζητήσατε. Όλα τα αποτελέσματα βρίσκονται στο συνημμένο PDF· τα σημαντικότερα ευρήματα είναι:', found: 'Τα βασικότερα', pdf: 'Η πλήρης αναφορά επισυνάπτεται (PDF).', cta: 'Να σας καλέσω;', ctaText: 'Αν θέλετε, μπορώ να συζητήσω σύντομα τα ευρήματα τηλεφωνικά· αν σας αρκεί γραπτή απάντηση, επιλέξτε αυτήν. Αρκεί ένα κλικ σε ένα από τα δύο κουμπιά.', yes: 'Ναι, καλέστε με', no: 'Όχι, αρκεί το e-mail', note: 'Τίποτα δεν γίνεται πριν επιλέξετε· κρατώ τον αριθμό τηλεφώνου σας μόνο αν τον γράψετε εσείς.', reason: 'Λαμβάνετε αυτό το e-mail επειδή ζητήσατε τον δωρεάν έλεγχο ιστοσελίδας.', unsub: 'Δεν θέλω να λαμβάνω πλέον αυτά τα e-mail', disc: 'Αυτοματοποιημένη ανάλυση των δημόσιων σελίδων σας. Είναι εκτίμηση, όχι εγγύηση.', opted: '' },
};
const answerUrl = (origin: string, lang: L, tok: string, a: 'yes' | 'no') => `${origin}/${lang}/rapor/onay?t=${encodeURIComponent(tok)}&a=${a}`;

/** Build and send the report mail. Returns false when Resend refused (e.g. domain not verified). Never logs personal data. */
async function sendReportMail(lead: Row, lang: L, origin: string): Promise<{ ok: boolean; send: Send }> {
  const m = M[lang]; const scan = lead.scan as Scan;
  const send: Send = { id: `rp_${crypto.randomBytes(9).toString('base64url')}`, leadId: lead.id, lang, createdAt: new Date().toISOString(), exp: Date.now() + 14 * DAY, status: 'sent' };
  const tok = answerTok(send); const un = `${origin}/api/report/unsubscribe?t=${encodeURIComponent(unsubTok(lead.id))}&l=${lang}`;
  const pr = problemsOf(scan, lang, 3);
  const pdf = await buildReportPdf({ domain: lead.domain, url: lead.url, company: lead.analysis?.company, scan }, lang, { contactUrl: `${origin}/${lang}/contact` });
  const list = pr.length ? `<h2 style="font-size:17px;color:#0b2a5b;margin:18px 0 6px">${esc(m.found)}</h2><ul style="padding-left:18px;margin:0">${pr.map((p) => `<li style="margin:0 0 8px"><b>${esc(p.problem)}</b> ${esc(p.cost)}</li>`).join('')}</ul>` : '';
  const html = shell(lang, m.subject(lead.domain), `<p>${esc(m.hi)}</p><p>${esc(m.intro)}</p>${list}<p>${esc(m.pdf)}</p><h2 style="font-size:19px;color:#0b2a5b;margin:24px 0 4px">${esc(m.cta)}</h2><p>${esc(m.ctaText)}</p>${button(answerUrl(origin, lang, tok, 'yes'), m.yes)}${button(answerUrl(origin, lang, tok, 'no'), m.no)}<p style="font-size:13px;color:#5a6a85">${esc(m.note)}</p><p style="font-size:13px;color:#5a6a85">${esc(m.disc)}</p>`, `${esc(m.reason)} <a href="${esc(un)}" style="color:#5a6a85">${esc(m.unsub)}</a>`);
  const text = [m.hi, '', m.intro, '', ...pr.map((p) => `- ${p.problem} ${p.cost}`), '', m.pdf, '', m.cta, m.ctaText, `${m.yes}: ${answerUrl(origin, lang, tok, 'yes')}`, `${m.no}: ${answerUrl(origin, lang, tok, 'no')}`, '', m.note, m.disc, '', `${m.reason} ${m.unsub}: ${un}`].join('\n');
  const ok = await sendMail({ to: lead.email, subject: m.subject(lead.domain), html, text, headers: { 'List-Unsubscribe': `<${un}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }, attachments: [{ filename: `${lead.domain.replace(/[^a-z0-9.-]/gi, '_')}-report-${lang}.pdf`, content: Buffer.from(pdf).toString('base64') }] });
  return { ok, send };
}

// ── consent proof ──
async function proofSave(id: string, data: Record<string, unknown>) {
  const rec = { id, ...data };
  if (dbOn()) return dbInsert('consents', { consent_id: id, at: data.confirmedAt, data: rec });
  let all: any[] = []; try { all = JSON.parse(fs.readFileSync(CONSENT_FILE, 'utf8')); } catch { all = []; }
  all.push(rec); fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(CONSENT_FILE, JSON.stringify(all.slice(-20000), null, 2));
}

const WHEN = ['morning', 'afternoon', 'evening', 'any'] as const;
const ANSWER = z.object({ t: z.string().max(200), answer: z.enum(['yes', 'no']), phone: str(40), when: str(12), consent: bool, ft: str(500), website: str(2000) });
const OUT: Record<L, [string, string]> = {
  tr: ['Abonelikten çıktınız', 'Size başka rapor e-postası gönderilmeyecek.'], en: ['You have unsubscribed', 'You will not receive further report e-mails.'],
  de: ['Sie haben sich abgemeldet', 'Sie erhalten keine weiteren Bericht-E-Mails.'], el: ['Διαγραφήκατε', 'Δεν θα λάβετε άλλα e-mail αναφοράς.'],
};

export function registerReportMail(app: Express, d: ReportDeps) {
  const A = '/api/admin/sales/leads/:id';
  const ipLimit = rateLimit({ store: rlStore('reportAnswerIp'), windowMs: 3600_000, max: 12, skip: d.rateSkip, standardHeaders: true, legacyHeaders: false, message: { ok: false, error: 'rate_limited' } });
  const readLimit = rateLimit({ store: rlStore('reportInfoIp'), windowMs: 600_000, max: 40, skip: d.rateSkip, standardHeaders: true, legacyHeaders: false, message: { ok: false, error: 'rate_limited' } });
  const noStore = (res: Response) => { res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' }); };

  // admin: PDF download (works for every lead with a deep scan; also cold leads)
  app.get(`${A}/report.pdf`, d.admin(async (req, res) => {
    const l = await d.find(req.params.id); if (!l?.scan) return res.status(404).json({ error: 'not_found', message: 'Bu kayıtta ayrıntılı analiz yok; önce yeniden analiz edin.' });
    const lang = rlOf(req.query.lang, leadLang(l.scan, l.analysis?.country));
    const pdf = await buildReportPdf({ domain: l.domain, url: l.url, company: l.analysis?.company, scan: l.scan }, lang, { contactUrl: `${originOf(req)}/${lang}/contact` });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${String(l.domain).replace(/[^a-z0-9.-]/gi, '_')}-report-${lang}.pdf"`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    return res.send(Buffer.from(pdf));
  }));

  // admin: send by e-mail (only when the contact asked for the analysis)
  app.post(`${A}/send-report`, d.limit, d.admin(async (req, res) => {
    const b = z.object({ lang: z.enum(['tr', 'en', 'de', 'el']).optional() }).safeParse(req.body ?? {});
    const l = await d.find(req.params.id); if (!l || !b.success) return res.status(404).json({ error: 'not_found' });
    if (!canMail(l)) return res.status(403).json({ error: 'not_requested', message: l.reportStop ? 'Bu kişi bu e-postaları artık almak istemiyor.' : COLD_MSG });
    if (!l.scan) return res.status(400).json({ error: 'invalid', message: 'Önce ayrıntılı analiz gerekli.' });
    if (!mailOn()) return res.json({ ok: false, mail: false, message: 'Mail alan adı doğrulanınca gider.' });
    if ((l.reportSends ?? []).filter((x: any) => Date.now() - Date.parse(x.at) < DAY).length >= 3) return res.status(429).json({ error: 'rate_limited', message: 'Bu kişiye 24 saatte en fazla 3 rapor gönderilir.' });
    const lang = b.data.lang ?? rlOf(l.reportLang, leadLang(l.scan, l.analysis?.country));
    const { ok, send } = await sendReportMail(l, lang, originOf(req));
    if (!ok) return res.json({ ok: false, mail: true, message: 'E-posta gönderilemedi (alan adı doğrulanmadı veya gönderim ayarı yok).' });
    await withSends((all) => { all.push(send); });
    l.reportSends = [...(l.reportSends ?? []), { id: send.id, at: send.createdAt, lang }].slice(-10);
    l.notes = [...(l.notes ?? []), { at: send.createdAt, text: `Rapor e-postayla gönderildi (${lang.toUpperCase()}).` }].slice(-200);
    await d.put(l); return res.json({ ok: true, mail: true, message: 'Rapor e-postayla gönderildi.' });
  }));

  // public: link state (valid / used / expired / invalid); expired is revealed only for a correctly signed token
  app.get('/api/report/answer', readLimit, async (req, res) => {
    noStore(res);
    const p = parseAnswerTok(String(req.query.t ?? '')); if (!p) return res.json({ state: 'invalid' });
    const s = (await loadSends()).find((x) => x.id === p.id); if (!s) return res.json({ state: 'invalid' });
    if (s.status === 'answered') return res.json({ state: 'used', lang: s.lang });
    if (p.exp < Date.now() || s.exp < Date.now()) return res.json({ state: 'expired', lang: s.lang });
    return res.json({ state: 'open', lang: s.lang });
  });

  // public: the answer (single use). Form token + honeypot + rate limit like the other public forms.
  app.post('/api/report/answer', ipLimit, botGate, v(ANSWER), async (req, res) => {
    noStore(res);
    try {
      const b = req.body as z.infer<typeof ANSWER>; const p = parseAnswerTok(b.t);
      if (!p) return res.status(400).json({ ok: false, error: 'invalid' });
      let phone = '';
      if (b.answer === 'yes') {
        phone = String(b.phone ?? '').replace(/[^\d+()\s./-]/g, '').trim().slice(0, 30);
        const digits = phone.replace(/\D/g, '');
        if (b.consent !== true) return res.status(400).json({ ok: false, error: 'consent' });
        if (digits.length < 7 || digits.length > 15) return res.status(400).json({ ok: false, error: 'phone' });
      }
      const when = (WHEN as readonly string[]).includes(String(b.when)) ? String(b.when) : 'any';
      // claim the link atomically (inside the serialised section): a second click or a replay finds it used
      const claim = await withSends((all) => {
        const s = all.find((x) => x.id === p.id); if (!s) return 'invalid' as const;
        if (s.status === 'answered') return 'used' as const;
        if (p.exp < Date.now() || s.exp < Date.now()) return 'expired' as const;
        s.status = 'answered'; s.answer = b.answer; s.answeredAt = new Date().toISOString(); return { ...s };
      });
      if (typeof claim === 'string') return res.status(claim === 'invalid' ? 400 : 410).json({ ok: false, error: claim });
      const l = await d.find(claim.leadId);
      if (l) {
        const at = claim.answeredAt!; const yes = b.answer === 'yes';
        const consentId = crypto.randomUUID();
        if (yes) await proofSave(consentId, { kind: 'report-callback', recordId: claim.id, leadId: l.id, lang: claim.lang, version: CONSENT_V, submittedAt: at, confirmedAt: at, ipHashConfirm: ipHash(req), uaConfirm: ua(req), boxes: { callConsent: true }, preferredTime: when });
        const tags = new Set<string>(l.tags ?? []); tags.add(yes ? 'call_ok' : 'written_ok'); l.tags = [...tags];
        l.preferredChannel = yes ? 'phone' : 'email'; l.leadScore = yes ? 'sıcak' : 'kararsız'; l.reportAnswer = { at, answer: b.answer, when: yes ? when : undefined, consentId: yes ? consentId : undefined };
        if (yes) { l.phone = phone; l.status = 'to_call'; }
        l.notes = [...(l.notes ?? []), { at, text: yes ? `Rapor sonrası: arayın dedi (zaman: ${when}). Aranabilir izni kayıtlı.` : 'Rapor sonrası: e-posta yeterli; yazılı çözüm listesi bekliyor.' }].slice(-200);
        await d.put(l);
        await addCalendarEntry({ kind: yes ? 'call' : 'send', source: 'report', email: l.email, phone: yes ? phone : undefined, refTab: 'requests', refId: l.id, preferredChannel: yes ? 'phone' : 'email', score: yes ? 'sıcak' : 'kararsız' });
      }
      return res.json({ ok: true });
    } catch { console.error('[report] answer failed'); return res.status(500).json({ ok: false, error: 'server' }); }
  });

  // public: unsubscribe (link in every report mail; GET and RFC 8058 one-click POST). Idempotent; page shown either way.
  const unsub = async (req: Request, res: Response) => {
    noStore(res);
    const lang = rlOf(req.query.l ?? req.body?.l, 'en') as L; const id = parseUnsub(String(req.query.t ?? req.body?.t ?? ''));
    try {
      const l = id ? await d.find(id) : undefined;
      if (l) { l.reportStop = true; l.tags = (l.tags ?? []).filter((t: string) => t !== 'marketing_ok'); await d.put(l); if (l.email) await nlSuppress(l.email, lang); }
    } catch { /* idempotent: page is shown anyway */ }
    const [t, b] = OUT[lang];
    return res.type('html').send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t)}</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1530;color:#eaf0ff;font:16px/1.6 system-ui,sans-serif"><div style="max-width:420px;padding:24px;text-align:center"><h1 style="font-size:22px">${esc(t)}</h1><p>${esc(b)}</p></div></body></html>`);
  };
  app.get('/api/report/unsubscribe', readLimit, unsub);
  app.post('/api/report/unsubscribe', readLimit, unsub);
}
