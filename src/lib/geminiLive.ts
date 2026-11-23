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
  onClosed: (clean: boolean, code: number) => void;
  onGoAway?: () => void;   // the Live API announced it will close the session soon: wrap up, do not cut
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
  goAway?: unknown;
};

const BARGE_RMS = 0.045;       // while the assistant speaks, mic frames below this are replaced by silence (echo gate)
const GATE_TAIL = 0.25;        // seconds the gate stays closed after playback ends
const PASS_HOLD = 0.6;         // seconds all frames pass after a loud frame (whole utterance)
const TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const LEAD = TOUCH ? 0.28 : 0.12;   // jitter-buffer lead after silence

export const END_QUIET_MS = 1500, END_SAFETY_MS = 45000, END_SAFETY_SILENT_MS = 5000, END_STALL_MS = 10000;
const END_WAIT_NO_AUDIO_MS = 4000;
/** End condition while ending: model turn finished, audio fully played, no new chunk for END_QUIET_MS. Never ends while audio is
 *  playing or still arriving; the safety caps apply only after the audio has been silent (5 s after 45 s, 10 s if no turnComplete came). */
export function shouldEnd(o: { turnDone: boolean; playing: boolean; lastAudioAgoMs: number; inEndingMs: number; audioAfterEnd?: boolean }): boolean {
  if (o.playing) return false;
  if (o.inEndingMs >= END_SAFETY_MS && o.lastAudioAgoMs >= END_SAFETY_SILENT_MS) return true;
  if (o.inEndingMs >= END_STALL_MS && o.lastAudioAgoMs >= END_STALL_MS) return true;
  // the model may think a moment after finish_conversation before it speaks the farewell: if no farewell audio has
  // arrived yet, keep the call open for at least END_WAIT_NO_AUDIO_MS (owner 2026-11-19: call ended before the goodbye)
  if (!o.audioAfterEnd && o.inEndingMs < END_WAIT_NO_AUDIO_MS) return false;
  return o.turnDone && o.lastAudioAgoMs >= END_QUIET_MS;
}

export const GRACE_MS = 5000, GRACE_REPLY_MS = 1000, GRACE_NOREPLY_MS = 8000, GRACE_CAP_MS = 30000;
/** Grace period after the farewell (mic live): ends after GRACE_MS of silence; if the visitor spoke, after the model's short reply
 *  finished (turnComplete + playback done + GRACE_REPLY_MS). Never a second grace; safety caps when no reply comes. */
export function graceEnd(o: { inGraceMs: number; heard: boolean; sinceHeardMs: number; playing: boolean; turnDone: boolean; audioAfterHeard: boolean; lastAudioAgoMs: number }): boolean {
  if (o.playing) return false;
  if (o.inGraceMs >= GRACE_CAP_MS) return true;
  if (!o.heard) return o.inGraceMs >= GRACE_MS;
  if (!o.audioAfterHeard) return o.sinceHeardMs >= GRACE_NOREPLY_MS;
  return o.turnDone && o.lastAudioAgoMs >= GRACE_REPLY_MS;
}

const dbg = (...a: unknown[]) => { if (import.meta.env?.DEV) console.debug('[live]', ...a); };

export class LiveCall {
  private ws: WebSocket | null = null;
  private node: AudioWorkletNode | null = null;
  private src: MediaStreamAudioSourceNode | null = null;
  private sink: GainNode | null = null;
  private ready = false;
  private closing = false;
  private next = 0;
  private ending = false;
  private endStart = 0;
  private turnDone = false;
  private generating = false;   // audio received since the last turnComplete
  private lastAudio = 0;
  private t0 = performance.now();
  private lastTurnAt = 0;
  private playEnd = 0;   // performance.now() when the queued audio ends
  private audioAfterEnd = false;
  private passUntil = 0;
  private greeting = true;   // until the first assistant turn is done: mic muted, interruptions ignored
  private gotAudio = false;
  private turnText = '';   // output transcript of the current model turn
  private muteTurn = false;  // the turn is only a control token like <no speech> or {pause}: never play it
  private greetHeard = false;   // greeting audio has played at least once (never reset by an 'interrupted' event)
  private held: { pcm: Uint8Array; rms: number }[] = [];   // mic frames captured after the greeting audio ended, before the guard opened
  private kickoffs = 0;
  private grace = false;
  private graceStart = 0;
  private graceHeardAt = 0;
  private audioAfterHeard = false;
  private sources = new Set<AudioBufferSourceNode>();
  private guardTimer: ReturnType<typeof setInterval> | null = null;
  constructor(private ctx: AudioContext, private stream: MediaStream, private h: LiveHandlers) {}

  /** Resolves when setupComplete arrives; rejects on error/close/timeout before that. */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL + encodeURIComponent(token));
      this.ws = ws;
      const fail = (m: string) => { clearTimeout(timer); reject(new Error(m)); };
      const timer = setTimeout(() => { fail('timeout'); this.close(); }, 12000);
      ws.onopen = () => { dbg('ws open'); ws.send(JSON.stringify({ setup: {} })); };
      ws.onerror = () => { if (!this.ready) fail('ws_error'); };
      ws.onclose = (e) => {
        dbg('ws close', e.code, 'ready', this.ready);
        if (!this.ready) { fail(`closed_${e.code}`); return; }
        this.h.onClosed(this.closing || e.code === 1000, e.code);
      };
      ws.onmessage = async (ev) => {
        let m: LiveServerMessage;
        try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : await (ev.data as Blob).text()); } catch { return; }
        if (m.setupComplete && !this.ready) { this.ready = true; clearTimeout(timer); setTimeout(() => { if (this.greeting) this.openGuard('12 s timer'); }, 12000); this.guardTimer = setInterval(() => this.guardCheck(), 250); this.startMic(); resolve(); return; }
        const sc = m.serverContent;
        if (sc) {
          if (sc.interrupted) {
            dbg('interrupted', this.greeting ? '(ignored: greeting)' : this.ending ? '(ignored: ending)' : '');
            // greeting: never cut playback or touch the bubble; the restarted turn needs its own turnComplete to end the guard
            if (this.greeting) this.gotAudio = false;
            else if (!this.ending) { this.stopPlayback(); this.h.onInterrupted(); }
          }
          for (const p of sc.modelTurn?.parts ?? []) if (p.inlineData?.data) { this.gotAudio = true; this.greetHeard = true; this.generating = true; this.lastAudio = performance.now(); if (this.ending) this.audioAfterEnd = true; if (this.ending || this.grace) this.turnDone = false; if (this.grace && this.graceHeardAt) this.audioAfterHeard = true; if (!this.muteTurn) this.play(p.inlineData.data); }
          if (sc.inputTranscription?.text) { if (this.grace) this.heardInGrace(); this.h.onInput(sc.inputTranscription.text); }
          if (sc.outputTranscription?.text) {
            this.turnText += sc.outputTranscription.text;
            // the model sometimes voices placeholders such as "<no speech>{pause}": silence that turn at once
            if (!this.muteTurn && /^\s*[<{[]/.test(this.turnText)) { this.muteTurn = true; this.stopPlayback(); dbg('placeholder turn muted'); }
            this.h.onOutput(sc.outputTranscription.text);
          }
          if (sc.turnComplete) { this.turnText = ''; this.muteTurn = false; this.generating = false; this.lastTurnAt = performance.now(); if (this.ending || this.grace) this.turnDone = true; if (this.gotAudio && this.greeting) { this.openGuard('first turnComplete'); } this.h.onTurnComplete(); }
        }
        if (m.goAway) this.h.onGoAway?.();
        if (m.toolCall?.functionCalls) {
          const calls = m.toolCall.functionCalls as { id: string; name: string; args?: { reason?: unknown } }[];
          ws.send(JSON.stringify({ toolResponse: { functionResponses: calls.map((c) => ({ id: c.id, name: c.name, response: { ok: true } })) } }));
          const fin = calls.find((c) => c.name === 'finish_conversation');
          if (fin) this.h.onFinish(fin.args?.reason === 'abuse' ? 'abuse' : fin.args?.reason === 'language' ? 'language' : fin.args?.reason === 'closing' ? 'closing' : 'done');
        }
      };
    });
  }

  /** Safety: if the greeting audio has finished playing and no turnComplete came within 2 s, release the mic guard anyway. */
  private guardCheck() {
    if (!this.greeting) { if (this.guardTimer) clearInterval(this.guardTimer); this.guardTimer = null; return; }
    // greetHeard is never reset by an 'interrupted' event (that reset used to keep the mic shut for 12 s while the visitor
    // was already answering, so the visitor's first sentence was lost and the call stood still)
    if (this.greetHeard && !this.speaking() && performance.now() - this.lastAudio >= 900) this.openGuard('greeting audio finished');
  }

  /** Opens the mic after the greeting; replays what the visitor already said in the last ~3 s (they often answer at once). */
  private openGuard(why: string) {
    if (!this.greeting) return;
    this.greeting = false; dbg('greeting guard released:', why);
    const spoke = this.held.some((f) => f.rms > BARGE_RMS);
    if (spoke && this.ws?.readyState === WebSocket.OPEN) for (const f of this.held) this.ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64(f.pcm), mimeType: 'audio/pcm;rate=16000' } } }));
    this.held = [];
  }

  private startMic() {
    const node = new AudioWorkletNode(this.ctx, 'live-capture');
    node.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; rms: number }>) => {
      this.h.onLevel(e.data.rms);
      if (!this.ready || this.ws?.readyState !== WebSocket.OPEN) return;
      let pcm = new Uint8Array(e.data.pcm);
      const now = this.ctx.currentTime;
      if (this.greeting) {   // no frames until the greeting is done (any stream may trigger server VAD); keep the last ~3 s once its audio ended
        if (this.greetHeard && !this.speaking()) { this.held.push({ pcm, rms: e.data.rms }); if (this.held.length > 75) this.held.shift(); }
        return;
      }
      if (this.grace && e.data.rms > BARGE_RMS) this.heardInGrace();
      if (this.ending) pcm = new Uint8Array(pcm.length);
      else if (this.next + GATE_TAIL > now) {   // assistant audible (or just ended): echo gate
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

  /** The greeting trigger: idempotent per call (a second call is ignored). Returns true when it was sent. */
  kickoff(text = 'START'): boolean {
    if (this.kickoffs) { dbg('kickoff ignored (already sent)'); return false; }
    this.kickoffs++; dbg('kickoff sent, count', this.kickoffs);
    this.sendText(text);
    return true;
  }

  sendText(text: string) { if (this.ready && this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ realtimeInput: { text } })); }

  /** True while the model is generating or its audio is still audible (do not send text now: it would interrupt). */
  busy() { return this.generating || this.speaking(); }

  /** Ms offsets from the start of this call, for the session log. */
  timing() {
    const o = (v: number) => (v ? Math.round(v - this.t0) : 0);
    return { lastAudioChunkAt: o(this.lastAudio), lastTurnCompleteAt: o(this.lastTurnAt), playbackDoneAt: o(this.playEnd) };
  }

  /** True while queued model audio is still audible. */
  speaking() { return this.next > this.ctx.currentTime; }

  /** Mutes the mic (silence frames only) while the call is ending. */
  hold(afterFinish = false) {
    if (this.ending) return;
    this.ending = true; this.audioAfterEnd = false; this.endStart = performance.now(); this.lastAudio = this.lastAudio || this.endStart;
    this.turnDone = !afterFinish && !this.generating;   // after finish_conversation a LATER turnComplete is required
  }

  /** While ending: resolves once shouldEnd() holds, plus a 500 ms tail (safety caps in shouldEnd). Call hold() first. */
  whenReallyDone(): Promise<void> {
    return new Promise((res) => {
      const tick = () => {
        const n = performance.now();
        if (shouldEnd({ turnDone: this.turnDone, playing: this.speaking(), lastAudioAgoMs: n - this.lastAudio, inEndingMs: n - this.endStart, audioAfterEnd: this.audioAfterEnd })) setTimeout(res, 500);
        else setTimeout(tick, 100);
      };
      tick();
    });
  }

  private heardInGrace() { if (!this.graceHeardAt) { this.graceHeardAt = performance.now(); this.turnDone = false; dbg('grace: visitor spoke'); } }

  /** After the farewell: mic live again for GRACE_MS (see graceEnd). Resolves when the call may end. */
  whenGraceDone(): Promise<void> {
    this.ending = false; this.grace = true; this.graceStart = performance.now(); this.graceHeardAt = 0; this.turnDone = false; this.audioAfterHeard = false;
    return new Promise((res) => {
      const tick = () => {
        const n = performance.now();
        if (graceEnd({ inGraceMs: n - this.graceStart, heard: !!this.graceHeardAt, sinceHeardMs: n - this.graceHeardAt, playing: this.speaking(), turnDone: this.turnDone, audioAfterHeard: this.audioAfterHeard, lastAudioAgoMs: n - this.lastAudio })) res();
        else setTimeout(tick, 100);
      };
      tick();
    });
  }

  /** Resolves when queued model audio has finished playing (polls every 100 ms, gives up after maxMs). */
  whenPlaybackDone(maxMs = 8000): Promise<void> {
    return new Promise((res) => {
      const t0 = Date.now();
      const tick = () => { if (!this.speaking() || Date.now() - t0 >= maxMs) res(); else setTimeout(tick, 100); };
      tick();
    });
  }

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
    this.playEnd = performance.now() + (this.next - now) * 1000;
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
    if (this.guardTimer) clearInterval(this.guardTimer); this.guardTimer = null;
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
