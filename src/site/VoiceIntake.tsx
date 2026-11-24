/// <reference types="vite/client" />
import { addLiveChunk } from '../lib/liveTranscript';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { VOICE_UI } from './i18n/voice';
import { sttCapable, sttReady, sttSlow, prepareStt, listenOnce, openMic, micInputs, getMicId, setMicId, type Listening } from '../lib/stt';
import { readyPiper, unlockAudio, speakPiper, stopPiper, piperBusy } from '../lib/piperTts';
import { stripMarkup, cleanLive, writtenBrand } from '../lib/voiceMarkup';
import AssistantConsent from './AssistantConsent';
import VoiceOrb from './VoiceOrb';
import { hasConsent, fallbackAllowed, CONSENT_VERSION } from '../lib/assistantConsent';
import { createAudio, LiveCall, fetchToken, liveDayExceeded, bumpLiveDay, postLiveEnd, SilenceWatch, type LiveHandlers } from '../lib/geminiLive';
import { wrongScript, namesOwner, usesWe, looksEnglish, SCRIPTED_WE } from '../lib/scriptGuard';
import { writeVoiceSession, clearVoiceSession, downloadTranscript, printTranscript } from '../lib/voiceSession';
import RequestWizard, { loadWizardDraft, type WizDraft } from './RequestWizard';
import { guardFields, prefetchFormToken } from '../lib/formGuard';
import ContactCapture, { type CaptureResult } from './ContactCapture';
import { CAPTURE_UI } from './i18n/capture';

const cleanName = (v: string) => v.replace(/[^\p{L}\s.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Salutation = 'm' | 'f' | 'none';
interface Visitor { firstName: string; lastName: string; salutation: Salutation }
const NO_VISITOR: Visitor = { firstName: '', lastName: '', salutation: 'none' };

/** Name as used in the short acknowledgement; '' means use the neutral line (Greek vocative is left to the model). */
function ackName(lang: Lang, v: Visitor): string {
  const { firstName: f, lastName: l, salutation: s } = v;
  // Never first + last together; never guess gender; names stay as written.
  if (lang === 'tr') return !f ? '' : s === 'm' ? `${f} Bey` : s === 'f' ? `${f} Hanım` : '';
  if (lang === 'de') return l && s === 'm' ? `Herr ${l}` : l && s === 'f' ? `Frau ${l}` : '';
  if (lang === 'en') return l && s === 'm' ? `Mr ${l}` : l && s === 'f' ? `Ms ${l}` : s === 'none' ? f : '';
  return '';
}

interface Turn { role: 'user' | 'assistant'; text: string; at: number }
type Phase = 'consent' | 'preparing' | 'queue' | 'blocked' | 'live' | 'card' | 'idle' | 'listening' | 'thinking' | 'speaking';
interface Card { service: string; business: string; city: string; firstName: string; lastName: string; phone: string; email: string; notes: string }
const LIVE_SECONDS = 300;   // owner 2026-11-20: 5 minutes, complete conversations; internal soft limit, never shown
const LANG_EN: Record<string, string> = { tr: 'Turkish', de: 'German', el: 'Greek', en: 'English' };
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Elapsed call time mm:ss; mounted only while the call is live, one interval, cleared on unmount. */
function CallClock({ label }: { label: string }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setSec(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0'), ss = String(sec % 60).padStart(2, '0');
  return <span aria-label={label} title={label} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: 'var(--lq-silver)', border: '1px solid var(--lq-line)', borderRadius: 999, padding: '2px 10px' }}>{mm}:{ss}</span>;
}

export default function VoiceIntake({ lang }: { lang: Lang }) {
  const t = VOICE_UI[lang];
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('consent');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [interim, setInterim] = useState('');
  const [typed, setTyped] = useState(false);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [nameDone, setNameDone] = useState(false);
  const [queuePos, setQueuePos] = useState(1);
  const [blockedMsg, setBlockedMsg] = useState('');
  const [reconnecting, setReconnecting] = useState(false);
  const [graceUi, setGraceUi] = useState(false);
  const [liveSpeak, setLiveSpeak] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [, setCardBusy] = useState(false);
  const [, setCardSent] = useState(false);
  const [, setCardErr] = useState('');
  const [vFirst, setVFirst] = useState('');
  const [vLast, setVLast] = useState('');
  const [vSal, setVSal] = useState<Salutation>('none');
  const [offer, setOffer] = useState(false);   // contact card during the call (offered once)
  const [capEnd, setCapEnd] = useState(false);   // end-screen summary field expanded
  const [captured, setCaptured] = useState<CaptureResult | null>(null);
  const offeredRef = useRef(false);
  const [gate, setGate] = useState(false);   // the in-call card is the mandatory "confirm to continue" gate
  const cardRef = useRef<'none' | 'gate' | 'done'>('none');   // 'gate': call waits (mic muted, no model turns, timers paused)
  const gateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gateWait = useRef(false);
  const gateForce = useRef(false);   // the model called offer_summary
  const enCorr = useRef(0);
  const [dl, setDl] = useState(false);
  const [dFirst, setDFirst] = useState('');
  const [dLast, setDLast] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dSend, setDSend] = useState(false);
  const [dBusy, setDBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicSel] = useState(getMicId);
  const [pick, setPick] = useState<{ mics: MediaDeviceInfo[]; spks: MediaDeviceInfo[]; mic: string; spk: string } | null>(null);   // pre-call device chooser
  const pickResolve = useRef<((r: { mic: string; spk: string } | null) => void) | null>(null);
  const sinkRef = useRef('');
  const devOff = useRef<(() => void) | null>(null);
  const [level, setLevel] = useState(0);   // live microphone level 0..1
  const [prep, setPrep] = useState(0);   // combined Whisper + Piper readiness, %
  const [prepSlow, setPrepSlow] = useState(false);   // preparing > 25 s

  const dialogRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<Listening | null>(null);
  const startedAt = useRef(0);
  const turnsRef = useRef<Turn[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const phaseRef = useRef<Phase>('consent');
  const interimRef = useRef('');
  const sessionRef = useRef(0);        // bumped on open/close: stale async work is ignored
  const speakTok = useRef(0);
  const autoRef = useRef(true);        // hands-free listening allowed
  const deniedRef = useRef(false);
  const typedRef = useRef(false);
  const inFlight = useRef(false);
  const emptyRuns = useRef(0);
  const unavailSaid = useRef(false);
  const manualStop = useRef(false);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visitorRef = useRef<Visitor>(NO_VISITOR);
  const preConsent = useRef(false);   // consent already given earlier in this browser session
  const deletedRef = useRef(false);
  const callRef = useRef<LiveCall | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const slotRef = useRef('');
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef(0);        // absolute end of the 120 s window; set at the first transcript, kept across reconnects
  const endingRef = useRef(false);
  const finishPending = useRef(false);
  const abuseRef = useRef(false);
  const spokeRef = useRef(false);      // visitor spoke at least once in this call (counts against the daily limit)
  const watchRef = useRef<SilenceWatch | null>(null);
  const silenceEndRef = useRef<() => void>(() => {});
  const draining = useRef(false);
  const softSent = useRef(false);
  const endReasonRef = useRef('');          // finish_tool | time_limit | go_away | ws_close:<code> | error:<short> | user_hangup | abuse | language
  const endedAtRef = useRef(0);
  const talkStart = useRef(0);
  const timingRef = useRef<{ lastAudioChunkAt: number; lastTurnCompleteAt: number; playbackDoneAt: number } | null>(null);
  const wrapSent = useRef(false);
  const goAway = useRef(false);
  const limitAt = useRef(0);
  const reconnected = useRef(false);
  const voiceStarted = useRef(false);   // startVoice runs once per call (idempotent against re-renders / double events)
  const liveRole = useRef<'user' | 'assistant' | null>(null);
  const outBuf = useRef('');
  const liveTail = useRef({ user: '', assistant: '' });   // unclosed <...>/{...}/[...] fragment held back between transcript chunks
  const closingTimer = useRef<ReturnType<typeof setInterval> | null>(null);   // 8 s of silence after the thanks -> farewell
  const pendingFix = useRef('');   // queued model correction, sent after the turn and its audio ended
  const liveCut = useRef(false);   // last assistant bubble was interrupted
  const corrections = useRef(0);
  const nameResolve = useRef<() => void>(() => {});
  const lastLevel = useRef(0);
  const voiceId = useRef<{ id: string; secret: string } | null>(null);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const listenRef = useRef<() => void>(() => {});
  typedRef.current = typed;
  interimRef.current = interim;

  const goPhase = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const stopSpeech = useCallback(() => {
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
    stopPiper();
  }, []);

  const releaseSlot = useCallback(() => {
    const id = slotRef.current; slotRef.current = '';
    if (id) postLiveEnd(id, abuseRef.current);
  }, []);

  /** Closes the live call, the microphone and the audio context, and frees the server slot. */
  const endLive = useCallback(() => {
    if (hbRef.current) { clearInterval(hbRef.current); hbRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    watchRef.current?.stop(); watchRef.current = null;
    if (gateTimer.current) { clearTimeout(gateTimer.current); gateTimer.current = null; } cardRef.current = 'none'; gateWait.current = false;
    devOff.current?.(); devOff.current = null;
    if (closingTimer.current) { clearInterval(closingTimer.current); closingTimer.current = null; }
    if (callRef.current && !endedAtRef.current) { endedAtRef.current = Date.now(); timingRef.current = callRef.current.timing(); if (!endReasonRef.current) endReasonRef.current = 'user_hangup'; }
    callRef.current?.close(); callRef.current = null;
    streamRef.current?.getTracks().forEach((x) => x.stop()); streamRef.current = null;
    const c = ctxRef.current; ctxRef.current = null; c?.close().catch(() => {});
    releaseSlot();
  }, [releaseSlot]);

  const teardown = useCallback(() => {
    endLive();
    pickResolve.current?.(null); pickResolve.current = null; setPick(null);
    sessionRef.current++;
    autoRef.current = false;
    recRef.current?.cancel();
    recRef.current = null;
    stopSpeech();
  }, [stopSpeech, endLive]);

  /** Upsert the conversation on the server; id+secret are remembered in localStorage for the contact form. */
  const saveSession = useCallback((): Promise<{ id: string; secret: string } | null> => {
    const all = turnsRef.current;
    if (deletedRef.current) return Promise.resolve(null);
    if (!all.some((x) => x.role === 'user')) return Promise.resolve(voiceId.current);
    saveChain.current = saveChain.current.then(async () => {
      try {
        const r = await fetch('/api/voice/session', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, turns: turnsRef.current.slice(0, 30), startedAt: startedAt.current, endedAt: Date.now(), ...(endedAtRef.current ? { durationSec: Math.max(0, Math.round((endedAtRef.current - (talkStart.current || startedAt.current)) / 1000)), endReason: endReasonRef.current, timings: timingRef.current } : {}), consent: true, ...visitorRef.current, ...(voiceId.current ?? {}) }),
        });
        if (!r.ok || deletedRef.current) return null;
        const j = await r.json() as { id: string; secret: string };
        voiceId.current = j;
        writeVoiceSession(j.id, j.secret);
        return j;
      } catch { return null; }
    });
    return saveChain.current as Promise<{ id: string; secret: string } | null>;
  }, [lang]);

  const close = useCallback(() => { void saveSession(); teardown(); setOpen(false); }, [teardown, saveSession]);

  useEffect(() => {
    const onOpen = () => {
      endLive(); liveTail.current = { user: '', assistant: '' };
      turnsRef.current = [];
      setTurns([]); setInterim(''); setText(''); setNotice(null); setTyped(false);
      sessionRef.current++; autoRef.current = true; deniedRef.current = false; inFlight.current = false;
      emptyRuns.current = 0; manualStop.current = false; unavailSaid.current = false;
      visitorRef.current = NO_VISITOR; setVFirst(''); setVLast(''); setVSal('none'); setNameDone(false); voiceId.current = null; deletedRef.current = false;
      deadlineRef.current = 0; endReasonRef.current = ''; endedAtRef.current = 0; talkStart.current = 0; wrapSent.current = false; goAway.current = false; limitAt.current = 0; endingRef.current = false; finishPending.current = false; abuseRef.current = false; spokeRef.current = false; draining.current = false; softSent.current = false; reconnected.current = false; voiceStarted.current = false; setGraceUi(false);
      liveRole.current = null; liveCut.current = false; outBuf.current = ''; corrections.current = 0; setReconnecting(false); setCard(null); setCardSent(false); setCardErr(''); setCardBusy(false);
      preConsent.current = hasConsent('voice'); setDl(false); setConfirmDel(false); offeredRef.current = false; gateForce.current = false; enCorr.current = 0; setOffer(false); setGate(false); setCapEnd(false); setCaptured(null);
      goPhase('consent'); startedAt.current = Date.now(); setOpen(true);
      if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('voicedemo')) {
        const n = Date.now();
        turnsRef.current = [
          { role: 'assistant', text: stripMarkup(t.greeting), at: n - 90000 },
          { role: 'assistant', text: t.afterSkip, at: n - 60000 },
          { role: 'user', text: lang === 'tr' ? 'Berber salonum için online randevu sistemi arıyorum.' : 'I am looking for an online booking system for my salon.', at: n - 30000 },
        ];
        setTurns(turnsRef.current); setInterim(lang === 'tr' ? 'müşterilerim Almanca da konuşuyor' : 'my customers also speak German'); goPhase('listening');
      }
    };
    window.addEventListener('cw:open-voice', onOpen);
    return () => window.removeEventListener('cw:open-voice', onOpen);
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  // Release the microphone as soon as the page is hidden.
  useEffect(() => {
    if (!open) return;
    const h = () => {
      if (!document.hidden) return;
      autoRef.current = false;
      const r = recRef.current; recRef.current = null; r?.cancel();
      stopSpeech();
      if (phaseRef.current === 'listening' || phaseRef.current === 'speaking') goPhase('idle');
    };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [open, stopSpeech]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('button, input')?.focus();
    return () => { document.body.style.overflow = prevOverflow; prev?.focus?.(); };
  }, [open]);

  useEffect(() => {
    if (!open || turns.length === 0) return;
    const h = setTimeout(() => { void saveSession(); }, 2500);
    return () => clearTimeout(h);
  }, [open, turns, saveSession]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [turns, interim]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]');
    if (!f || f.length === 0) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /** Speaks with Piper (sentence N+1 is synthesized in a worker while N plays). Resolves true if it ended or was skipped (text stays), false if interrupted. */
  const speak = useCallback(async (msg: string): Promise<boolean> => {
    stopSpeech();
    const my = ++speakTok.current;
    goPhase('speaking');
    const done = await speakPiper(msg, lang);
    const completed = done && speakTok.current === my && phaseRef.current === 'speaking';
    if (completed) goPhase('idle');
    return completed;
  }, [lang, stopSpeech]);

  const addTurn = (role: Turn['role'], msg: string) => {
    turnsRef.current = [...turnsRef.current, { role, text: role === 'assistant' ? stripMarkup(msg) : msg, at: Date.now() }];   // delivery tags are spoken, never shown
    setTurns(turnsRef.current);
  };

  const listenIfAllowed = (sid: number) => {
    // 300 ms after our own audio has fully ended, so the microphone never hears the assistant.
    setTimeout(() => {
      if (piperBusy()) { listenIfAllowed(sid); return; }
      if (sid === sessionRef.current && autoRef.current && !deniedRef.current && !typedRef.current && phaseRef.current === 'idle') listenRef.current();
    }, 300);
  };

  const ask = useCallback(async (msg: string) => {
    if (inFlight.current) return;        // at most one request in flight
    inFlight.current = true;
    const sid = sessionRef.current;
    addTurn('user', msg);
    goPhase('thinking');
    let reply = t.aiError;
    let ok = false, silent = false;
    try {
      const r = await fetch('/api/assistant/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          voice: true,
          visitor: visitorRef.current,
          messages: turnsRef.current.map((x) => ({ role: x.role, content: x.text })),
        }),
      });
      if (r.ok) {
        const data = await r.json() as { message?: string };
        if (data.message) { reply = data.message; ok = true; }
      } else if (r.status === 503) { reply = t.aiUnavailable; if (unavailSaid.current) silent = true; unavailSaid.current = true; }
    } catch { /* keep fallback reply */ }
    inFlight.current = false;
    if (sid !== sessionRef.current) return;
    if (!ok) autoRef.current = false;    // no hands-free loop on errors
    addTurn('assistant', reply);
    if (silent) { goPhase('idle'); return; }   // "assistant unavailable" is spoken only once
    if (phaseRef.current === 'listening') return;   // never talk over the visitor
    if (await speak(reply)) listenIfAllowed(sid);
    else if (!ok && sid === sessionRef.current && phaseRef.current === 'speaking') goPhase('idle');
  }, [lang, speak, t.aiError, t.aiUnavailable]);

  const startListening = async () => {
    if (inFlight.current) return;
    if (!sttReady()) { setNotice(t.sttWait); goPhase('idle'); return; }
    const sid = sessionRef.current;
    recRef.current?.cancel();
    recRef.current = null;
    stopSpeech();
    setNotice(null);
    manualStop.current = false;
    let rec: Listening;
    try { rec = await listenOnce(lang, (v) => setLevel(Math.min(1, v * 8))); } catch { deniedRef.current = true; autoRef.current = false; toTextChat(t.deniedToText); return; }
    if (sid !== sessionRef.current) { rec.cancel(); return; }
    recRef.current = rec;
    goPhase('listening');
    const heard = (await rec.result).trim();
    if (recRef.current !== rec || sid !== sessionRef.current) return;
    recRef.current = null;
    setInterim(''); setLevel(0);
    if (heard) {
      emptyRuns.current = 0;
      if (sttSlow()) { toTextChat(t.sttSlow); return; }
      void ask(heard);
      return;
    }
    if (manualStop.current) { autoRef.current = false; goPhase('idle'); return; }
    emptyRuns.current++;
    if (emptyRuns.current >= 2) { autoRef.current = false; setNotice(t.silenceHint); goPhase('idle'); return; }
    goPhase('idle');
    if (autoRef.current) setTimeout(() => listenIfAllowed(sid), 300);
    else setNotice((n) => n ?? t.noSpeech);
  };
  listenRef.current = startListening;

  // ── Fallback (last resort): Whisper + Groq + Piper, with the live transcript as history ────────
  const startFallback = async (note?: string) => {
    const sid = sessionRef.current;
    // Optional consent not given (owner, 2026-11-19): no backup provider; the call ends and the summary card offers what was collected
    if (!fallbackAllowed()) { endLive(); setReconnecting(false); setNotice(t.fallbackOff); await toCard(); return; }
    endLive();
    autoRef.current = true; deniedRef.current = false; emptyRuns.current = 0;
    setReconnecting(false);
    goPhase('preparing'); setPrep(0); setPrepSlow(false); setNameDone(true);
    if (note) setNotice(note);
    if (!sttCapable()) { toTextChat(t.deniedToText); return; }
    unlockAudio();
    try { setMics(await micInputs()); } catch { /* labels only */ }
    // READY GATE: nothing is spoken until Whisper AND the Piper voice are loaded and Piper has done a warm-up synthesis.
    let stt = 0, tts = 0;
    const show = () => { if (sid === sessionRef.current) setPrep(Math.round((stt + tts) / 2)); };
    const slowT = setTimeout(() => { if (sid === sessionRef.current) setPrepSlow(true); }, 25000);
    const [sOk] = await Promise.all([prepareStt((p) => { stt = p; show(); }), readyPiper(lang, (p) => { tts = p; show(); })]);
    clearTimeout(slowT);
    if (sid !== sessionRef.current) return;
    if (!sOk) { toTextChat(t.sttFailed); return; }
    setPrep(100); setPrepSlow(false);
    goPhase('idle');
    if (turnsRef.current.length === 0) {
      const n = ackName(lang, visitorRef.current);
      const msg = n ? t.afterName.replace('{name}', n) : t.afterSkip;
      addTurn('assistant', msg);
      await speak(msg);
    }
    if (sid === sessionRef.current && phaseRef.current === 'idle') listenIfAllowed(sid);
  };

  // ── Live call (Gemini Live) ─────────────────────────────────────────────────────────────────
  const addLive = (role: 'user' | 'assistant', raw: string) => {
    const c = cleanLive(liveTail.current[role], raw); liveTail.current[role] = c.tail;
    const text = c.text;
    if (!text.trim()) return;   // a chunk that was only a control token shows nothing
    if (liveRole.current !== role && !/[\p{L}\p{N}]/u.test(text)) return;   // never open an empty / punctuation-only bubble
    if (role === 'user') liveCut.current = false;
    const r = addLiveChunk(turnsRef.current, role, text, liveRole.current === role, liveCut.current);
    turnsRef.current = r.turns; liveRole.current = role;
    if (role === 'assistant') { const l = turnsRef.current[turnsRef.current.length - 1]; const w = writtenBrand(l.text); if (w !== l.text) turnsRef.current = [...turnsRef.current.slice(0, -1), { ...l, text: w }]; }
    if (r.cutUsed || role === 'user') liveCut.current = false;
    setTurns(turnsRef.current);
  };

  const toCard = async () => {
    const sid = sessionRef.current;
    const heard = turnsRef.current.filter((x) => x.role === 'user');
    if (heard.length === 0) { close(); return; }
    goPhase('card'); setCard(null); setCardBusy(true); setCardErr('');
    let f: Partial<Card> = {};
    try {
      const r = await fetch('/api/voice/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, consent: true, consentVersion: CONSENT_VERSION, groqOk: fallbackAllowed(), transcript: turnsRef.current.map((x) => ({ role: x.role, text: x.text })) }),
      });
      if (r.ok) f = ((await r.json()) as { fields: Partial<Card> }).fields;
    } catch { /* an empty card is still editable */ }
    if (sid !== sessionRef.current) return;
    const v = visitorRef.current;
    const merged: Card = { service: f.service ?? '', business: f.business ?? '', city: f.city ?? '', firstName: v.firstName || f.firstName || '', lastName: v.lastName || f.lastName || '', phone: f.phone ?? '', email: f.email ?? '', notes: f.notes ?? '' };
    visitorRef.current = { ...v, firstName: merged.firstName, lastName: merged.lastName };
    void saveSession();
    setCard(merged); setCardBusy(false);
  };

  const endCall = () => {
    if (endingRef.current) return;
    endingRef.current = true;
    endLive();
    if (abuseRef.current) { void saveSession(); setBlockedMsg(t.chatEnded); goPhase('blocked'); return; }   // no summary card after an abusive call
    void toCard();
  };

  const drain = () => {
    if (draining.current) return;
    draining.current = true;
    const c = callRef.current;
    if (!c) { setTimeout(endCall, 700); return; }
    c.hold(true);   // mic muted; the end waits for the assistant's whole spoken turn (see shouldEnd)
    // normal goodbye (finish_tool only): 5 s grace with a live mic so the visitor can say thanks; not after abuse/language/limits/errors
    const grace = endReasonRef.current === 'finish_tool' && !abuseRef.current;
    void c.whenReallyDone().then(async () => {
      if (grace && callRef.current === c && !endingRef.current) {
        endReasonRef.current = 'finish_tool+grace'; setGraceUi(true);
        await c.whenGraceDone();
      }
      endCall();
    });
  };

  const WRAP = 'WRAP_UP: the call time is over. Finish your current sentence, summarise briefly what was confirmed, then say the closing sentence exactly as instructed, completely with the farewell, and only then call finish_conversation with reason done as your very last action.';
  /** Soft limit / goAway: ask the model to wrap up, only while it is quiet (a text message would interrupt its speech). */
  const wrapNow = () => {
    const c = callRef.current;
    if (!c || wrapSent.current || finishPending.current || c.busy()) return;
    wrapSent.current = true; c.sendText(WRAP);
  };

  const startTimerOnce = () => {
    if (deadlineRef.current) return;
    talkStart.current = Date.now();
    deadlineRef.current = Date.now() + LIVE_SECONDS * 1000;
    timerRef.current = setInterval(() => {
      const left = Math.ceil((deadlineRef.current - Date.now()) / 1000);
      const c = callRef.current;
      if (finishPending.current) return;
      if (cardRef.current === 'gate') { deadlineRef.current += 500; return; }   // the call waits for the contact card
      if (left <= 25 && !softSent.current && c && !c.busy()) {
        softSent.current = true;
        c.sendText('TIME_UP: the call time is almost over. Finish your current sentence, summarise what was confirmed, then say the closing sentence exactly as instructed, completely with the farewell, then call finish_conversation with reason done as your very last action.');
      }
      if (left > 0 && !goAway.current) return;
      if (!c) { endReasonRef.current ||= goAway.current ? 'go_away' : 'time_limit'; endCall(); return; }
      if (!limitAt.current) { limitAt.current = Date.now(); endReasonRef.current ||= goAway.current ? 'go_away' : 'time_limit'; }
      wrapNow();
      // safety only: the model never finished its closing 60 s after the limit and is silent now
      if (Date.now() - limitAt.current > 60000 && !c.busy()) { finishPending.current = true; drain(); }
    }, 500);
  };

  const silenceEnd = () => {
    endReasonRef.current ||= 'error:silence';
    setNotice(t.silenceEnd);
    if (turnsRef.current.some((x) => x.role === 'user')) { endCall(); return; }
    endingRef.current = true; endLive(); setBlockedMsg(t.silenceEnd); goPhase('blocked');
  };
  silenceEndRef.current = silenceEnd;

  /** Contact-card gate (owner 2026-11-24): after the visitor's 3rd substantive turn (or offer_summary), once the assistant's turn and audio ended:
   *  mute the mic, show the card and have the assistant say the scripted sentence. Deterministic on the client, not up to the model. */
  const gateStart = () => {
    const c = callRef.current;
    if (!c || phaseRef.current !== 'live' || offeredRef.current || gateWait.current || finishPending.current || endingRef.current || closingTimer.current || softSent.current || wrapSent.current) return;
    const n = turnsRef.current.filter((x) => x.role === 'user' && (x.text.match(/\p{L}+/gu) ?? []).length >= 2).length;
    if (!gateForce.current && n < 3) return;
    gateWait.current = true;
    void c.whenPlaybackDone(15000).then(() => {
      gateWait.current = false;
      if (callRef.current !== c || offeredRef.current || finishPending.current || endingRef.current || c.busy()) return;   // busy: the next turnComplete retries
      offeredRef.current = true; cardRef.current = 'gate'; c.pauseMic(true); watchRef.current?.heard();
      setGate(true); setOffer(true);
      c.sendText(`CARD_SCRIPT: say exactly this sentence, word for word, nothing else: "${CAPTURE_UI[lang].gate}"`);
      gateTimer.current = setTimeout(() => declineGate(), 60000);
    });
  };
  /** "Not now" or 60 s without action: short goodbye, end the call, open the request form prefilled with everything gathered. */
  const declineGate = () => {
    if (cardRef.current !== 'gate') return;
    cardRef.current = 'none'; if (gateTimer.current) { clearTimeout(gateTimer.current); gateTimer.current = null; }
    setOffer(false); setGate(false);
    const c = callRef.current;
    if (!c || endingRef.current) return;
    endReasonRef.current ||= 'card_declined'; finishPending.current = true;
    c.sendText(`CARD_DECLINED: say exactly this sentence, word for word, nothing else: "${CAPTURE_UI[lang].bye}"`);
    drain();
  };

  /** Opens the socket with a token and wires the handlers. `call` is compared in onClosed so stale sockets are ignored. */
  const openCall = async (token: string) => {
    const sid = sessionRef.current;
    const ref: { c: LiveCall | null } = { c: null };
    if (!watchRef.current) watchRef.current = new SilenceWatch(
      () => finishPending.current || cardRef.current === 'gate' || !callRef.current || callRef.current.speaking(),   // paused while the assistant talks, on reconnect and while closing
      () => callRef.current?.sendText(`The visitor has been silent for a while. Gently check in ${LANG_EN[lang]}, in one short sentence, whether they are still there.`),
      () => silenceEndRef.current(),
    );
    const h: LiveHandlers = {
      onInput: (x) => {
        startTimerOnce(); addLive('user', x);
        if (closingTimer.current) { clearInterval(closingTimer.current); closingTimer.current = null; }   // the visitor spoke: the model answers with its farewell itself
        watchRef.current?.heard();
        if (!spokeRef.current) { spokeRef.current = true; bumpLiveDay(); }   // only calls where the visitor actually spoke count
      },
      onOutput: (x) => {
        startTimerOnce(); addLive('assistant', x); watchRef.current?.start();
        outBuf.current += x;
        // corrections are queued, never sent mid-turn: text sent while the model speaks interrupts it (cut sentence, new one starts)
        if (corrections.current < 2 && wrongScript(outBuf.current, lang)) {
          corrections.current++; outBuf.current = '';
          pendingFix.current = `Answer only in ${LANG_EN[lang]}, using only its alphabet. Repeat your last answer in ${LANG_EN[lang]}.`;
        } else if (enCorr.current < 2 && looksEnglish(outBuf.current, lang)) {
          enCorr.current++; outBuf.current = '';
          pendingFix.current = `Answer only in ${LANG_EN[lang]} from now on. Say your last answer again in ${LANG_EN[lang]}, in one short sentence, and never use English.`;
        } else if (corrections.current < 2 && namesOwner(outBuf.current)) {
          corrections.current++; outBuf.current = '';
          /* no mid-call nudge: a sent text makes the model speak an extra, unprompted sentence; the prompt rule covers this */
        } else if (corrections.current < 2 && usesWe(outBuf.current.replace(SCRIPTED_WE, ''), lang)) {
          corrections.current++; outBuf.current = '';
          /* no mid-call nudge: a sent text makes the model speak an extra, unprompted sentence; the prompt rule covers this */
        }
      },
      onInterrupted: () => { liveCut.current = turnsRef.current[turnsRef.current.length - 1]?.role === 'assistant'; liveRole.current = null; outBuf.current = ''; },
      onTurnComplete: () => { liveRole.current = null; outBuf.current = ''; const fix = pendingFix.current; pendingFix.current = ''; const fc = callRef.current; if (fix && fc && !finishPending.current && cardRef.current !== 'gate') void fc.whenPlaybackDone().then(() => { if (callRef.current === fc && !finishPending.current && !fc.busy()) fc.sendText(fix); }); liveTail.current = { user: '', assistant: '' }; if (finishPending.current && abuseRef.current) drain(); gateStart(); },
      onFinish: (reason) => {
        if (reason === 'closing') {   // thanks said, not the end: wait for the visitor; after ~8 s of silence ask for the short farewell
          if (closingTimer.current) clearInterval(closingTimer.current);
          let quiet = 0, asked = false;
          const closingStart = Date.now();
          // hard stops (owner 2026-11-23): 20 s of silence after the thanks ends the call; a goodbye ping-pong (e.g. a caller's own AI
          // answering every farewell) ends after 45 s at the latest
          const forceEnd = (why: string) => { if (closingTimer.current) clearInterval(closingTimer.current); closingTimer.current = null; endReasonRef.current ||= why; finishPending.current = true; drain(); };
          closingTimer.current = setInterval(() => {
            const c = callRef.current;
            if (!c || finishPending.current) { if (closingTimer.current) clearInterval(closingTimer.current); closingTimer.current = null; return; }
            if (Date.now() - closingStart > 45000 && !c.busy()) { forceEnd('closing_cap'); return; }
            if (c.busy()) { quiet = 0; return; }
            quiet += 250;
            if (quiet >= 20000) { forceEnd('closing_silence'); return; }
            if (quiet >= 8000 && !asked) { asked = true; c.sendText('The visitor stayed silent. Say your short farewell now, then call finish_conversation with reason done as your very last action.'); }
          }, 250);
          return;
        }
        if (reason === 'abuse') { abuseRef.current = true; endReasonRef.current = 'abuse'; } else if (reason === 'language') endReasonRef.current = 'language'; else endReasonRef.current ||= 'finish_tool';
        finishPending.current = true; if (reason === 'abuse') setTimeout(drain, 3000); else drain();
      },
      onOffer: () => { gateForce.current = true; gateStart(); },
      onGoAway: () => { goAway.current = true; wrapNow(); },
      onLevel: (rms) => { const n = performance.now(); if (n - lastLevel.current > 80) { lastLevel.current = n; setLevel(Math.min(1, rms * 8)); } },
      onClosed: (_clean, code) => {
        if (callRef.current !== ref.c || endingRef.current || sid !== sessionRef.current) return;
        const finishing = finishPending.current || goAway.current || (!!deadlineRef.current && Date.now() >= deadlineRef.current);
        // never cut the assistant: let the audio already received play out before ending or reconnecting
        void ref.c?.whenPlaybackDone(45000).then(() => {
          if (callRef.current !== ref.c || endingRef.current || sid !== sessionRef.current) return;
          if (finishing) { endReasonRef.current ||= `ws_close:${code}`; setTimeout(endCall, 500); return; }
          void reconnect();
        });
      },
    };
    const c = new LiveCall(ctxRef.current!, streamRef.current!, h);
    ref.c = c; callRef.current = c;
    await c.connect(token);
  };

  /** ONE reconnect with a fresh token and the transcript as context; if that fails, hand over to the fallback pipeline. */
  const reconnect = async () => {
    const sid = sessionRef.current;
    callRef.current?.close(); callRef.current = null;
    if (reconnected.current) { await startFallback(t.fallbackNote); return; }
    reconnected.current = true;
    if (import.meta.env.DEV) console.debug('[live] reconnect');
    setReconnecting(true);
    const r = await fetchToken({ lang, consent: true, consentVersion: CONSENT_VERSION, visitor: { ...visitorRef.current, hour: new Date().getHours() }, prevSessionId: slotRef.current, transcript: turnsRef.current.map((x) => ({ role: x.role, text: x.text })) });
    if (sid !== sessionRef.current || endingRef.current) return;
    if (r.kind !== 'ok') { await startFallback(t.fallbackNote); return; }
    slotRef.current = r.t.sessionId;
    try { await openCall(r.t.token); } catch { if (sid === sessionRef.current) await startFallback(t.fallbackNote); return; }
    liveRole.current = null; setReconnecting(false);
    (callRef.current as LiveCall | null)?.sendText('RESUME');
  };

  const startVoice = async () => {
    if (voiceStarted.current) return;
    voiceStarted.current = true;
    unlockAudio();   // on the click: also wakes the output device for the fallback voice
    const sid = sessionRef.current;
    const supported = !!navigator.mediaDevices?.getUserMedia && 'AudioWorklet' in window;
    // mic + AudioContext start synchronously inside the click (iOS Safari drops the gesture after any await)
    const micP = supported ? openMic() : null;
    micP?.catch(() => {});
    const audioP = supported ? createAudio() : null;
    audioP?.catch(() => {});
    goPhase('preparing'); setPrep(0); setPrepSlow(false); setNameDone(false); setNotice(null);
    if (await liveDayExceeded()) {
      micP?.then((s) => s.getTracks().forEach((x) => x.stop())).catch(() => {});
      audioP?.then((c) => c.close()).catch(() => {});
      setBlockedMsg(t.dayLimit); goPhase('blocked'); return;
    }
    if (!micP || !audioP) {
      if (window.isSecureContext === false) { toTextChat(t.insecureMic); return; }
      await startFallback(); return;
    }
    const named = new Promise<void>((r) => { nameResolve.current = r; });
    try {
      streamRef.current = await micP;
      const micLost = () => {   // mic unplugged / permission revoked mid-call
        if (endingRef.current || finishPending.current || !callRef.current) return;
        endReasonRef.current ||= 'error:mic_ended'; finishPending.current = true; setNotice(t.micGone); drain();
      };
      streamRef.current?.getAudioTracks()[0]?.addEventListener('ended', micLost);
      const devs = await micInputs();
      setMics(devs);
      const onDev = async () => {   // Safari may not fire 'ended': check that the active device still exists
        const tr = streamRef.current?.getAudioTracks()[0]; if (!tr) return;
        const gid = tr.getSettings().groupId, now = await micInputs();
        if (tr.readyState === 'ended' || (gid && now.length && !now.some((d) => d.groupId === gid))) micLost();
      };
      navigator.mediaDevices.addEventListener?.('devicechange', onDev);
      devOff.current = () => navigator.mediaDevices.removeEventListener?.('devicechange', onDev);
      // device chooser: only with more than one distinct microphone (phones: no extra click)
      const uniq = (l: MediaDeviceInfo[]) => { const seen = new Set<string>(); return l.filter((d) => { const k = d.groupId || d.deviceId; if (d.deviceId === 'default' || d.deviceId === 'communications' || seen.has(k)) return false; seen.add(k); return true; }); };
      const um = uniq(devs);
      const canSink = typeof AudioContext !== 'undefined' && 'setSinkId' in AudioContext.prototype;
      let us: MediaDeviceInfo[] = [];
      if (canSink) { try { us = uniq((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audiooutput')); } catch { /* none */ } }
      if (um.length > 1) {
        const curG = streamRef.current?.getAudioTracks()[0]?.getSettings().groupId, saved = getMicId();
        const mic = um.find((d) => d.deviceId === saved)?.deviceId ?? um.find((d) => d.groupId === curG)?.deviceId ?? um[0].deviceId;
        let spk = ''; try { spk = localStorage.getItem('cw-spk') ?? ''; } catch { /* private mode */ }
        if (!us.some((d) => d.deviceId === spk)) spk = '';
        const r = await new Promise<{ mic: string; spk: string } | null>((res) => { pickResolve.current = res; setPick({ mics: um, spks: us.length > 1 ? us : [], mic, spk }); });
        pickResolve.current = null; setPick(null);
        if (!r || sid !== sessionRef.current) return;
        setMicId(r.mic);
        try { if (r.spk) localStorage.setItem('cw-spk', r.spk); } catch { /* private mode */ }
        sinkRef.current = r.spk;
        if (r.mic !== mic || streamRef.current?.getAudioTracks()[0]?.readyState === 'ended') {   // other device chosen: reopen (openMic falls back to the default if it is gone)
          streamRef.current?.getTracks().forEach((x) => x.stop());
          streamRef.current = await openMic();
          streamRef.current.getAudioTracks()[0]?.addEventListener('ended', micLost);
        }
      }
    } catch { audioP.then((c) => c.close()).catch(() => {}); if (sid === sessionRef.current) toTextChat(t.deniedToText); return; }
    setPrep(25);
    try { ctxRef.current = await audioP; if (sinkRef.current) await (ctxRef.current as AudioContext & { setSinkId?: (id: string) => Promise<void> }).setSinkId?.(sinkRef.current).catch(() => {}); } catch { if (sid === sessionRef.current) await startFallback(); return; }
    if (sid !== sessionRef.current) { endLive(); return; }
    setPrep(40);
    await named;   // salutation form (optional) is answered or skipped
    if (sid !== sessionRef.current) return;
    // token, with the wait queue when all lines are busy (polling every 5 s)
    let ticket: string | undefined;
    for (;;) {
      const r = await fetchToken({ lang, consent: true, consentVersion: CONSENT_VERSION, visitor: { ...visitorRef.current, hour: new Date().getHours() }, ticket });
      if (sid !== sessionRef.current) return;
      if (r.kind === 'ok') {
        slotRef.current = r.t.sessionId; goPhase('preparing'); setPrep(65);
        try { await openCall(r.t.token); } catch { if (sid === sessionRef.current) await startFallback(); return; }
        break;
      }
      if (r.kind === 'unavailable') { setBlockedMsg(t.voiceUnavailable); goPhase('blocked'); endLive(); return; }
      if (r.kind === 'error') { await startFallback(); return; }
      if (r.kind === 'cap') { setBlockedMsg(r.scope === 'monthly' ? t.queueCapMonthly : t.queueCapDaily); goPhase('blocked'); endLive(); return; }
      ticket = r.ticket; setQueuePos(r.position); goPhase('queue');
      await sleep(5000);
      if (sid !== sessionRef.current) return;
    }
    if (sid !== sessionRef.current) return;
    setPrep(100);
    hbRef.current = setInterval(() => { fetch('/api/voice/live-heartbeat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: slotRef.current }) }).catch(() => {}); }, 25000);
    await sleep(350);   // let the orb show 100 %
    goPhase('live');
    callRef.current?.kickoff();   // idempotent per LiveCall; a reconnect uses RESUME and never kicks off again
  };

  useEffect(() => {
    if (open && preConsent.current) { preConsent.current = false; void startVoice(); }
  });

  // free the server slot if the tab is closed during a call
  useEffect(() => {
    const h = () => { const id = slotRef.current; if (id) postLiveEnd(id, abuseRef.current, true); };
    window.addEventListener('pagehide', h);
    return () => window.removeEventListener('pagehide', h);
  }, []);

  useEffect(() => {
    if (phase !== 'live') return;
    const i = setInterval(() => setLiveSpeak(!!callRef.current?.speaking()), 250);
    return () => clearInterval(i);
  }, [phase]);

  /** Voice is not wanted or not possible: hand over to the text chat widget (it shares the consent). */
  const toTextChat = (note?: string) => {
    close();
    window.dispatchEvent(new CustomEvent('cw:open-assistant', { detail: { note } }));
  };

  /** Salutation form answered (or left empty): remember it, the call may now request its token. */
  const submitSalutation = (e: React.FormEvent) => {
    e.preventDefault();
    const f = cleanName(vFirst), l = cleanName(vLast);
    visitorRef.current = f || l ? { firstName: f, lastName: l, salutation: vSal } : NO_VISITOR;
    setDFirst(f); setDLast(l);
    setNameDone(true);
    nameResolve.current();
  };

  /** Click the last thing you said: it moves back into the text box (with the reply to it removed) so you can fix and resend. */
  const editLast = () => {
    const all = turnsRef.current;
    let i = all.length - 1;
    while (i >= 0 && all[i].role !== 'user') i--;
    if (i < 0 || inFlight.current) return;
    autoRef.current = false; recRef.current?.cancel(); recRef.current = null; stopSpeech();
    setText(all[i].text); turnsRef.current = all.slice(0, i); setTurns(turnsRef.current);
    setTyped(true); goPhase('idle');
  };

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    const m = text.trim();
    if (!m || phase === 'thinking') return;
    autoRef.current = false;
    setText('');
    stopSpeech();
    void ask(m);
  };

  const deleteConversation = async () => {
    deletedRef.current = true;
    const v = voiceId.current;
    teardown();
    clearVoiceSession();
    if (v) {
      try {
        const r = await fetch(`/api/voice/session/${encodeURIComponent(v.id)}`, { method: 'DELETE', headers: { 'x-voice-secret': v.secret } });
        if (!r.ok && r.status !== 404) { setNotice(t.deleteFail); setConfirmDel(false); return; }
      } catch { setNotice(t.deleteFail); setConfirmDel(false); return; }
    }
    voiceId.current = null; turnsRef.current = []; setTurns([]); setConfirmDel(false); setOpen(false);
  };

  const openDownload = () => {
    const v = visitorRef.current;
    setDFirst((x) => x || v.firstName); setDLast((x) => x || v.lastName);
    setNotice(null); setDl(true);
  };

  const doDownload = async () => {
    const email = dEmail.trim();
    const sending = dSend && !!email;
    if (email && !EMAIL_RE.test(email)) { setNotice(t.dlBadEmail); return; }
    downloadTranscript(turnsRef.current, lang, [cleanName(dFirst), cleanName(dLast)].filter(Boolean).join(' '));
    if (!sending) { setDl(false); setNotice(null); return; }
    setDBusy(true);
    let ok = false;
    try {
      const v = await saveSession();
      if (v) {
        const r = await fetch(`/api/voice/session/${encodeURIComponent(v.id)}/request`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...(await guardFields()), secret: v.secret, email, firstName: cleanName(dFirst), lastName: cleanName(dLast), page: window.location.pathname }),
        });
        ok = r.ok;
      }
    } catch { /* ok stays false */ }
    setDBusy(false); setDl(false); setNotice(ok ? t.dlSent : t.dlSendError);
  };

  useEffect(() => { prefetchFormToken(); }, []);
  const finish = async () => {
    const userTurns = turnsRef.current.filter((x) => x.role === 'user');
    if (userTurns.length === 0) { teardown(); setOpen(false); navigate(pagePath(lang, 'contact')); return; }
    endingRef.current = true; teardown(); sessionRef.current++;
    void toCard();
  };

  // Request wizard: restore an unfinished draft (24 h) after a reload; leaving the card phase drops the restored copy.
  const [restored, setRestored] = useState<WizDraft | null>(null);
  useEffect(() => { if (phase !== 'card') setRestored(null); }, [phase]);
  useEffect(() => {
    void loadWizardDraft().then((d) => {
      if (!d || phaseRef.current !== 'consent' || turnsRef.current.length) return;
      const c = d.draft.card;
      voiceId.current = { id: d.id, secret: d.secret };
      setCard({ service: c.service ?? '', business: c.business ?? '', city: c.city ?? '', firstName: c.firstName ?? '', lastName: c.lastName ?? '', phone: c.phone ?? '', email: c.email ?? '', notes: c.notes ?? '' });
      setRestored(d.draft); goPhase('card'); setOpen(true);
    });
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // Written offer (typed chat / fallback voice has no tool call): once, after the third visitor message. Live calls use the offer_summary tool instead.
  useEffect(() => {
    if (!open || offeredRef.current || phase === 'live' || (phase !== 'idle' && phase !== 'speaking')) return;
    if (turns.filter((x) => x.role === 'user').length >= 3) { offeredRef.current = true; setOffer(true); }
  }, [open, phase, turns]);
  const capDemo = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('capdemo');   // dev only: shows the in-call card without a live call
  useEffect(() => { if (capDemo) { setOpen(true); goPhase('live'); setOffer(true); setGate(true); } }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const onCaptured = (r: CaptureResult) => {
    setCaptured(r);
    if (cardRef.current === 'gate') {
      cardRef.current = 'done'; if (gateTimer.current) { clearTimeout(gateTimer.current); gateTimer.current = null; }
      callRef.current?.pauseMic(false); watchRef.current?.heard();
      setTimeout(() => { setOffer(false); setGate(false); }, 4000);
    }
    if (phaseRef.current === 'live') callRef.current?.sendText(`CARD_SENT: say exactly this sentence, word for word, nothing else: "${CAPTURE_UI[lang].thanks}"`);
  };

  const onMic = () => {
    if (phase === 'listening') { manualStop.current = true; recRef.current?.stop(); }
    else if (phase === 'idle' || phase === 'speaking') { autoRef.current = true; emptyRuns.current = 0; startListening(); }
  };

  if (!open) return null;

  const userCount = turns.filter((x) => x.role === 'user').length;
  const lastUser = turns.map((x) => x.role).lastIndexOf('user');
  const btn: React.CSSProperties = {
    borderRadius: 'var(--lq-radius-sm)', padding: '12px 20px', fontSize: 15, cursor: 'pointer',
    border: '1px solid var(--lq-line-strong)', background: 'transparent', color: 'var(--lq-white)', fontFamily: 'inherit',
  };
  const primary: React.CSSProperties = { ...btn, borderRadius: 9999, background: 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))', border: '1px solid var(--c-lilac)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13, fontWeight: 500 };
  const status = phase === 'listening' ? t.listening : phase === 'thinking' ? t.thinking : phase === 'speaking' ? t.speaking : t.tapToSpeak;

  return (
    <div
      ref={dialogRef} className="cw-vdlg" data-lenis-prevent role="dialog" aria-modal="true" aria-label={t.dialog} onKeyDown={onKeyDown}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--lq-abyss)', color: 'var(--lq-white)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px', overflow: 'auto',
      }}
    >
      <style>{`@keyframes cw-vbar{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}@keyframes cw-orb{0%,100%{transform:scale(.92);opacity:.7}50%{transform:scale(1.06);opacity:1}}@media (prefers-reduced-motion:reduce){.cw-orb{animation:none!important}}@media (max-width:640px){.cw-vdlg{height:100vh;height:100dvh}}`}</style>
      <button onClick={close} aria-label={t.close} style={{ ...btn, position: 'absolute', top: 16, right: 16, padding: '8px 14px' }}>
        {t.close} ✕
      </button>

      <span style={{ position: 'absolute', top: 20, left: 20, border: '1px solid var(--c-lilac)', borderRadius: 9999, padding: '4px 12px', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--lq-white)' }}>{t.aiBadge}</span>

      {phase === 'consent' ? (
        <div style={{ margin: 'auto', maxWidth: 560, paddingTop: 40 }}>
          <AssistantConsent lang={lang} mode="voice" primaryAction={{ label: t.allow, run: () => void startVoice() }} secondaryAction={{ label: t.typeInstead, run: () => toTextChat() }} onNavigate={() => { teardown(); setOpen(false); }} />
        </div>
      ) : phase === 'preparing' && pick ? (
        <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 420, paddingTop: 36 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 26px)', fontFamily: 'var(--font-display)', fontWeight: 600, textAlign: 'center' }}>{t.micPickTitle}</h2>
          {([[t.micLabel, 'mic', pick.mics], ...(pick.spks.length ? [[t.spkLabel, 'spk', pick.spks]] : [])] as [string, 'mic' | 'spk', MediaDeviceInfo[]][]).map(([lbl, k, list]) => (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--lq-silver)' }}>
              {lbl}
              <select value={pick[k]} onChange={(e) => setPick({ ...pick, [k]: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15 }}>
                {k === 'spk' && <option value="">{t.micAuto}</option>}
                {list.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `${lbl} ${i + 1}`}</option>)}
              </select>
            </label>
          ))}
          <button type="button" style={primary} onClick={() => pickResolve.current?.({ mic: pick.mic, spk: pick.spk })}>{t.micStart}</button>
        </div>
      ) : phase === 'preparing' ? (
        <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', width: '100%', maxWidth: 560, paddingTop: 36 }}>
          <div style={{ position: 'relative', width: 240, height: 240, borderRadius: '50%', overflow: 'hidden', ['--orb' as string]: '240px' }} role="status" aria-live="polite" aria-label={t.sttPreparing.replace('{pct}', String(prep))}>
            <VoiceOrb bare label={`${prep}%`} onTalk={() => {}} />
            <div aria-hidden style={{ position: 'absolute', inset: '19%', borderRadius: '50%', background: `conic-gradient(var(--c-lilac) ${prep * 3.6}deg, transparent 0)`, WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))', mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))', transition: 'background 200ms linear' }} />
          </div>
          <p style={{ color: 'var(--lq-silver)', fontSize: 15, margin: 0 }}>{t.sttPreparing.replace('{pct}', String(prep))}</p>
          {!nameDone && (
            <form onSubmit={submitSalutation} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <p style={{ color: 'var(--lq-white)', margin: 0, width: '100%', fontSize: 15 }}>{t.salIntro}</p>
              <p style={{ color: 'var(--lq-silver)', margin: 0, width: '100%', fontSize: 13 }}>{t.prepWait}</p>
              {([[vFirst, setVFirst, t.salFirst], [vLast, setVLast, t.salLast]] as const).map(([v, set, ph], i) => (
                <input key={i} value={v} onChange={(e) => set(e.target.value)} placeholder={ph} aria-label={ph} maxLength={40}
                  style={{ flex: 1, minWidth: 150, padding: '10px 14px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15 }} />
              ))}
              <div role="group" aria-label={t.salLegend} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
                {([['m', t.salM], ['f', t.salF], ['none', t.salNone]] as const).map(([k, label]) => (
                  <button key={k} type="button" aria-pressed={vSal === k} onClick={() => setVSal(k)}
                    style={{ ...btn, padding: '8px 14px', fontSize: 14, borderColor: vSal === k ? 'var(--c-lilac)' : 'var(--lq-line-strong)', background: vSal === k ? 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))' : 'transparent' }}>{label}</button>
                ))}
              </div>
              <button type="submit" style={primary}>{t.salStart}</button>
            </form>
          )}
          {notice && <p role="status" style={{ color: 'var(--lq-silver)', fontSize: 13.5, margin: 0 }}>{notice}</p>}
          {prepSlow && <button type="button" onClick={() => toTextChat()} style={btn}>{t.prepSlow}</button>}
        </div>
      ) : phase === 'queue' || phase === 'blocked' ? (
        <div role="status" aria-live="polite" style={{ margin: 'auto', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', alignItems: 'center' }}>
          <div className="cw-orb" aria-hidden style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--lq-gradient)', animation: 'cw-orb 2.4s ease-in-out infinite', opacity: phase === 'blocked' ? 0.35 : 1 }} />
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 26px)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{phase === 'queue' ? t.queueTitle : t.blockedTitle}</h2>
          <p style={{ margin: 0, color: 'var(--lq-silver)', lineHeight: 1.6 }}>{phase === 'queue' ? t.queueText.replace('{pos}', String(queuePos)) : blockedMsg}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" style={btn} onClick={() => toTextChat()}>{t.queueTyping}</button>
            <button type="button" style={primary} onClick={() => { teardown(); setOpen(false); navigate(pagePath(lang, 'contact')); }}>{t.queueForm}</button>
          </div>
        </div>
      ) : phase === 'card' ? (
        <div style={{ margin: 'auto', width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 40 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3.5vw, 28px)', fontFamily: 'var(--font-display)', fontWeight: 600, textAlign: 'center' }}>{t.cardTitle}</h2>
          {!card ? (
            <p role="status" aria-live="polite" style={{ textAlign: 'center', color: 'var(--lq-silver)' }}>{t.extracting}</p>
          ) : (
            <RequestWizard lang={lang} channel={captured?.channel} initial={captured ? { ...card, business: captured.business || card.business, email: captured.email || card.email, phone: captured.phone || card.phone } : card} restored={restored} getSession={async () => voiceId.current ?? await saveSession()} onClose={() => { teardown(); setOpen(false); }} />
          )}
          {card && !captured && (capEnd
            ? <div style={{ alignSelf: 'center', width: '100%' }}><ContactCapture lang={lang} variant="end" summary={[card.service, [card.business, card.city].filter(Boolean).join(', '), card.notes].filter(Boolean).join(' · ')} getSession={async () => voiceId.current ?? await saveSession()} onDone={onCaptured} onDismiss={() => setCapEnd(false)} /></div>
            : <button type="button" style={{ ...btn, alignSelf: 'center', border: 0, color: 'var(--lq-silver)', textDecoration: 'underline', fontSize: 14 }} onClick={() => setCapEnd(true)}>{CAPTURE_UI[lang].endTitle}</button>)}
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: 640, flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 40, minHeight: 0 }}>
          <div ref={logRef} data-lenis-prevent role="log" aria-live="polite" aria-relevant="additions" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {turns.map((x, i) => (
              <div key={i} aria-live={x.role === 'assistant' ? 'polite' : 'off'} style={{ alignSelf: x.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ fontSize: 11, color: 'var(--lq-silver)', marginBottom: 2, textAlign: x.role === 'user' ? 'right' : 'left' }}>
                  {x.role === 'user' ? (visitorRef.current.firstName || t.you) : t.assistant} · {new Date(x.at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--lq-radius-card)', lineHeight: 1.5,
                  background: x.role === 'user' ? 'var(--lq-kelp)' : 'transparent',
                  border: '1px solid var(--lq-line)', color: x.role === 'user' ? 'var(--lq-white)' : 'var(--lq-mist)',
                }}>{x.role === 'user' && i === lastUser && phase !== 'live' ? (
                  <button type="button" onClick={editLast} title={t.editLast} aria-label={`${t.editLast}: ${x.text}`} style={{ all: 'inherit', padding: 0, margin: 0, background: 'none', border: 0, cursor: 'pointer', textAlign: 'inherit', font: 'inherit' }}>{x.text}</button>
                ) : x.text}</div>
              </div>
            ))}
            {interim && (
              <div aria-hidden style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '10px 14px', color: 'var(--lq-silver)', fontStyle: 'italic', opacity: 0.7, border: '1px dashed var(--lq-line)', borderRadius: 'var(--lq-radius-card)' }}>{interim}</div>
            )}
          </div>

          {mics.length > 1 && phase !== 'live' && !pick && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--lq-silver)' }}>
              {t.micLabel}
              <select value={micId} onChange={(e) => { setMicSel(e.target.value); setMicId(e.target.value); }}
                style={{ maxWidth: 260, padding: '6px 10px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 13 }}>
                <option value="">{t.micAuto}</option>
                {mics.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `${t.micLabel} ${i + 1}`}</option>)}
              </select>
            </label>
          )}

          {notice && <p role="status" style={{ color: 'var(--lq-silver)', fontSize: 13.5, margin: 0, textAlign: 'center' }}>{notice}</p>}

          {offer && <div className={gate ? 'cw-gate' : undefined} style={{ alignSelf: 'center', width: '100%', maxWidth: 460, maxHeight: 'min(72vh, 600px)', overflowY: 'auto', flexShrink: 0 }} data-lenis-prevent><ContactCapture lang={lang} variant={gate ? 'gate' : 'card'} demo={capDemo} getSession={async () => voiceId.current ?? await saveSession()} onDone={onCaptured} onDismiss={() => (cardRef.current === 'gate' ? declineGate() : setOffer(false))} /></div>}
          {gate && <style>{`@media (max-width:820px){.cw-gate{max-height:calc(100dvh - 190px)!important}.cw-live-ui,[role=log]{display:none!important}}`}</style>}

          {phase === 'live' ? (
            <div className="cw-live-ui" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', ['--orb' as string]: '150px' }}><VoiceOrb bare label="" onTalk={() => {}} /></div>
              <div aria-hidden style={{ width: 120, height: 4, borderRadius: 2, background: 'var(--lq-line)', overflow: 'hidden' }}>
                <div style={{ width: `${liveSpeak ? 0 : Math.round(level * 100)}%`, height: '100%', background: 'var(--lq-gradient)', transition: 'width 120ms linear' }} />
              </div>
              <CallClock label={t.callTime} />
              <span role="status" aria-live="polite" style={{ color: 'var(--lq-silver)', fontSize: 14 }}>{graceUi ? t.liveEnding : reconnecting ? t.reconnecting : liveSpeak ? t.liveSpeaking : t.liveListening}</span>
            </div>
          ) : typed ? (
            <form onSubmit={submitText} style={{ display: 'flex', gap: 8 }}>
              <input
                value={text} onChange={(e) => setText(e.target.value)} placeholder={t.typePlaceholder} aria-label={t.typePlaceholder}
                maxLength={500} disabled={phase === 'thinking'}
                style={{ flex: 1, padding: '12px 14px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15 }}
              />
              <button type="submit" style={primary} disabled={phase === 'thinking'}>{t.send}</button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div aria-hidden style={{ display: 'flex', gap: 4, alignItems: 'center', height: 32 }}>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} style={{
                    width: 4, height: 28, borderRadius: 2, background: 'var(--lq-gradient)', transformOrigin: 'center',
                    transform: 'scaleY(.25)',
                    animation: phase === 'listening' ? `cw-vbar ${0.6 + (i % 4) * 0.15}s ease-in-out ${i * 0.07}s infinite` : 'none',
                  }} />
                ))}
              </div>
              <button
                onClick={onMic} aria-label={t.mic} aria-pressed={phase === 'listening'} disabled={phase === 'thinking'}
                style={{
                  width: 72, height: 72, borderRadius: '50%', cursor: 'pointer', border: '1px solid var(--lq-line-strong)',
                  background: phase === 'listening' ? 'var(--c-quartz)' : 'var(--lq-kelp)',
                  color: phase === 'listening' ? 'var(--lq-abyss)' : 'var(--lq-white)', display: 'grid', placeItems: 'center',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              </button>
              <div aria-hidden style={{ width: 120, height: 4, borderRadius: 2, background: 'var(--lq-line)', overflow: 'hidden', opacity: phase === 'listening' ? 1 : 0.3 }}>
                <div style={{ width: `${phase === 'listening' ? Math.round(level * 100) : 0}%`, height: '100%', background: 'var(--lq-gradient)', transition: 'width 120ms linear' }} />
              </div>
              <span style={{ color: 'var(--lq-silver)', fontSize: 14 }}>{status}</span>
              {phase === 'listening' && interim && (
                <button style={btn} onClick={() => { manualStop.current = true; recRef.current?.stop(); }}>{t.done}</button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingBottom: 8 }}>
            {userCount >= 2 && phase !== 'live' && <span style={{ color: 'var(--lq-silver)', fontSize: 13 }}>{t.finishHint}</span>}
            <button style={userCount >= 2 ? primary : btn} onClick={phase === 'live' ? endCall : finish}>{phase === 'live' ? t.hangup : t.finish}</button>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {turns.length > 1 && (<>
                <button style={{ color: 'var(--lq-silver)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }} onClick={openDownload}>{t.download}</button>
                <button style={{ color: 'var(--lq-silver)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => printTranscript(turns, lang, [visitorRef.current.firstName, visitorRef.current.lastName].filter(Boolean).join(' '))}>{t.print}</button>
              </>)}
              {!confirmDel && <button style={{ color: 'var(--lq-silver)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setConfirmDel(true)}>{t.deleteBtn}</button>}
            </div>
            {confirmDel && (
              <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', fontSize: 14 }}>
                <span>{t.deleteConfirm}</span>
                <button style={{ ...btn, padding: '6px 14px', fontSize: 14 }} onClick={deleteConversation}>{t.deleteYes}</button>
                <button style={{ ...btn, padding: '6px 14px', fontSize: 14 }} onClick={() => setConfirmDel(false)}>{t.deleteNo}</button>
              </div>
            )}
          </div>
        </div>
      )}
      {dl && (
        <div role="dialog" aria-modal="true" aria-label={t.dlTitle} onClick={() => !dBusy && setDl(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'color-mix(in srgb, var(--lq-abyss) 85%, transparent)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: 'var(--lq-abyss)', border: '1px solid var(--lq-line-strong)', borderRadius: 'var(--lq-radius-card)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <strong>{t.dlTitle}</strong>
            <p style={{ color: 'var(--lq-silver)', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{t.dlPurpose}</p>
            {([[dFirst, setDFirst, t.dlFirst, 'text'], [dLast, setDLast, t.dlLast, 'text'], [dEmail, setDEmail, t.dlEmail, 'email']] as const).map(([v, set, ph, type], i) => (
              <input key={i} type={type} value={v} onChange={(e) => set(e.target.value)} placeholder={ph} aria-label={ph} maxLength={type === 'email' ? 254 : 40}
                style={{ padding: '10px 14px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15 }} />
            ))}
            {dEmail.trim() && (
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={dSend} onChange={(e) => setDSend(e.target.checked)} style={{ marginTop: 3 }} />
                <span>{t.dlSendCheck}</span>
              </label>
            )}
            {notice && <p role="status" style={{ color: 'var(--lq-silver)', fontSize: 13, margin: 0 }}>{notice}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={btn} disabled={dBusy} onClick={() => setDl(false)}>{t.dlCancel}</button>
              <button style={primary} disabled={dBusy} onClick={doDownload}>{t.dlDownload}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
