export interface Req {
  id: string; createdAt: string; kind?: string; source?: Source; name?: string; email?: string; phone?: string; address?: string;
  business?: string; message?: string; lang?: string; page?: string; demo?: string; modules?: string[];
  voiceSessionId?: string; replyPreference?: 'written' | 'phone'; preferredStart?: string; callTime?: string; topic?: string;
  roiCalc?: { sector: string; sectorLabel: string; tasks: { name: string; min: number; perWeek: number; auto: number }[]; staff: number; cost: number; currency: string; lang: string; results: { weekH: number; monthH: number; yearH: number; moneyMonth: number; moneyYear: number; days: number } };
  city?: string; existingSite?: string; contactWhen?: string; startWhen?: string; budget?: string; notes?: string; examples?: { urls: string[]; note: string; none: boolean };
  read?: boolean; archived?: boolean; analysis?: Analysis;
}
export interface AnalysisData {
  summary: string; recommended: { website: string | null; automation: string | null; aiAssistant: string | null };
  requirements: string[]; openQuestions: string[]; risks: string[]; complexity: 'S' | 'M' | 'L'; complexityReason: string; stack: string[];
  spec: { context: string; goals: string[]; users: string[]; scope: { must: string[]; should: string[]; could: string[] }; pages: string[]; automations: string[]; dataModel: string[]; languages: string[]; legal: string[]; acceptance: string[] };
}
export interface Analysis { at: string; model: string; data: AnalysisData }
export interface IntakeBrief {
  id: string; requestId: string | null; lang: string; secondLang: string | null; market: string; sector: string; status: 'sent' | 'opened' | 'in_progress' | 'submitted';
  createdAt: string; openedAt: string | null; submittedAt: string | null; updatedAt?: string | null; analysisStale?: boolean; expiresAt: string; closesAt?: string | null; closed?: boolean; cancelledAt: string | null; emailedAt: string | null;
  company: string; contact: string; email: string; hasAnalysis: boolean; path: string; expired: boolean;
}
export interface Turn { role: 'user' | 'assistant'; text: string; at: number }
export interface VoiceSession {
  id: string; createdAt: string; lang: string; turns: Turn[]; contactSubmitted: boolean; kind?: 'voice' | 'text';
  contact?: { name?: string; email?: string; phone?: string; message?: string };
  contactId?: string; firstName?: string; lastName?: string; salutation?: 'm' | 'f'; analysis?: Analysis;
  durationSec?: number; endReason?: string;
}
export interface Usage { chars: number; cap: number }

export const DEMO = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('admindemo') === '1';

export class ApiError extends Error { constructor(public status: number, public data?: { message?: string }) { super(String(status)); } }

export const SESSION_LOST = 'cw-admin-session-lost';
/** Tell Admin the session is gone (401 from an /api/admin call). Login and /me are handled by their callers. */
export function sessionLost(path: string, status: number) {
  if ((status === 401 || status === 419) && path.startsWith('/api/admin') && path !== '/api/admin/login' && path !== '/api/admin/me') window.dispatchEvent(new Event(SESSION_LOST));
}

export async function api<T = unknown>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (import.meta.env.DEV && DEMO) {
    const m = await import('./demoData');
    return m.demoApi(path, method) as T;
  }
  const r = await fetch(path, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { sessionLost(path, r.status); throw new ApiError(r.status, data); }
  return data as T;
}

export const pad = (n: number) => String(n).padStart(2, '0');
export const fmtDate = (iso: string | number) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fmtDay = (ymd: string) => {
  const [y, m, d] = ymd.split('-');
  return `${d}.${m}.${y}`;
};

export type Source = 'voice-agent' | 'form' | 'voice' | 'chat' | 'calculator' | 'resources' | 'demo' | 'package' | 'manual';
/** Where the request was sent from (filled by the server, also for older records). */
export const SOURCE: Record<Source, string> = {
  form: 'Form', voice: 'Sesli', chat: 'Sohbet', calculator: 'Hesaplayıcı',
  resources: 'Kaynaklar', demo: 'Demo', package: 'Paket', manual: 'Elle', 'voice-agent': 'Voice Agent',
};
export const TOPIC: Record<string, string> = { 'res-qr': 'QR kod', 'res-review': 'Google yorum', 'res-messages': 'Mesaj şablonları', 'res-legal': 'Yasal kontrol' };
export const TAGS: { key: string; label: string }[] = (Object.keys(SOURCE) as Source[]).map((k) => ({ key: k, label: SOURCE[k] }));
export function tagsOf(r: Req): { key: string; label: string }[] {
  const src: Source = r.source ?? (r.kind === 'demo-request' ? 'demo' : r.kind === 'quote' || !r.kind ? 'package' : 'form');
  const t: { key: string; label: string }[] = [{ key: src, label: SOURCE[src] }];
  if (r.topic?.startsWith('res-')) t.push({ key: 'resources', label: `Kaynak: ${TOPIC[r.topic] ?? r.topic.slice(4)}` });
  if (r.roiCalc && src !== 'calculator') t.push({ key: 'calculator', label: 'Tasarruf hesabı ekli' });
  if (r.voiceSessionId && src !== 'voice' && src !== 'chat') t.push({ key: 'voice', label: 'Görüşme kaydı ekli' });
  return t;
}
