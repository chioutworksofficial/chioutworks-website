export type Outcome = 'booked' | 'interested' | 'not_interested' | 'no_answer' | 'abuse_suspected' | 'calling' | 'simulated' | 'open';
export const OUTCOME: Record<Outcome, string> = { booked: 'Randevu alındı', interested: 'İlgili', not_interested: 'İlgisiz', no_answer: 'Cevap yok', abuse_suspected: 'Kötüye kullanım şüphesi', calling: 'Aranıyor', simulated: 'Simülasyon', open: 'Açık' };
export interface CallRow { id: string; createdAt: string; direction: 'in' | 'out'; person: string; business: string; phoneMasked: string; durationSec: number; outcome: Outcome; summary: string; simulated: boolean; hasRecording: boolean; hasTranscript: boolean; appointmentStart: string; costUsd?: number | null }
export interface CallPage { calls: CallRow[]; total: number; page: number; pageSize: number }
export interface CallDetail {
  call: CallRow & { transcript: string; endedReason: string; callId: string };
  customer: { id: string; name: string; phoneMasked: string; sector: string; sourceLeadId: string; sourceRequestId: string; doNotCall: boolean } | null;
  appointments: { id: string; start: string; end: string; notes: string }[];
  recording: { proxy: boolean; url: string } | null;
}
export interface Summary { mode: 'simulation' | 'live'; vapiConnected: boolean; liveReady: boolean; today: number; week: number; avgDurationSec: number; positiveRate: number | null; answered: number; doNotCall: number; inbound: number; callsTotal?: number; simRuns?: number; alertsUnseen?: number }
export type St = 'to_call' | 'calling' | 'booked' | 'no_answer';
export interface Cust { id: string; name: string; phone: string; sector: string; preferred_time: string; status: St; notes?: string; doNotCall?: boolean; priority?: 'high' | 'normal' | 'low'; scheduledAt?: string; sourceLeadId?: string; sourceRequestId?: string; country?: string; rule?: RuleState | null }
export interface RuleState { ok: boolean; code?: string; reason?: string; nextSlot?: string; country?: string }
export interface Appt { id: string; name: string; start: string; end: string; notes: string }
export const fmtDur = (s: number) => (s > 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '-');
export const fmtSlot = (s: string) => `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)} ${s.slice(11, 16)}`;
export const RECORDING_URL = (id: string) => `/api/admin/voice-agent/calls/${encodeURIComponent(id)}/recording`;
/** CSV cell: quotes escaped, leading = + - @ tab CR neutralised (formula injection). */
const cell = (v: unknown) => { let s = String(v ?? '').replace(/\r?\n/g, ' '); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
export const toCsv = (rows: string[][]) => `﻿${rows.map((r) => r.map(cell).join(';')).join('\r\n')}\r\n`;
export const download = (name: string, text: string, type: string) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

// ── Analiz, Planlama, Test, Aranmasın, Uyum ──
export type CC = 'DE' | 'TR' | 'GR';
export interface Hours { days: number[]; start: string; end: string }
export interface PlanningCfg { hours: Record<CC, Hours>; holidays: boolean; dailyMax: number; minGapMin: number; maxAttempts: number; callbackSlots: string[] }
export interface PlanningRes { planning: PlanningCfg; defaults: PlanningCfg; now: Record<CC, { date: string; time: string; dow: number }>; holidays: Record<CC, { date: string; name: string }[]>; today: { calls: number; max: number }; countries: Record<CC, string> }
export interface Bucket { n: number; pos: number; rate: number | null }
export interface Analytics {
  days: number; total: number; allTime: number; perDay: { date: string; calls: number; positive: number }[]; funnel: { dialed: number; reached: number; positive: number; booked: number }; avgDurationSec: number;
  byHour: Bucket[]; byWeekday: Bucket[]; byLang: Record<string, { calls: number; positive: number }>;
  cost: { totalUsd: number; avgUsd: number; counted: number; missing: number; top: { id: string; createdAt: string; costUsd: number; person: string }[] };
  abuse: number; notInterested: number; inbound: number;
}
export interface DncItem { id: string; masked: string; reason: string; source: 'call' | 'manual' | 'form' | 'unknown'; at: string }
export interface DncRes { items: DncItem[]; total: number; log: { at: string; masked: string; note: string }[] }
export interface CompRow {
  id: string; createdAt: string; direction: 'in' | 'out'; person: string; phoneMasked: string; outcome: Outcome; durationSec: number; disclosure: 'yes' | 'no' | 'unknown';
  recording: { on: boolean; consent: 'n/a' | 'asked' | 'not_asked' }; proof: { kind: string; ok: boolean | null; refId: string; at: string; note: string }; issue: boolean;
}
export interface CompRes { rows: CompRow[]; total: number; issues: number }
export interface SimTurn { who: 'ai' | 'caller'; text: string }
export interface SimRule { id: string; label: string; status: 'pass' | 'fail' | 'na'; detail: string }
export interface SimRun { id: string; at: string; lang: Lang; persona: string; label: string; mode: 'auto' | 'manual'; batchId: string; turns: SimTurn[]; rules: SimRule[]; pass: boolean }
export type Lang = 'tr' | 'en' | 'de' | 'el';
export interface NotifyRes { settings: { hot: boolean; abuse: boolean; booked: boolean }; mailConfigured: boolean; alerts: { id: string; at: string; kind: string; label: string; seen: boolean }[]; unseen: number }
export const usd = (n: number) => `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 3 : 2 })} USD`;
