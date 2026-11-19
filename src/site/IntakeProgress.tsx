import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '../translations';
import type { Definition, QDef } from '../data/intakeSectors';

// Motivation layer for the intake form (own file, so the form itself keeps its state during edits):
// 1) a short "✓ page done · next: …" banner on each page change (no waiting, fades by itself),
// 2) "Your project is taking shape": a live list built from the answers,
// 3) milestone dots on the progress bar,
// and it remembers the current page per link in this browser tab, so a reload brings the visitor back to it.
type Answers = Record<string, string | boolean>;

const TX: Record<Lang, {
  done: (a: string) => string; next: (b: string) => string; half: string; last2: string; review: string;
  card: string; empty: string; website: string; pages: (n: number) => string; automation: string; ai: string; booking: string; payment: string;
  accounts: string; quoteForm: string; notify: (c: string) => string; langs: (l: string) => string; autoEmail: string; autoCrm: string;
  staff: string; autoQuotes: string; review2: string; crm: string; app: string;
}> = {
  tr: {
    done: (a) => `✓ ${a} tamamlandı`, next: (b) => `Sıradaki: ${b}`, half: 'Yarıya geldiniz.', last2: 'Son 2 sayfa kaldı.', review: 'Neredeyse bitti: kısa bir bakış ve gönderim.',
    card: 'Projeniz şekilleniyor', empty: 'Cevap verdikçe projeniz burada belirecek.', website: 'Web sitesi', pages: (n) => `${n} sayfa`, automation: 'Otomasyon',
    ai: 'Yapay zekâ asistanı', booking: 'Müşteriler siteden randevu alabilecek', payment: 'Online ödeme', accounts: 'Müşteri hesapları',
    quoteForm: 'Siteden teklif talebi', notify: (c) => `Bildirimler: ${c}`, langs: (l) => `Diller: ${l}`, autoEmail: 'Otomatik e-postalar',
    autoCrm: 'Yeni müşteriler otomatik olarak listenize', staff: 'Ekip planlama', autoQuotes: 'Otomatik teklif taslağı', review2: 'Son bakış', crm: 'Size özel müşteri yönetim sistemi', app: 'Size özel uygulama / panel',
  },
  en: {
    done: (a) => `✓ ${a} completed`, next: (b) => `Next: ${b}`, half: 'You are halfway there.', last2: 'Only 2 pages left.', review: 'Almost done: a quick look and send.',
    card: 'Your project is taking shape', empty: 'Your project will appear here as you answer.', website: 'Website', pages: (n) => `${n} pages`, automation: 'Automation',
    ai: 'AI assistant', booking: 'Customers can book on the site', payment: 'Online payment', accounts: 'Customer accounts',
    quoteForm: 'Quote requests from the site', notify: (c) => `Notifications: ${c}`, langs: (l) => `Languages: ${l}`, autoEmail: 'Automatic e-mails',
    autoCrm: 'New customers added to your list automatically', staff: 'Team scheduling', autoQuotes: 'Automatic quote drafts', review2: 'Final look', crm: 'Your own customer management system', app: 'Your own app / panel',
  },
  de: {
    done: (a) => `✓ ${a} abgeschlossen`, next: (b) => `Als Nächstes: ${b}`, half: 'Sie haben die Hälfte geschafft.', last2: 'Nur noch 2 Seiten.', review: 'Fast fertig: kurz prüfen und absenden.',
    card: 'Ihr Projekt nimmt Gestalt an', empty: 'Mit Ihren Antworten entsteht hier Ihr Projekt.', website: 'Website', pages: (n) => `${n} Seiten`, automation: 'Automatisierung',
    ai: 'KI-Assistent', booking: 'Kunden buchen Termine auf der Website', payment: 'Online-Zahlung', accounts: 'Kundenkonten',
    quoteForm: 'Angebotsanfragen über die Website', notify: (c) => `Benachrichtigungen: ${c}`, langs: (l) => `Sprachen: ${l}`, autoEmail: 'Automatische E-Mails',
    autoCrm: 'Neue Kunden automatisch in Ihrer Liste', staff: 'Teamplanung', autoQuotes: 'Automatische Angebotsentwürfe', review2: 'Abschluss', crm: 'Eigenes Kundenverwaltungssystem', app: 'Eigene App / Login-Bereich',
  },
  el: {
    done: (a) => `✓ Ολοκληρώθηκε: ${a}`, next: (b) => `Επόμενο: ${b}`, half: 'Φτάσατε στη μέση.', last2: 'Απομένουν μόνο 2 σελίδες.', review: 'Σχεδόν τελειώσατε: ένας γρήγορος έλεγχος και αποστολή.',
    card: 'Το έργο σας παίρνει μορφή', empty: 'Με τις απαντήσεις σας, το έργο σας θα εμφανίζεται εδώ.', website: 'Ιστοσελίδα', pages: (n) => `${n} σελίδες`, automation: 'Αυτοματοποίηση',
    ai: 'Βοηθός ΤΝ', booking: 'Οι πελάτες κλείνουν ραντεβού από τη σελίδα', payment: 'Online πληρωμή', accounts: 'Λογαριασμοί πελατών',
    quoteForm: 'Αιτήματα προσφοράς από τη σελίδα', notify: (c) => `Ειδοποιήσεις: ${c}`, langs: (l) => `Γλώσσες: ${l}`, autoEmail: 'Αυτόματα e-mail',
    autoCrm: 'Νέοι πελάτες αυτόματα στη λίστα σας', staff: 'Προγραμματισμός ομάδας', autoQuotes: 'Αυτόματα προσχέδια προσφορών', review2: 'Τελικός έλεγχος', crm: 'Δικό σας σύστημα διαχείρισης πελατών', app: 'Δική σας εφαρμογή / πίνακας',
  },
};

interface Props { lang: Lang; token: string; step: number; total: number; def: Definition; answers: Answers; setStep: (n: number) => void }

export default function IntakeProgress({ lang, token, step, total, def, answers, setStep }: Props) {
  const t = TX[lang];
  const key = `cw-intake-step:${token}`;
  const restored = useRef(false);
  const prev = useRef(step);
  const jump = useRef(false);   // restoring the page after a reload is not "progress": no banner
  const [banner, setBanner] = useState<{ id: number; lines: string[] } | null>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Remember the page for this link in this tab; bring the visitor back after a reload
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      try { const s = Number(sessionStorage.getItem(key)); if (s > 0 && step === 0 && s <= total) { jump.current = true; setStep(s); return; } } catch { /* storage blocked */ }
    }
    try { sessionStorage.setItem(key, String(step)); } catch { /* storage blocked */ }
  }, [step, key, total, setStep]);

  // Short banner on forward page changes
  useEffect(() => {
    if (jump.current) { if (step !== 0) { jump.current = false; prev.current = step; } return; }
    const from = prev.current; prev.current = step;
    if (step <= from || from < 0) return;
    const title = (i: number) => (i >= total ? t.review2 : def.sections[i]?.title[lang] || def.sections[i]?.title.en || '');
    const lines = [`${t.done(title(from))} · ${t.next(title(step))}`];
    const left = total - step;
    if (step >= total) lines.push(t.review);
    else if (left === 2) lines.push(t.last2);
    else if (from < total / 2 && step >= total / 2) lines.push(t.half);
    const id = Date.now(); setBanner({ id, lines });
    const timer = window.setTimeout(() => setBanner((b) => (b?.id === id ? null : b)), 4200);
    return () => window.clearTimeout(timer);
  }, [step, total, def, lang, t]);

  // "Your project is taking shape": built only from what the visitor answered
  const items = useMemo(() => {
    const qs = new Map<string, QDef>(def.sections.flatMap((s) => s.qs.map((q) => [q.id, q] as [string, QDef])));
    const on = (k: string) => answers[k] === true;
    const yes = (id: string) => answers[id] === 'yes';
    const label = (id: string, opt: string) => { const o = qs.get(id)?.opts?.find((x) => x.id === opt); return o ? (o.t[lang] || o.t.en).replace(/\s*\(.*\)$/, '') : opt; };
    const picked = (id: string) => (qs.get(id)?.opts ?? []).filter((o) => on(`${id}__${o.id}`)).map((o) => label(id, o.id));
    const out: string[] = [];
    const all = on('wants__all');
    if (all || on('wants__website')) { const n = picked('web_parts').length; out.push(n ? `${t.website} · ${t.pages(n)}` : t.website); }
    if (all || on('wants__automation')) out.push(t.automation);
    if (all || on('wants__crm')) out.push(t.crm);
    if (all || on('wants__app')) out.push(t.app);
    if (all || on('wants__ai')) out.push(t.ai);
    if (yes('online_booking') || yes('booking_system')) out.push(t.booking);
    if (yes('quote_form')) out.push(t.quoteForm);
    if (yes('online_payment')) out.push(t.payment);
    if (yes('customer_accounts')) out.push(t.accounts);
    const ch = String(answers.messenger_notify ?? '');
    if (['telegram', 'whatsapp', 'email'].includes(ch)) out.push(t.notify(label('messenger_notify', ch)));
    if (yes('auto_email')) out.push(t.autoEmail);
    if (yes('auto_crm')) out.push(t.autoCrm);
    if (yes('auto_quotes')) out.push(t.autoQuotes);
    if (yes('staff_scheduling')) out.push(t.staff);
    const langs = picked('website_languages');
    if (langs.length) out.push(t.langs(langs.join(', ')));
    return out;
  }, [answers, def, lang, t]);

  const seen = useRef<Set<string>>(new Set());
  const fresh = new Set(items.filter((x) => !seen.current.has(x)));
  useEffect(() => { items.forEach((x) => seen.current.add(x)); }, [items]);

  return (
    <>
      {/* milestone dots: one per page, filled when done */}
      <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'space-between', margin: '-14px 0 18px', padding: '0 1px' }}>
        {Array.from({ length: total + 1 }, (_, i) => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: 9999, background: i < step ? 'var(--c-signal)' : i === step ? 'var(--c-lilac)' : 'var(--c-hairline)', transition: 'background .3s' }} />
        ))}
      </div>

      {banner && (
        <div role="status" key={banner.id} className={reduced ? undefined : 'cw-intake-banner'}
          style={{ margin: '0 0 18px', padding: '12px 16px', borderRadius: 'var(--r-card)', background: 'var(--c-cobalt)', border: '1px solid var(--c-lilac)', color: 'var(--c-quartz)', fontSize: 14, lineHeight: 1.5 }}>
          {banner.lines.map((l, i) => <div key={i} style={i ? { color: 'var(--c-lilac)', marginTop: 2 } : undefined}>{l}</div>)}
        </div>
      )}

      {step > 0 && (
        <section aria-label={t.card} className="lq-card" style={{ padding: '14px 18px', margin: '0 0 22px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-lilac)', marginBottom: 8 }}>{t.card}</div>
          {items.length === 0 ? <p style={{ margin: 0, fontSize: 13, color: 'var(--c-ash)' }}>{t.empty}</p> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {items.map((x) => (
                <li key={x} className={fresh.has(x) && !reduced ? 'cw-intake-fresh' : undefined}
                  style={{ fontSize: 13, padding: '5px 12px', borderRadius: 'var(--r-pill)', background: 'var(--c-deep-sea)', border: '1px solid var(--c-hairline)', color: 'var(--c-quartz)' }}>
                  <span aria-hidden="true" style={{ color: 'var(--c-signal)', marginRight: 6 }}>✓</span>{x}
                </li>))}
            </ul>)}
        </section>
      )}
    </>
  );
}
