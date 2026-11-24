// Lead score (simple rules) + the calendar signals that follow from it. Never stores or logs personal data here.
//  sıcak   = clear need AND (request form submitted OR timeline/budget mentioned)
//  kararsız = contact given, but not hot (form not submitted)
//  anonim  = no contact (no calendar entry, no e-mail)
import { addCalendarEntry, dropCalendarEntry, type EntrySource } from './calendar.js';

export type Score = 'sıcak' | 'kararsız' | 'anonim';
const TIMELINE_BUDGET = /\b(budget|bütçe|butce|bütçem|προϋπολογισμ\w*|asap|urgent|soon|next (week|month)|this (week|month)|within \w+ (weeks?|months?)|diese woche|nächsten monat|nächste woche|so schnell|dringend|bald|bu hafta|gelecek (hafta|ay)|önümüzdeki|en kısa|acil|hemen|άμεσα|σύντομα|την επόμενη|εβδομάδα|\d+\s?(€|eur\b|euro|tl\b|₺|usd|\$))/i;

export function leadScore(i: { hasContact: boolean; submitted: boolean; text: string; timeline?: boolean }): Score {
  if (!i.hasContact) return 'anonim';
  const clear = i.text.trim().length >= 40;
  return clear && (i.submitted || i.timeline === true || TIMELINE_BUDGET.test(i.text)) ? 'sıcak' : 'kararsız';
}

/** Create / update the calendar entries that belong to the lead's current score. */
export async function signalLead(o: { source: EntrySource; email?: string; phone?: string; refTab: 'requests' | 'voice'; refId: string; preferredChannel?: string; score: Score }) {
  if (o.score === 'anonim' || (!o.email && !o.phone)) return;
  const base = { source: o.source, email: o.email, phone: o.phone, refTab: o.refTab, refId: o.refId, preferredChannel: o.preferredChannel ?? 'email', score: o.score };
  if (o.score === 'sıcak') {
    await dropCalendarEntry('remind', o.email, o.phone);
    await addCalendarEntry({ ...base, kind: 'hot' });
    if (o.preferredChannel === 'phone') await addCalendarEntry({ ...base, kind: 'call' });
  } else await addCalendarEntry({ ...base, kind: 'remind', inDays: 3 });
}
