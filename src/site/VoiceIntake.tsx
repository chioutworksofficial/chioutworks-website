/// <reference types="vite/client" />
import { addLiveChunk } from '../lib/liveTranscript';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { VOICE_UI } from './i18n/voice';
import { sttCapable, sttReady, sttSlow, prepareStt, listenOnce, openMic, micInputs, getMicId, setMicId, type Listening } from '../lib/stt';
import { readyPiper, unlockAudio, speakPiper, stopPiper, piperBusy } from '../lib/piperTts';
import { stripMarkup } from '../lib/voiceMarkup';
import AssistantConsent from './AssistantConsent';
import VoiceOrb from './VoiceOrb';
import { hasConsent, fallbackAllowed, CONSENT_VERSION } from '../lib/assistantConsent';
import { createAudio, LiveCall, fetchToken, liveDayExceeded, bumpLiveDay, postLiveEnd, SilenceWatch, type LiveHandlers } from '../lib/geminiLive';
import { wrongScript, namesOwner, usesWe } from '../lib/scriptGuard';
import { writeVoiceSession, clearVoiceSession, downloadTranscript, printTranscript } from '../lib/voiceSession';
import { StyleCta } from './pages/StylePage';

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
const LIVE_SECONDS = 150;
const LANG_EN: Record<string, string> = { tr: 'Turkish', de: 'German', el: 'Greek', en: 'English' };
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
  const [timeLeft, setTimeLeft] = useState(LIVE_SECONDS);
  const [reconnecting, setReconnecting] = useState(false);
  const [liveSpeak, setLiveSpeak] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [cardBusy, setCardBusy] = useState(false);
  const [cardSent, setCardSent] = useState(false);
  const [styleRef, setStyleRef] = useState<{ id: string; secret: string } | null>(null);   // for the "choose my style" link after sending
  const [cardErr, setCardErr] = useState('');
  const [vFirst, setVFirst] = useState('');
  const [vLast, setVLast] = useState('');
  const [vSal, setVSal] = useState<Salutation>('none');
  const [dl, setDl] = useState(false);
  const [dFirst, setDFirst] = useState('');
  const [dLast, setDLast] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dSend, setDSend] = useState(false);
  const [dBusy, setDBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicSel] = useState(getMicId);
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
  const reconnected = useRef(false);
  const liveRole = useRef<'user' | 'assistant' | null>(null);
  const outBuf = useRef('');
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
    callRef.current?.close(); callRef.current = null;
    streamRef.current?.getTracks().forEach((x) => x.stop()); streamRef.current = null;
    const c = ctxRef.current; ctxRef.current = null; c?.close().catch(() => {});
    releaseSlot();
  }, [releaseSlot]);

  const teardown = useCallback(() => {
    endLive();
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
          body: JSON.stringify({ lang, turns: turnsRef.current.slice(0, 30), startedAt: startedAt.current, endedAt: Date.now(), consent: true, ...visitorRef.current, ...(voiceId.current ?? {}) }),
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
      turnsRef.current = [];
      setTurns([]); setInterim(''); setText(''); setNotice(null); setTyped(false);
      sessionRef.current++; autoRef.current = true; deniedRef.current = false; inFlight.current = false;
      emptyRuns.current = 0; manualStop.current = false; unavailSaid.current = false;
      visitorRef.current = NO_VISITOR; setVFirst(''); setVLast(''); setVSal('none'); setNameDone(false); voiceId.current = null; deletedRef.current = false;
      deadlineRef.current = 0; setTimeLeft(LIVE_SECONDS); endingRef.current = false; finishPending.current = false; abuseRef.current = false; spokeRef.current = false; draining.current = false; softSent.current = false; reconnected.current = false;
      liveRole.current = null; liveCut.current = false; outBuf.current = ''; corrections.current = 0; setReconnecting(false); setCard(null); setCardSent(false); setCardErr(''); setCardBusy(false);
      preConsent.current = hasConsent('voice'); setDl(false); setConfirmDel(false);
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
  const addLive = (role: 'user' | 'assistant', text: string) => {
    if (role === 'user') liveCut.current = false;
    const r = addLiveChunk(turnsRef.current, role, text, liveRole.current === role, liveCut.current);
    turnsRef.current = r.turns; liveRole.current = role;
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
    c.hold(true);
    if (abuseRef.current) { void c.whenPlaybackDone(8000).then(() => setTimeout(endCall, 700)); return; }   // abuse: old behaviour
    void c.whenReallyDone().then(endCall);
  };

  const startTimerOnce = () => {
    if (deadlineRef.current) return;
    deadlineRef.current = Date.now() + LIVE_SECONDS * 1000;
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 25 && !softSent.current && !finishPending.current) {
        softSent.current = true;
        callRef.current?.sendText('TIME_UP: the call time is almost over. In at most two short sentences, summarise what was confirmed and then say the closing sentence exactly as instructed, then call finish_conversation with reason done.');
      }
      if (left > 0 || finishPending.current) return;
      finishPending.current = true;
      setNotice(t.timeUp);
      const c = callRef.current;
      if (!c) { endCall(); return; }
      c.hold();   // hard end: wait for the real end of speech (capped at 15 s)
      void c.whenReallyDone().then(endCall);
    }, 500);
  };

  const silenceEnd = () => {
    setNotice(t.silenceEnd);
    if (turnsRef.current.some((x) => x.role === 'user')) { endCall(); return; }
    endingRef.current = true; endLive(); setBlockedMsg(t.silenceEnd); goPhase('blocked');
  };
  silenceEndRef.current = silenceEnd;

  /** Opens the socket with a token and wires the handlers. `call` is compared in onClosed so stale sockets are ignored. */
  const openCall = async (token: string) => {
    const sid = sessionRef.current;
    const ref: { c: LiveCall | null } = { c: null };
    if (!watchRef.current) watchRef.current = new SilenceWatch(
      () => finishPending.current || !callRef.current || callRef.current.speaking(),   // paused while the assistant talks, on reconnect and while closing
      () => callRef.current?.sendText(`The visitor has been silent for a while. Gently check in ${LANG_EN[lang]}, in one short sentence, whether they are still there.`),
      () => silenceEndRef.current(),
    );
    const h: LiveHandlers = {
      onInput: (x) => {
        startTimerOnce(); addLive('user', x);
        watchRef.current?.heard();
        if (!spokeRef.current) { spokeRef.current = true; bumpLiveDay(); }   // only calls where the visitor actually spoke count
      },
      onOutput: (x) => {
        startTimerOnce(); addLive('assistant', x); watchRef.current?.start();
        outBuf.current += x;
        if (corrections.current < 2 && wrongScript(outBuf.current, lang)) {
          corrections.current++; outBuf.current = '';
          ref.c?.sendText(`Answer only in ${LANG_EN[lang]}, using only its alphabet. Repeat your last answer in ${LANG_EN[lang]}.`);
        } else if (corrections.current < 2 && namesOwner(outBuf.current)) {
          corrections.current++; outBuf.current = '';
          ref.c?.sendText("Do not mention any personal name of the business owner.");
        } else if (corrections.current < 2 && usesWe(outBuf.current, lang)) {
          corrections.current++; outBuf.current = '';
          ref.c?.sendText("Speak in first person singular as the assistant; never 'we'.");
        }
      },
      onInterrupted: () => { liveCut.current = turnsRef.current[turnsRef.current.length - 1]?.role === 'assistant'; liveRole.current = null; outBuf.current = ''; },
      onTurnComplete: () => { liveRole.current = null; outBuf.current = ''; if (finishPending.current && abuseRef.current) drain(); },
      onFinish: (reason) => { if (reason === 'abuse') abuseRef.current = true; finishPending.current = true; if (reason === 'abuse') setTimeout(drain, 3000); else drain(); },
      onLevel: (rms) => { const n = performance.now(); if (n - lastLevel.current > 80) { lastLevel.current = n; setLevel(Math.min(1, rms * 8)); } },
      onClosed: () => {
        if (callRef.current !== ref.c || endingRef.current || sid !== sessionRef.current) return;
        if (deadlineRef.current && Date.now() >= deadlineRef.current) { endCall(); return; }
        void reconnect();
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
      setMics(await micInputs());
    } catch { audioP.then((c) => c.close()).catch(() => {}); if (sid === sessionRef.current) toTextChat(t.deniedToText); return; }
    setPrep(25);
    try { ctxRef.current = await audioP; } catch { if (sid === sessionRef.current) await startFallback(); return; }
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
    callRef.current?.sendText('START');
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
          body: JSON.stringify({ secret: v.secret, email, firstName: cleanName(dFirst), lastName: cleanName(dLast), page: window.location.pathname }),
        });
        ok = r.ok;
      }
    } catch { /* ok stays false */ }
    setDBusy(false); setDl(false); setNotice(ok ? t.dlSent : t.dlSendError);
  };

  const finish = async () => {
    const userTurns = turnsRef.current.filter((x) => x.role === 'user');
    if (userTurns.length === 0) { teardown(); setOpen(false); navigate(pagePath(lang, 'contact')); return; }
    endingRef.current = true; teardown(); sessionRef.current++;
    void toCard();
  };

  const sendCard = async () => {
    if (!card) return;
    const name = [cleanName(card.firstName), cleanName(card.lastName)].filter(Boolean).join(' ');
    const email = card.email.trim(), phone = card.phone.trim();
    if (!name) { setCardErr(t.cardNeedContact); return; }
    const mailOk = EMAIL_RE.test(email) && /@.+\./.test(email), phoneOk = phone.replace(/\D/g, '').length >= 7;
    if (!mailOk && !phoneOk) { setCardErr(t.cardNeedEither); return; }
    if (!mailOk) { setCardErr(email ? t.dlBadEmail : t.cardNeedEither); return; }
    if (!phoneOk) { setCardErr(t.cardNeedEither); return; }
    setCardBusy(true); setCardErr('');
    try {
      const v = voiceId.current ?? await saveSession();
      const message = [card.service, card.notes].filter(Boolean).join('\n').slice(0, 1000);
      const r = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, business: card.business.trim(), city: card.city.trim(), message, replyPreference: 'written', via: 'assistant', lang, page: window.location.pathname, ...(v ? { voiceSessionId: v.id, voiceSecret: v.secret } : {}) }),
      });
      if (!r.ok) throw new Error(String(r.status));
      if (v) setStyleRef({ id: v.id, secret: v.secret }); setCardSent(true);
    } catch { setCardErr(t.cardError); }
    setCardBusy(false);
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
        <div style={{ margin: 'auto', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 40 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3.5vw, 28px)', fontFamily: 'var(--font-display)', fontWeight: 600, textAlign: 'center' }}>{t.cardTitle}</h2>
          {cardSent ? (
            <>
              <p role="status" style={{ textAlign: 'center', color: 'var(--lq-silver)', lineHeight: 1.6 }}>{t.cardSent}</p>
              {styleRef && <StyleCta lang={lang} body={{ kind: 'voice', sessionId: styleRef.id, secret: styleRef.secret }} />}
              <button type="button" style={primary} onClick={() => { teardown(); setOpen(false); }}>{t.cardClose}</button>
            </>
          ) : !card ? (
            <p role="status" aria-live="polite" style={{ textAlign: 'center', color: 'var(--lq-silver)' }}>{t.extracting}</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); void sendCard(); }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p role="note" style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', fontSize: 14, lineHeight: 1.5, color: 'var(--lq-white)', border: '1px solid var(--lq-line-strong)', borderRadius: 'var(--lq-radius-card)' }}><span aria-hidden>✎</span><span>{t.cardReview}</span></p>
              <p style={{ margin: 0, color: 'var(--lq-silver)', fontSize: 13.5, textAlign: 'center' }}>{t.cardHint}</p>
              {([['service', t.cardService, 'text', 120], ['business', t.cardBusiness, 'text', 100], ['city', t.cardCity, 'text', 80], ['firstName', t.cardFirst, 'text', 40], ['lastName', t.cardLast, 'text', 40], ['phone', t.cardPhone, 'tel', 40], ['email', t.cardEmail, 'email', 254]] as const).map(([k, label, type, max]) => (
                <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--lq-silver)' }}>
                  {label}{(k === 'phone' || k === 'email') ? ` * ${t.cardRequired}` : ''}
                  <input type={type} aria-required={(k === 'phone' || k === 'email') ? 'true' : undefined} value={card[k]} maxLength={max} onChange={(e) => setCard({ ...card, [k]: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15 }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--lq-silver)' }}>
                {t.cardNotes}
                <textarea value={card.notes} maxLength={600} rows={3} onChange={(e) => setCard({ ...card, notes: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: 'var(--lq-radius-sm)', border: '1px solid var(--lq-line-strong)', background: 'var(--lq-kelp)', color: 'var(--lq-white)', fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }} />
              </label>
              {cardErr && <p role="alert" style={{ margin: 0, color: 'var(--lq-white)', fontSize: 13.5 }}>{cardErr}</p>}
              <button type="submit" style={primary} disabled={cardBusy}>{cardBusy ? t.cardSending : t.cardSend}</button>
            </form>
          )}
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

          {mics.length > 1 && phase !== 'live' && (
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

          {phase === 'live' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', ['--orb' as string]: '150px' }}><VoiceOrb bare label="" onTalk={() => {}} /></div>
              <div aria-hidden style={{ width: 120, height: 4, borderRadius: 2, background: 'var(--lq-line)', overflow: 'hidden' }}>
                <div style={{ width: `${liveSpeak ? 0 : Math.round(level * 100)}%`, height: '100%', background: 'var(--lq-gradient)', transition: 'width 120ms linear' }} />
              </div>
              <span role="status" aria-live="polite" style={{ color: 'var(--lq-silver)', fontSize: 14 }}>{reconnecting ? t.reconnecting : liveSpeak ? t.liveSpeaking : t.liveListening}</span>
              <span style={{ color: 'var(--lq-silver)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{t.liveTimer}: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
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
