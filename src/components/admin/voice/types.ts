export type Outcome = 'booked' | 'interested' | 'not_interested' | 'no_answer' | 'abuse_suspected' | 'calling' | 'simulated' | 'open';
export const OUTCOME: Record<Outcome, string> = { booked: 'Randevu alındı', interested: 'İlgili', not_interested: 'İlgisiz', no_answer: 'Cevap yok', abuse_suspected: 'Kötüye kullanım şüphesi', calling: 'Aranıyor', simulated: 'Simülasyon', open: 'Açık' };
export interface CallRow { id: string; createdAt: string; direction: 'in' | 'out'; person: string; business: string; phoneMasked: string; durationSec: number; outcome: Outcome; summary: string; simulated: boolean; hasRecording: boolean; hasTranscript: boolean; appointmentStart: string }
export interface CallPage { calls: CallRow[]; total: number; page: number; pageSize: number }
export interface CallDetail {
  call: CallRow & { transcript: string; endedReason: string; callId: string };
  customer: { id: string; name: string; phoneMasked: string; sector: string; sourceLeadId: string; sourceRequestId: string; doNotCall: boolean } | null;
  appointments: { id: string; start: string; end: string; notes: string }[];
  recording: { proxy: boolean; url: string } | null;
}
export interface Summary { mode: 'simulation' | 'live'; vapiConnected: boolean; liveReady: boolean; today: number; week: number; avgDurationSec: number; positiveRate: number | null; answered: number; doNotCall: number; inbound: number }
export type St = 'to_call' | 'calling' | 'booked' | 'no_answer';
export interface Cust { id: string; name: string; phone: string; sector: string; preferred_time: string; status: St; notes?: string; doNotCall?: boolean; priority?: 'high' | 'normal' | 'low'; scheduledAt?: string; sourceLeadId?: string; sourceRequestId?: string }
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
