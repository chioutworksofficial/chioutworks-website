import { getBid } from './assistantConsent';
// Browser side of the Gemini Live call: raw WebSocket with a one-use ephemeral token (the config is locked server-side into the token),
// microphone via AudioWorklet (16 kHz PCM16 up) and gapless 24 kHz PCM16 playback (down) on ONE AudioContext.
const WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=';

export interface LiveHandlers {
  onInput: (text: string) => void;
  onOutput: (text: string) => void;
  onInterrupted: () => void;
  onTurnComplete: () => void;
  onFinish: (reason: string) => void;   // the model called finish_conversation (reason: "done" | "abuse")
  onClosed: (clean: boolean) => void;
  onLevel: (rms: number) => void;
}

/** Created inside the user's click so the context starts running; loads the capture worklet. */
export async function createAudio(): Promise<AudioContext> {
  const ctx = new AudioContext({ latencyHint: 'interactive' });
  if (ctx.state === 'suspended') await ctx.resume();
  await ctx.audioWorklet.addModule('/live-capture.worklet.js');
  return ctx;
}

/** Subset of the Gemini Live server message this client reads. */
type LiveServerMessage = {
  setupComplete?: unknown;
  serverContent?: {
    interrupted?: boolean;
    modelTurn?: { parts?: { inlineData?: { data?: string } }[] };
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    turnComplete?: boolean;
  };
  toolCall?: { functionCalls?: unknown[] };
};

const BARGE_RMS = 0.045;       // while the assistant speaks, mic frames below this are replaced by silence (echo gate)
const GATE_TAIL = 0.25;        // seconds the gate stays closed after playback ends
const PASS_HOLD = 0.6;         // seconds all frames pass after a loud frame (whole utterance)
const TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const LEAD = TOUCH ? 0.28 : 0.12;   // jitter-buffer lead after silence

export class LiveCall {
  private ws: WebSocket | null = null;
  private node: AudioWorkletNode | null = null;
  private src: MediaStreamAudioSourceNode | null = null;
  private sink: GainNode | null = null;
  private ready = false;
  private closing = false;
  private next = 0;
  private passUntil = 0;
  private sources = new Set<AudioBufferSourceNode>();
  constructor(private ctx: AudioContext, private stream: MediaStream, private h: LiveHandlers) {}

  /** Resolves when setupComplete arrives; rejects on error/close/timeout before that. */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL + encodeURIComponent(token));
      this.ws = ws;
      const fail = (m: string) => { clearTimeout(timer); reject(new Error(m)); };
      const timer = setTimeout(() => { fail('timeout'); this.close(); }, 12000);
      ws.onopen = () => ws.send(JSON.stringify({ setup: {} }));
      ws.onerror = () => { if (!this.ready) fail('ws_error'); };
      ws.onclose = (e) => {
        if (!this.ready) { fail(`closed_${e.code}`); return; }
        this.h.onClosed(this.closing || e.code === 1000);
      };
      ws.onmessage = async (ev) => {
        let m: LiveServerMessage;
        try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : await (ev.data as Blob).text()); } catch { return; }
        if (m.setupComplete && !this.ready) { this.ready = true; clearTimeout(timer); this.startMic(); resolve(); return; }
        const sc = m.serverContent;
        if (sc) {
          if (sc.interrupted) { this.stopPlayback(); this.h.onInterrupted(); }
          for (const p of sc.modelTurn?.parts ?? []) if (p.inlineData?.data) this.play(p.inlineData.data);
          if (sc.inputTranscription?.text) this.h.onInput(sc.inputTranscription.text);
          if (sc.outputTranscription?.text) this.h.onOutput(sc.outputTranscription.text);
          if (sc.turnComplete) this.h.onTurnComplete();
        }
        if (m.toolCall?.functionCalls) {
          const calls = m.toolCall.functionCalls as { id: string; name: string; args?: { reason?: unknown } }[];
          ws.send(JSON.stringify({ toolResponse: { functionResponses: calls.map((c) => ({ id: c.id, name: c.name, response: { result: 'ok' } })) } }));
          const fin = calls.find((c) => c.name === 'finish_conversation');
          if (fin) this.h.onFinish(fin.args?.reason === 'abuse' ? 'abuse' : 'done');
        }
      };
    });
  }

  private startMic() {
    const node = new AudioWorkletNode(this.ctx, 'live-capture');
    node.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; rms: number }>) => {
      this.h.onLevel(e.data.rms);
      if (!this.ready || this.ws?.readyState !== WebSocket.OPEN) return;
      let pcm = new Uint8Array(e.data.pcm);
      const now = this.ctx.currentTime;
      if (this.next + GATE_TAIL > now) {   // assistant audible (or just ended): echo gate
        if (e.data.rms > BARGE_RMS) this.passUntil = now + PASS_HOLD;
        else if (now > this.passUntil) pcm = new Uint8Array(pcm.length);
      }
      this.ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64(pcm), mimeType: 'audio/pcm;rate=16000' } } }));
    };
    this.src = this.ctx.createMediaStreamSource(this.stream);
    this.sink = this.ctx.createGain(); this.sink.gain.value = 0;   // keeps the worklet pulling without echoing the mic
    this.src.connect(node); node.connect(this.sink); this.sink.connect(this.ctx.destination);
    this.node = node;
  }

  sendText(text: string) { if (this.ready && this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ realtimeInput: { text } })); }

  /** True while queued model audio is still audible. */
  speaking() { return this.next > this.ctx.currentTime; }

  private play(data: string) {
    const bin = atob(data), n = bin.length >> 1;
    const buf = this.ctx.createBuffer(1, n, 24000), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) { const v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); ch[i] = (v << 16 >> 16) / 32768; }
    const now = this.ctx.currentTime;
    // never schedule in the past; after silence add a short wake-up gap so the first chunk is not clipped by the output device
    const late = now - this.next;
    const at = late <= 0 ? this.next : late < 0.08 ? now + 0.03 : now + LEAD;
    const s = this.ctx.createBufferSource();
    s.buffer = buf; s.connect(this.ctx.destination); s.start(at);
    s.onended = () => this.sources.delete(s);
    this.sources.add(s);
    this.next = at + buf.duration;
  }

  /** Barge-in: stop everything queued immediately. */
  stopPlayback() {
    for (const s of this.sources) { try { s.stop(); } catch { /* already ended */ } }
    this.sources.clear();
    this.next = 0;
  }

  /** Ends the call and releases mic nodes; the caller owns (and stops) the MediaStream and the AudioContext. */
  close() {
    this.closing = true;
    this.stopPlayback();
    try { this.node?.disconnect(); this.src?.disconnect(); this.sink?.disconnect(); } catch { /* ignore */ }
    if (this.node) this.node.port.onmessage = null;
    this.node = null;
    const ws = this.ws; this.ws = null;
    if (ws) { ws.onmessage = null; ws.onerror = null; try { ws.close(1000); } catch { /* ignore */ } }
  }
}

function b64(u: Uint8Array): string {
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}

export interface TokenOk { token: string; model: string; expiresAt: string; sessionId: string }
export type TokenResult = { kind: 'ok'; t: TokenOk } | { kind: 'full'; ticket: string; position: number } | { kind: 'cap'; scope: 'daily' | 'monthly' } | { kind: 'unavailable' } | { kind: 'error' };

export async function fetchToken(body: Record<string, unknown>): Promise<TokenResult> {
  try {
    const r = await fetch('/api/voice/live-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, bid: getBid() }) });
    const j = await r.json().catch(() => ({})) as Record<string, unknown>;
    if (r.ok && typeof j.token === 'string') return { kind: 'ok', t: j as unknown as TokenOk };
    if (r.status === 403 && j.error === 'voice_unavailable') return { kind: 'unavailable' };
    if (r.status === 503 && j.error === 'full') return { kind: 'full', ticket: String(j.ticket), position: Number(j.position) || 1 };
    if (r.status === 503 && j.error === 'cap') return { kind: 'cap', scope: j.scope === 'monthly' ? 'monthly' : 'daily' };
  } catch { /* network */ }
  return { kind: 'error' };
}

// Per-browser fair use, adaptive: the server says how many calls a browser may make today (more while quota is plentiful).
// Unlimited on the local dev server so the owner can test all languages.
const DAY_KEY = 'cw-live-day';
async function dayMax(): Promise<number> {
  if (import.meta.env.DEV) return 1000;
  try { const j = await (await fetch('/api/voice/live-status')).json() as { browserMax?: number }; return Number(j.browserMax) || 2; } catch { return 2; }
}
const today = () => new Date().toISOString().slice(0, 10);
export function liveDayCount(): number {
  try { const j = JSON.parse(localStorage.getItem(DAY_KEY) ?? 'null'); return j?.d === today() ? Number(j.n) || 0 : 0; } catch { return 0; }
}
export const liveDayExceeded = async () => liveDayCount() >= await dayMax();
export function bumpLiveDay() { try { localStorage.setItem(DAY_KEY, JSON.stringify({ d: today(), n: liveDayCount() + 1 })); } catch { /* private mode */ } }

/** Sends the end of a call to the server (frees the slot; abuse=true records it for the fair-use guard). */
export function postLiveEnd(sessionId: string, abuse = false, beacon = false) {
  const body = JSON.stringify({ sessionId, bid: getBid(), ...(abuse ? { abuse: true } : {}) });
  if (beacon) { navigator.sendBeacon('/api/voice/live-end', new Blob([body], { type: 'application/json' })); return; }
  fetch('/api/voice/live-end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}

/** Silence guard: counts only while nobody speaks (paused while the assistant audio plays or the line is reconnecting).
 *  After `nudgeMs` of silence it nudges once; after `endMs` more silence it ends. heard() resets everything. */
export class SilenceWatch {
  private idle = 0; private nudged = false; private t: ReturnType<typeof setInterval> | null = null;
  constructor(private paused: () => boolean, private onNudge: () => void, private onEnd: () => void, private nudgeMs = 20000, private endMs = 15000, private tick = 500) {}
  start() { if (!this.t) this.t = setInterval(() => this.step(), this.tick); }
  stop() { if (this.t) clearInterval(this.t); this.t = null; }
  heard() { this.idle = 0; this.nudged = false; }
  private step() {
    if (this.paused()) { this.idle = 0; return; }
    this.idle += this.tick;
    if (!this.nudged && this.idle >= this.nudgeMs) { this.nudged = true; this.idle = 0; this.onNudge(); }
    else if (this.nudged && this.idle >= this.endMs) { this.stop(); this.onEnd(); }
  }
}
