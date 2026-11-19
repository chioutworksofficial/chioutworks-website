import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createAppointment, getClosedDays } from '../lib/appointments';
import type { Lang } from '../translations';
import { pagePath } from '../lib/routes';
import { readyPiper, speakPiper, stopPiper, unlockAudio } from '../lib/piperTts';
import { stripMarkup } from '../lib/voiceMarkup';
import { sttCapable, sttSlow, prepareStt, listenOnce, type Listening } from '../lib/stt';
import { useNavigate } from 'react-router-dom';
import AssistantConsent from '../site/AssistantConsent';
import { VOICE_UI } from '../site/i18n/voice';
import { FAQ_UI } from '../site/i18n/faq';
import ChatOrb from '../site/ChatOrb';
import { playOpen, playSend, playReply, soundOn, setSoundOn } from '../lib/chatSounds';
import { getBid } from '../lib/assistantConsent';
import { hasConsent as hasCookieConsent } from '../lib/consent';
import { hasConsent } from '../lib/assistantConsent';
import { writeVoiceSession, clearVoiceSession, downloadTranscript } from '../lib/voiceSession';

// ── Chat memory (owner, 2026-11-19): always kept for this tab (sessionStorage = needed for the requested service);
// kept 7 days in localStorage only with the "functional/comfort" cookie consent. Cleared with "Clear chat"/"Delete".
const CHAT_KEY = 'cw-chat';
const CHAT_WEEK = 7 * 24 * 60 * 60 * 1000;
function restoreChat(lang: Lang): ChatMessage[] {
  const read = (st: Storage, maxAge?: number) => {
    try { const j = JSON.parse(st.getItem(CHAT_KEY) ?? 'null'); if (j && j.lang === lang && Array.isArray(j.messages) && (!maxAge || Date.now() - j.at < maxAge)) return j.messages as ChatMessage[]; } catch { /* ignore */ }
    return null;
  };
  try { return read(sessionStorage) ?? (hasCookieConsent('functional') ? read(localStorage, CHAT_WEEK) : null) ?? []; } catch { return []; }
}
function storeChat(lang: Lang, messages: ChatMessage[]) {
  const v = JSON.stringify({ lang, at: Date.now(), messages: messages.slice(-40) });
  try { sessionStorage.setItem(CHAT_KEY, v); } catch { /* ignore */ }
  try { if (hasCookieConsent('functional')) localStorage.setItem(CHAT_KEY, v); else localStorage.removeItem(CHAT_KEY); } catch { /* ignore */ }
}
function forgetChat() {
  try { sessionStorage.removeItem(CHAT_KEY); } catch { /* ignore */ }
  try { localStorage.removeItem(CHAT_KEY); } catch { /* ignore */ }
}
const ic = (d: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d.split('|').map((x, i) => <path key={i} d={x} />)}</svg>;
const CHIP_ICON: Record<string, React.ReactNode> = {
  web: ic('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M3.6 9h16.8|M3.6 15h16.8|M12 3a14 14 0 0 1 0 18|M12 3a14 14 0 0 0 0 18'),
  auto: ic('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'),
  price: ic('M18 7a7 7 0 1 0 0 10|M4 10h9|M4 14h9'),
  how: ic('M9 18h6|M10 22h4|M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z'),
};
const SHOW_MIC = false;   // owner, 2026-11-19: no mic in the text chat; "continue by voice" opens the voice dialog instead

// ── Types ─────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  at?: number;
}

interface AppointmentPayload {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  topic: string;
  language: string;
}

interface ApiResponse {
  message?: string;
  action?: string | null;
  appointment?: AppointmentPayload;
  error?: string;
  fallback?: boolean;
  backupOffer?: boolean;
  end?: boolean;
  blocked?: boolean;
  permanent?: boolean;
  until?: number | null;
}

// ── UI strings (4 languages) ───────────────────────────────────────────────
const UI = {
  en: {
    btnLabel: 'Chat with AI',
    placeholder: 'Type a message…',
    title: "Chioutworks",
    subtitle: "Answers your questions · free written assessment",
    chatNotice: "This is an AI assistant, not a person. Your messages are processed by an AI service to generate answers.",
    details: "Details",
    backupAsk: "The assistant is very busy right now. Would you like to continue with a second AI provider (USA)? Your messages would then be sent there to generate answers.",
    backupYes: "Yes, continue",
    backupNo: "No, use the form",
    voiceSwitch: "Would you rather talk by voice?",
    clearChat: "Clear chat",
    newChat: "New chat",
    tabChat: "Chat",
    tabFaq: "FAQ",
    tabContact: "Contact",
    assistantName: "Chioutworks Assistant",
    welcomeTitle: "Hi 👋 What would you like to make easier today?",
    welcomeText: "From websites to automation, I answer all your questions. If you like, I prepare your request for a free written assessment.",
    chips: [{"i": "web", "t": "Website", "d": "New site or redesign", "q": "I would like a website. How does it work?"}, {"i": "auto", "t": "Automation", "d": "End repetitive work", "q": "Which of my daily tasks could be automated?"}, {"i": "price", "t": "Pricing", "d": "What does it cost?", "q": "What does a project roughly cost?"}, {"i": "how", "t": "How it works", "d": "Step by step", "q": "How does working with you work, step by step?"}],
    soundOn: "Sounds on",
    soundOff: "Sounds off",
    contactTitle: "Other ways to reach me",
    contactForm: "Contact form",
    contactFormSub: "Written reply, no meeting needed",
    contactVoice: "Talk by voice",
    contactVoiceSub: "The voice assistant answers right away",
    faqAll: "All questions",
    privacyLink: 'Privacy Policy',
    errorFallback: 'The AI is temporarily unavailable. Please use the contact form or message on LinkedIn.',
    micConsent: 'Allow microphone for voice input?',
    micDeny: 'No, text only',
    micAllow: 'Allow',
    typingLabel: 'Typing…',
    appointmentDone: '✓ Appointment booked! I\'ll be in touch soon.',
    close: 'Close chat',
    speakerOn: 'Voice on',
    speakerOff: 'Voice off',
    micStart: 'Start voice input',
    micStop: 'Stop recording',
    send: 'Send',
  },
  de: {
    btnLabel: 'KI-Gespräch',
    placeholder: 'Nachricht eingeben…',
    title: "Chioutworks",
    subtitle: "Beantwortet Ihre Fragen · kostenlose schriftliche Einschätzung",
    chatNotice: "Dies ist ein KI-Assistent, kein Mensch. Ihre Nachrichten werden zur Erzeugung der Antworten von einem KI-Dienst verarbeitet.",
    details: "Einzelheiten",
    backupAsk: "Der Assistent ist gerade stark ausgelastet. Möchten Sie mit einem zweiten KI-Anbieter (USA) weitermachen? Ihre Nachrichten würden dann zur Erzeugung der Antworten dorthin gesendet.",
    backupYes: "Ja, weiter",
    backupNo: "Nein, Formular nutzen",
    voiceSwitch: "Lieber per Sprache weitermachen?",
    clearChat: "Chat löschen",
    newChat: "Neuer Chat",
    tabChat: "Chat",
    tabFaq: "FAQ",
    tabContact: "Kontakt",
    assistantName: "Chioutworks Assistent",
    welcomeTitle: "Hallo 👋 Was möchten Sie heute einfacher machen?",
    welcomeText: "Von der Website bis zur Automatisierung beantworte ich alle Ihre Fragen. Auf Wunsch bereite ich Ihre Anfrage für eine kostenlose schriftliche Einschätzung vor.",
    chips: [{"i": "web", "t": "Website", "d": "Neu oder Relaunch", "q": "Ich möchte eine Website. Wie läuft das ab?"}, {"i": "auto", "t": "Automatisierung", "d": "Routinearbeit beenden", "q": "Welche meiner täglichen Aufgaben lassen sich automatisieren?"}, {"i": "price", "t": "Preise", "d": "Was kostet das?", "q": "Was kostet ein Projekt ungefähr?"}, {"i": "how", "t": "So läuft es", "d": "Schritt für Schritt", "q": "Wie läuft die Zusammenarbeit Schritt für Schritt ab?"}],
    soundOn: "Töne an",
    soundOff: "Töne aus",
    contactTitle: "Weitere Wege zu mir",
    contactForm: "Kontaktformular",
    contactFormSub: "Schriftliche Antwort, kein Termin nötig",
    contactVoice: "Per Sprache sprechen",
    contactVoiceSub: "Der Sprachassistent antwortet sofort",
    faqAll: "Alle Fragen",
    privacyLink: 'Datenschutz',
    errorFallback: 'Der KI-Assistent ist vorübergehend nicht verfügbar. Bitte nutzen Sie das Kontaktformular oder schreiben Sie mir auf LinkedIn.',
    micConsent: 'Mikrofon für Spracheingabe erlauben?',
    micDeny: 'Nein, nur Text',
    micAllow: 'Erlauben',
    typingLabel: 'Schreibt…',
    appointmentDone: '✓ Termin gebucht! Ich melde mich bald.',
    close: 'Gespräch schließen',
    speakerOn: 'Ton an',
    speakerOff: 'Ton aus',
    micStart: 'Spracheingabe starten',
    micStop: 'Aufnahme stoppen',
    send: 'Senden',
  },
  tr: {
    btnLabel: 'YZ ile Sohbet',
    placeholder: 'Mesaj yazın…',
    title: "Chioutworks",
    subtitle: "Sorularınızı yanıtlar · ücretsiz yazılı değerlendirme",
    chatNotice: "Bu bir insan değil, yapay zekâ asistanıdır. Mesajlarınız yanıt üretmek için bir yapay zekâ hizmetinde işlenir.",
    details: "Ayrıntılar",
    backupAsk: "Asistan şu an çok yoğun. İkinci bir yapay zekâ sağlayıcısıyla (ABD) devam etmek ister misiniz? Bu durumda mesajlarınız yanıt üretmek için oraya gönderilir.",
    backupYes: "Evet, devam et",
    backupNo: "Hayır, formu kullanayım",
    voiceSwitch: "Sesli devam etmek ister misiniz?",
    clearChat: "Sohbeti temizle",
    newChat: "Yeni sohbet",
    tabChat: "Sohbet",
    tabFaq: "SSS",
    tabContact: "İletişim",
    assistantName: "Chioutworks Asistan",
    welcomeTitle: "Merhaba 👋 Bugün neyi kolaylaştırmak istersiniz?",
    welcomeText: "Web sitesinden otomasyona kadar her sorunuzu yanıtlarım. İsterseniz talebinizi ücretsiz yazılı değerlendirme için hazırlarım.",
    chips: [{"i": "web", "t": "Web sitesi", "d": "Yeni site veya yenileme", "q": "Web sitesi yaptırmak istiyorum, nasıl ilerliyor?"}, {"i": "auto", "t": "Otomasyon", "d": "Tekrarlayan işleri bitir", "q": "Günlük işlerimden hangileri otomatikleşebilir?"}, {"i": "price", "t": "Fiyatlar", "d": "Ne kadar tutar?", "q": "Bir proje yaklaşık ne kadar tutar?"}, {"i": "how", "t": "Nasıl çalışır?", "d": "Adım adım süreç", "q": "Birlikte çalışma süreci adım adım nasıl ilerliyor?"}],
    soundOn: "Sesler açık",
    soundOff: "Sesler kapalı",
    contactTitle: "Bana ulaşmanın diğer yolları",
    contactForm: "İletişim formu",
    contactFormSub: "Yazılı dönüş, toplantı gerekmez",
    contactVoice: "Sesli konuş",
    contactVoiceSub: "Sesli asistan hemen yanıt verir",
    faqAll: "Tüm sorular",
    privacyLink: 'Gizlilik Politikası',
    errorFallback: 'YZ asistanı şu an kullanılamıyor. Lütfen iletişim formunu kullanın veya LinkedIn’den yazın.',
    micConsent: 'Sesli giriş için mikrofona izin verilsin mi?',
    micDeny: 'Hayır, sadece yazı',
    micAllow: 'İzin Ver',
    typingLabel: 'Yazıyor…',
    appointmentDone: '✓ Randevunuz alındı! Yakında sizinle iletişime geçeceğim.',
    close: 'Sohbeti kapat',
    speakerOn: 'Ses açık',
    speakerOff: 'Ses kapalı',
    micStart: 'Sesli girişi başlat',
    micStop: 'Kaydı durdur',
    send: 'Gönder',
  },
  el: {
    btnLabel: 'Συνομιλία με ΤΝ',
    placeholder: 'Γράψτε μήνυμα…',
    title: "Chioutworks",
    subtitle: "Απαντά στις ερωτήσεις σας · δωρεάν γραπτή αξιολόγηση",
    chatNotice: "Αυτός είναι βοηθός τεχνητής νοημοσύνης, όχι άνθρωπος. Τα μηνύματά σας επεξεργάζονται από υπηρεσία τεχνητής νοημοσύνης για την παραγωγή απαντήσεων.",
    details: "Λεπτομέρειες",
    backupAsk: "Ο βοηθός έχει μεγάλο φόρτο αυτή τη στιγμή. Θέλετε να συνεχίσετε με δεύτερο πάροχο τεχνητής νοημοσύνης (ΗΠΑ); Τα μηνύματά σας θα σταλούν τότε εκεί για την παραγωγή απαντήσεων.",
    backupYes: "Ναι, συνέχεια",
    backupNo: "Όχι, θα χρησιμοποιήσω τη φόρμα",
    voiceSwitch: "Προτιμάτε να συνεχίσετε με φωνή;",
    clearChat: "Εκκαθάριση συνομιλίας",
    newChat: "Νέα συνομιλία",
    tabChat: "Συνομιλία",
    tabFaq: "Συχνές",
    tabContact: "Επικοινωνία",
    assistantName: "Βοηθός Chioutworks",
    welcomeTitle: "Γεια σας 👋 Τι θα θέλατε να κάνετε πιο εύκολο σήμερα;",
    welcomeText: "Από ιστοσελίδες μέχρι αυτοματισμούς, απαντώ σε όλες τις ερωτήσεις σας. Αν θέλετε, ετοιμάζω το αίτημά σας για δωρεάν γραπτή αξιολόγηση.",
    chips: [{"i": "web", "t": "Ιστοσελίδα", "d": "Νέα ή ανανέωση", "q": "Θέλω μια ιστοσελίδα. Πώς προχωράμε;"}, {"i": "auto", "t": "Αυτοματισμός", "d": "Τέλος στις επαναλήψεις", "q": "Ποιες καθημερινές μου εργασίες μπορούν να αυτοματοποιηθούν;"}, {"i": "price", "t": "Τιμές", "d": "Πόσο κοστίζει;", "q": "Πόσο κοστίζει περίπου ένα έργο;"}, {"i": "how", "t": "Πώς λειτουργεί", "d": "Βήμα προς βήμα", "q": "Πώς γίνεται η συνεργασία βήμα προς βήμα;"}],
    soundOn: "Ήχοι ενεργοί",
    soundOff: "Ήχοι ανενεργοί",
    contactTitle: "Άλλοι τρόποι επικοινωνίας",
    contactForm: "Φόρμα επικοινωνίας",
    contactFormSub: "Γραπτή απάντηση, χωρίς συνάντηση",
    contactVoice: "Μιλήστε με φωνή",
    contactVoiceSub: "Ο φωνητικός βοηθός απαντά αμέσως",
    faqAll: "Όλες οι ερωτήσεις",
    privacyLink: 'Πολιτική Απορρήτου',
    errorFallback: 'Ο βοηθός ΤΝ δεν είναι διαθέσιμος αυτή τη στιγμή. Χρησιμοποιήστε τη φόρμα επικοινωνίας ή στείλτε μήνυμα στο LinkedIn.',
    micConsent: 'Να επιτραπεί το μικρόφωνο για φωνητική εισαγωγή;',
    micDeny: 'Όχι, μόνο κείμενο',
    micAllow: 'Επιτρέπεται',
    typingLabel: 'Πληκτρολογεί…',
    appointmentDone: '✓ Το ραντεβού κλείστηκε! Θα επικοινωνήσω σύντομα.',
    close: 'Κλείσιμο συνομιλίας',
    speakerOn: 'Ήχος ενεργός',
    speakerOff: 'Ήχος ανενεργός',
    micStart: 'Έναρξη φωνητικής εισαγωγής',
    micStop: 'Διακοπή εγγραφής',
    send: 'Αποστολή',
  },
} as const;

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  lang: Lang;
  /** Hide the built-in floating button (the site renders its own launcher and opens the panel via the 'cw:open-assistant' event) */
  hideLauncher?: boolean;
}

export default function AIAssistant({ lang, hideLauncher = false }: Props) {
  const ui = UI[lang];
  const vt = VOICE_UI[lang];
  const navigate = useNavigate();
  // DEV only: ?chatdemo skips consent and shows a mocked transcript (for screenshots)
  const devDemo = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('chatdemo');
  // Text chat: one-click explicit consent (no tick boxes), asked once per tab
  const [consented, setConsented] = useState(() => hasConsent('text') || devDemo);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [saving, setSaving] = useState(false);
  const sessRef = useRef<{ id: string; secret: string } | null>(null);
  const startedRef = useRef(Date.now());
  const deletedRef = useRef(false);
  const chainRef = useRef<Promise<unknown>>(Promise.resolve());
  const msgsRef = useRef<ChatMessage[]>([]);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => (devDemo ? [] : restoreChat(lang)));
  const [backupAsk, setBackupAsk] = useState<ChatMessage[] | null>(null);   // primary busy: ask before using the second provider
  const backupRef = useRef(false);
  const [tab, setTab] = useState<'chat' | 'faq' | 'contact'>('chat');
  const [sound, setSound] = useState(soundOn);
  const seenRef = useRef(-1);   // messages already present (restored) do not chime
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled] = useState(false);   // the old read-aloud (local Piper voice) is off; the chat uses UI sounds instead
  const [micActive, setMicActive] = useState(false);
  const [micAsked, setMicAsked] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDone, setAppointmentDone] = useState(false);
  const [ended, setEnded] = useState(false);   // server ended the chat (goodbye / block): input stays off
  const [, setPause] = useState<{ permanent: boolean; until: number | null } | null>(null);   // server-side pause/close (never persisted)
  const locked = appointmentDone || ended;
  const [, setIsSpeaking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<Listening | null>(null);

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Focus input when opened ────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // ── Server block status (no model call; fail open on network error) ───
  const checkStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/assistant/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, bid: getBid() }),
      });
      const d: ApiResponse = await r.json();
      if (d.blocked) {
        setPause({ permanent: !!d.permanent, until: d.until ?? null });
        setMessages([{ role: 'assistant', content: d.message ?? vt.chatBlocked, at: Date.now() }]);
        setEnded(true);
        return;
      }
      setPause(null);
    } catch { /* fail open */ }
  }, [lang, vt.chatBlocked]);
  const statusCheckedRef = useRef(false);
  useEffect(() => {
    if (open && !devDemo && !statusCheckedRef.current) { statusCheckedRef.current = true; void checkStatus(); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Greeting on first open ─────────────────────────────────────────────
  useEffect(() => {
    if (open && consented && messages.length === 0 && !loading) {
      deletedRef.current = false; startedRef.current = Date.now();
      if (devDemo) {
        const n = Date.now();
        setMessages([
          { role: 'assistant', content: stripMarkup(vt.greeting), at: n - 90000 },
          { role: 'user', content: lang === 'tr' ? 'Berber salonum için online randevu sistemi arıyorum.' : 'I am looking for an online booking system for my salon.', at: n - 60000 },
          { role: 'assistant', content: vt.afterSkip, at: n - 30000 },
        ]);
        return;
      }
      // The welcome card + quick questions replace the model greeting (faster, no request until the visitor writes)
    }
  }, [open, consented]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset chat when language changes (if already open) ────────────────
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      setMessages([]); forgetChat();
      setAppointmentDone(false);
      setError(null);
      sessRef.current = null;
      stopPiper();
      if (open && consented) {
        setTimeout(() => fetchReply([]), 50);
      }
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load the local voice in the background once the visitor has consented
  useEffect(() => { if (open && consented && ttsEnabled && !devDemo) void readyPiper(lang); }, [open, consented, ttsEnabled, lang, devDemo]);

  // ── Release the microphone when the page is hidden
  useEffect(() => {
    const h = () => { if (document.hidden) { const r = recognitionRef.current; recognitionRef.current = null; r?.cancel(); setMicActive(false); } };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, []);

  // ── Stop TTS when panel closes ─────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      stopPiper();
      recognitionRef.current?.stop();
      setMicActive(false);
    }
  }, [open]);

  // ── TTS ────────────────────────────────────────────────────────────────
  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled) return;
      setIsSpeaking(true);
      const done = () => setIsSpeaking(false);
      // Local Piper voice only (text is already shown; speech starts once the voice is ready, skipped after 6 s). Nothing is sent to any server.
      void speakPiper(text, lang).then(done, done);
    },
    [lang, ttsEnabled]
  );

  const stopSpeaking = () => {
    stopPiper();
    setIsSpeaking(false);
  };

  // ── Fetch reply from server ────────────────────────────────────────────
  const fetchReply = useCallback(
    async (msgs: ChatMessage[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: msgs, language: lang, bid: getBid(), backup: backupRef.current }),
        });

        const data: ApiResponse = await res.json().catch(() => ({}));

        if (data.blocked) setPause({ permanent: !!data.permanent, until: data.until ?? null });
        if (res.status === 403 || res.status === 429) {   // blocked: neutral message + form link
          setMessages((prev) => [...prev, { role: 'assistant', content: data.message ?? vt.chatBlocked, at: Date.now() }]);
          setEnded(true); setLoading(false);
          return;
        }

        if (!res.ok || data.error) {
          if (data.backupOffer && !backupRef.current) { setBackupAsk(msgs); setLoading(false); return; }
          if (data.fallback) {
            setError(ui.errorFallback);
          } else {
            setError(data.error ?? ui.errorFallback);
          }
          setLoading(false);
          return;
        }

        // ── Handle appointment creation ─────────────────────────────────
        if (data.action === 'create_appointment' && data.appointment) {
          const appt = data.appointment;
          // Validate date isn't closed
          const closedDays = getClosedDays();
          if (closedDays.includes(appt.date)) {
            const retryMsg: ChatMessage = {
              role: 'assistant',
              at: Date.now(),
              content:
                lang === 'tr'
                  ? 'Bu tarih maalesef dolu. Lütfen başka bir tarih seçin.'
                  : lang === 'de'
                  ? 'Dieser Tag ist leider ausgebucht. Bitte wählen Sie ein anderes Datum.'
                  : lang === 'el'
                  ? 'Αυτή η ημερομηνία είναι δυστυχώς πλήρης. Παρακαλώ επιλέξτε άλλη.'
                  : 'That date is unfortunately fully booked. Let\'s choose another date.',
            };
            setMessages((prev) => [...prev, retryMsg]);
            speak(retryMsg.content);
            setLoading(false);
            return;
          }

          createAppointment({
            name: appt.name,
            email: appt.email,
            phone: appt.phone,
            address: '',
            date: appt.date,
            preferredTime: appt.time,
            message: appt.topic,
          });
          setAppointmentDone(true);
        }

        if (data.message) {
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: data.message,
            at: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          speak(data.message);
        }
        if (data.end) setEnded(true);
      } catch {
        setError(ui.errorFallback);
      } finally {
        setLoading(false);
      }
    },
    [lang, ui.errorFallback, speak, vt.chatBlocked]
  );

  // ── Send message ───────────────────────────────────────────────────────
  const send = useCallback(async (preset?: unknown) => {
    unlockAudio();
    const text = (typeof preset === 'string' ? preset : input).trim();
    if (!text || loading || locked) return;
    stopSpeaking();
    setInput(''); playSend();
    const userMsg: ChatMessage = { role: 'user', content: text, at: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    await fetchReply(newMessages);
  }, [input, loading, locked, messages, fetchReply]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ── Microphone ─────────────────────────────────────────────────────────
  const startMic = useCallback(async () => {
    if (!sttCapable()) return;
    setMicActive(true);
    stopSpeaking();
    // Whisper runs on this device (model from our own server); nothing is sent to a browser vendor.
    if (!(await prepareStt())) { setMicActive(false); setNotice(vt.sttFailed); return; }
    try {
      const rec = await listenOnce(lang);
      recognitionRef.current = rec;
      const transcript = (await rec.result).trim();
      if (recognitionRef.current === rec) { recognitionRef.current = null; if (transcript) setInput(transcript); if (sttSlow()) setNotice(vt.sttSlow); }
    } catch { setNotice(vt.deniedToText); }
    setMicActive(false);
  }, [lang, vt]);

  const stopMic = () => {
    recognitionRef.current?.stop();
  };

  const handleMicClick = () => {
    if (micActive) {
      stopMic();
      return;
    }
    if (!micAsked) {
      setMicAsked(true);
      return; // Show consent banner first
    }
    if (micGranted) startMic();
  };

  const grantMic = () => {
    setMicGranted(true);
    startMic();
  };

  // Opened from the site (hero orb / chat launcher): window event 'cw:open-assistant' { mic?: boolean }.
  // Mic still goes through the consent banner the first time.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const note = (e as CustomEvent<{ note?: string }>).detail?.note;
      setNotice(note ?? null);
      if (!(e as CustomEvent<{ mic?: boolean }>).detail?.mic) return;
      if (!micAsked) setMicAsked(true);
      else if (micGranted) startMic();
    };
    window.addEventListener('cw:open-assistant', onOpen);
    return () => window.removeEventListener('cw:open-assistant', onOpen);
  }, [micAsked, micGranted, startMic]);

  const denyMic = () => {
    setMicGranted(false);
    setMicAsked(false);
  };

  // ── TTS toggle ─────────────────────────────────────────────────────────

  // ── Session (server-side transcript, same store as the voice dialog; kind 'text') ──
  msgsRef.current = messages;
  const saveSession = useCallback((): Promise<{ id: string; secret: string } | null> => {
    if (deletedRef.current) return Promise.resolve(null);
    const turns = msgsRef.current.map((m) => ({ role: m.role, text: m.content, at: m.at ?? Date.now() })).slice(0, 30);
    if (!turns.some((x) => x.role === 'user')) return Promise.resolve(sessRef.current);
    chainRef.current = chainRef.current.then(async () => {
      try {
        const r = await fetch('/api/voice/session', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, turns, startedAt: startedRef.current, endedAt: Date.now(), consent: true, kind: 'text', ...(sessRef.current ?? {}) }),
        });
        if (!r.ok || deletedRef.current) return null;
        const j = await r.json() as { id: string; secret: string };
        sessRef.current = j;
        writeVoiceSession(j.id, j.secret);
        return j;
      } catch { return null; }
    });
    return chainRef.current as Promise<{ id: string; secret: string } | null>;
  }, [lang]);

  useEffect(() => {
    if (!consented || messages.length === 0 || devDemo) return;
    const h = setTimeout(() => { void saveSession(); }, 1500);
    return () => clearTimeout(h);
  }, [messages, consented, saveSession, devDemo]);

  useEffect(() => { if (!devDemo) { if (messages.length) storeChat(lang, messages); } }, [messages, lang, devDemo]);

  useEffect(() => { if (open) { setTab('chat'); playOpen(); } }, [open]);
  useEffect(() => {
    if (seenRef.current < 0) { seenRef.current = messages.length; return; }
    if (messages.length > seenRef.current && messages[messages.length - 1]?.role === 'assistant') playReply();
    seenRef.current = messages.length;
  }, [messages]);

  const closePanel = () => { void saveSession(); setOpen(false); };
  // New chat: keep the stored transcript, start a fresh conversation in the panel
  const newChat = () => { void saveSession(); sessRef.current = null; forgetChat(); backupRef.current = false; setBackupAsk(null); setMessages([]); setError(null); setEnded(false); setPause(null); setConfirmDel(false); setTab('chat'); startedRef.current = Date.now(); if (!devDemo) void checkStatus(); };
  const toVoice = () => { void saveSession(); setOpen(false); window.dispatchEvent(new CustomEvent('cw:open-voice')); };

  const deleteChat = async () => {
    await chainRef.current;
    deletedRef.current = true;
    stopPiper();
    const v = sessRef.current;
    clearVoiceSession();
    if (v) {
      try {
        const r = await fetch(`/api/voice/session/${encodeURIComponent(v.id)}`, { method: 'DELETE', headers: { 'x-voice-secret': v.secret } });
        if (!r.ok && r.status !== 404) { deletedRef.current = false; setNotice(vt.deleteFail); setConfirmDel(false); return; }
      } catch { deletedRef.current = false; setNotice(vt.deleteFail); setConfirmDel(false); return; }
    }
    sessRef.current = null; forgetChat(); setMessages([]); setConfirmDel(false); setNotice(null); setOpen(false);
  };

  const toForm = async () => {
    stopPiper();
    const userTexts = messages.filter((m) => m.role === 'user').map((m) => m.content);
    if (userTexts.length === 0) { setOpen(false); navigate(pagePath(lang, 'contact')); return; }
    setSaving(true);
    const v = await saveSession();
    setSaving(false);
    setOpen(false);
    navigate(pagePath(lang, 'contact'), { state: { ...(v ? { voiceSessionId: v.id, voiceSecret: v.secret } : {}), prefill: userTexts.join(' ').slice(0, 1000) } });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  const hasSR = typeof window !== 'undefined' && sttCapable();

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────────── */}
      <AnimatePresence>
        {!open && !hideLauncher && (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={() => setOpen(true)}
            aria-label={ui.btnLabel}
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              zIndex: 9000,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--c-quartz) 5%, var(--c-abyss))',
              border: '1px solid color-mix(in srgb, var(--c-quartz) 14%, transparent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-quartz)',
            }}
          >
            {/* AI spark icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
            </svg>
            {/* Ping dot */}
            <span style={{
              position: 'absolute',
              top: 6, right: 6,
              width: 10, height: 10,
              borderRadius: '50%',
              background: 'var(--lq-abyss)',
              border: '2px solid var(--lq-g2)',
            }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="cw-ai-panel"
            style={{
              position: 'fixed',
              zIndex: 9001,
              borderRadius: 22,
              background: 'radial-gradient(130% 50% at 50% 0%, color-mix(in srgb, var(--c-signal) 18%, transparent), transparent 60%), var(--c-void)',
              border: '1px solid var(--lq-line)',
              outline: '1px solid var(--lq-line-strong)',
              outlineOffset: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'var(--lq-font)',
            }}
            role="dialog"
            aria-label={ui.title}
            aria-modal="true"
          >
            {/* ── Header: tabs, sound, close (owner, 2026-11-19) ─────────── */}
            <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
              <div role="tablist" aria-label={ui.assistantName} style={{ display: 'flex', gap: 18, flex: 1, minWidth: 0 }}>
                <button role="tab" aria-selected={tab === 'chat'} onClick={() => setTab('chat')} style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontSize: 13.5, fontWeight: tab === 'chat' ? 600 : 400, color: tab === 'chat' ? 'var(--lq-white)' : 'var(--lq-silver)', borderBottom: tab === 'chat' ? '2px solid var(--c-lilac)' : '2px solid transparent', borderRadius: 0 }}>{ui.tabChat}</button>
                <button role="tab" aria-selected={tab === 'faq'} onClick={() => setTab('faq')} style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontSize: 13.5, fontWeight: tab === 'faq' ? 600 : 400, color: tab === 'faq' ? 'var(--lq-white)' : 'var(--lq-silver)', borderBottom: tab === 'faq' ? '2px solid var(--c-lilac)' : '2px solid transparent', borderRadius: 0 }}>{ui.tabFaq}</button>
                <button role="tab" aria-selected={tab === 'contact'} onClick={() => setTab('contact')} style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontSize: 13.5, fontWeight: tab === 'contact' ? 600 : 400, color: tab === 'contact' ? 'var(--lq-white)' : 'var(--lq-silver)', borderBottom: tab === 'contact' ? '2px solid var(--c-lilac)' : '2px solid transparent', borderRadius: 0 }}>{ui.tabContact}</button>
              </div>
              <button onClick={() => { const v = !sound; setSound(v); setSoundOn(v); if (v) playSend(); }} aria-label={sound ? ui.soundOff : ui.soundOn} title={sound ? ui.soundOff : ui.soundOn}
                style={{ background: 'color-mix(in srgb, var(--c-quartz) 6%, transparent)', border: '1px solid var(--lq-line)', cursor: 'pointer', color: sound ? 'var(--lq-white)' : 'var(--lq-silver)', width: 32, height: 32, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>{sound ? <><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></> : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>}</svg>
              </button>
              <button onClick={closePanel} aria-label={ui.close}
                style={{ background: 'color-mix(in srgb, var(--c-quartz) 6%, transparent)', border: '1px solid var(--lq-line)', cursor: 'pointer', color: 'var(--lq-silver)', width: 32, height: 32, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {!consented ? (
              <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <AssistantConsent lang={lang} mode="text" compact primaryAction={{ label: vt.consentTextGo, run: () => { unlockAudio(); setConsented(true); } }} onNavigate={() => setOpen(false)} />
              </div>
            ) : tab === 'faq' ? (
              <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FAQ_UI[lang].items.slice(0, 6).map((f) => (
                  <details key={f.q} style={{ border: '1px solid var(--lq-line)', borderRadius: 14, padding: '11px 14px', background: 'color-mix(in srgb, var(--c-quartz) 3%, transparent)' }}>
                    <summary style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--lq-white)', listStyle: 'none' }}>{f.q}</summary>
                    <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--lq-mist)' }}>{f.a}</p>
                  </details>
                ))}
                <button onClick={() => { closePanel(); navigate(pagePath(lang, 'faq')); }} style={{ alignSelf: 'center', marginTop: 6, color: 'var(--c-lilac)', fontSize: 13, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>{ui.faqAll} →</button>
              </div>
            ) : tab === 'contact' ? (
              <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--lq-white)' }}>{ui.contactTitle}</p>
                {[
                  { t: ui.contactForm, d: ui.contactFormSub, run: () => { closePanel(); navigate(pagePath(lang, 'contact')); } },
                  { t: ui.contactVoice, d: ui.contactVoiceSub, run: () => toVoice() },
                ].map((x) => (
                  <button key={x.t} onClick={x.run} style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 16, border: '1px solid var(--lq-line-strong)', background: 'color-mix(in srgb, var(--c-quartz) 4%, transparent)', cursor: 'pointer', color: 'var(--lq-white)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{x.t} →</span>
                    <span style={{ fontSize: 12.5, color: 'var(--lq-silver)' }}>{x.d}</span>
                  </button>
                ))}
              {/* Conversation tools (moved here from the chat tab so the chat stays clean, like the reference layout) */}
              <div style={{ padding: '10px 0 0', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {messages.filter((m) => m.role === 'user').length >= 2 && (<button onClick={toForm} disabled={saving} style={{ width: '100%', padding: '9px 12px', borderRadius: 9999, border: '1px solid var(--c-lilac)', background: 'color-mix(in srgb, var(--c-lilac) 14%, var(--c-abyss))', color: 'var(--lq-white)', fontSize: 11, fontWeight: 500, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{vt.toForm}</button>)}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', fontSize: 12 }}>
                  {messages.length > 1 && <button style={{ color: 'var(--lq-silver)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => downloadTranscript(messages.map((m) => ({ role: m.role, text: m.content, at: m.at ?? Date.now() })), lang, '')}>{vt.download}</button>}
                  {!confirmDel && <button style={{ color: 'var(--lq-silver)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setConfirmDel(true)}>{vt.deleteBtn}</button>}
                </div>
                {confirmDel && (
                  <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', fontSize: 12.5, color: 'var(--lq-mist)' }}>
                    <span>{vt.deleteConfirm}</span>
                    <button style={{ color: 'var(--lq-white)', textDecoration: 'underline', cursor: 'pointer' }} onClick={deleteChat}>{vt.deleteYes}</button>
                    <button style={{ color: 'var(--lq-silver)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setConfirmDel(false)}>{vt.deleteNo}</button>
                  </div>
                )}
              </div>
              </div>
            ) : (<>
            {/* ── Messages ─────────────────────────────────────────────── */}
            <div data-lenis-prevent style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 14px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              {/* Welcome card: turning orb, name, greeting, quick questions (until the visitor has written) */}
              {!messages.some((m) => m.role === 'user') ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '2px 4px 6px' }}>
                  <div style={{ margin: '-14px -14px 0', alignSelf: 'stretch', display: 'flex', justifyContent: 'center', padding: '8px 0 4px', background: 'radial-gradient(75% 90% at 50% 45%, color-mix(in srgb, var(--c-signal) 42%, transparent), color-mix(in srgb, var(--c-pulse) 16%, transparent) 48%, transparent 78%)' }}>
                    <ChatOrb size={224} points={560} active={loading} />
                  </div>
                  <div style={{ alignSelf: 'stretch' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11.5, color: 'var(--lq-silver)' }}>{ui.assistantName}</p>
                    <p style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 600, lineHeight: 1.25, color: 'var(--lq-white)', fontFamily: 'var(--font-display)' }}>{ui.welcomeTitle}</p>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--lq-mist)' }}>{ui.welcomeText}</p>
                  </div>
                  {/* Quick questions as small cards (icon, title, hint); a click sends a full question */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignSelf: 'stretch', marginTop: 4 }}>
                    {ui.chips.map((c) => (
                      <button key={c.i} className="cw-chip lq-square" disabled={loading || locked} onClick={() => void send(c.q)}>
                        <span className="cw-chip-ic" aria-hidden="true">{CHIP_ICON[c.i]}</span>
                        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--lq-white)' }}>{c.t}</span>
                          <span style={{ fontSize: 11.5, lineHeight: 1.3, color: 'var(--lq-silver)' }}>{c.d}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px 4px' }}>
                  <ChatOrb size={40} points={140} active={loading} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--lq-white)' }}>{ui.assistantName}</span>
                </div>
              )}
              <p style={{ margin: '2px 0', fontSize: 10.5, lineHeight: 1.45, color: 'var(--c-ash)', textAlign: 'center', opacity: 0.85 }}>
                {ui.chatNotice}{' '}<a href={`${pagePath(lang, 'privacy')}#voice-assistant`} target="_blank" rel="noopener" style={{ color: 'var(--lq-silver)', textDecoration: 'underline' }}>{ui.details}</a>
              </p>
              {notice && <div role="status" style={{ padding: '9px 13px', borderRadius: 12, border: '1px solid var(--lq-line-strong)', color: 'var(--lq-mist)', fontSize: 12.5, lineHeight: 1.5 }}>{notice}</div>}
              {backupAsk && (
                <div role="alert" style={{ order: 9999, padding: '12px 14px', borderRadius: 14, border: '1px solid var(--c-lilac)', background: 'color-mix(in srgb, var(--c-lilac) 8%, var(--c-abyss))', fontSize: 13, lineHeight: 1.5, color: 'var(--lq-white)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span>{ui.backupAsk}</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button style={{ padding: '7px 14px', borderRadius: 9999, border: '1px solid var(--c-lilac)', color: 'var(--lq-white)', cursor: 'pointer' }} onClick={() => { const m = backupAsk; backupRef.current = true; setBackupAsk(null); void fetchReply(m); }}>{ui.backupYes}</button>
                    <button style={{ padding: '7px 14px', borderRadius: 9999, border: '1px solid var(--lq-line-strong)', color: 'var(--lq-silver)', cursor: 'pointer' }} onClick={() => { setBackupAsk(null); void toForm(); }}>{ui.backupNo}</button>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '82%',
                    padding: '9px 13px',
                    borderRadius: msg.role === 'user'
                      ? '12px 12px 4px 12px'
                      : '12px 12px 12px 4px',
                    background: msg.role === 'user'
                      ? 'var(--c-quartz)'
                      : 'var(--lq-kelp)',
                    color: msg.role === 'user'
                      ? 'var(--lq-abyss)'
                      : 'var(--lq-mist)',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    fontWeight: msg.role === 'user' ? 500 : 400,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <div style={{
                    padding: '9px 14px',
                    borderRadius: '12px 12px 12px 4px',
                    background: 'var(--lq-kelp)',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map((dot) => (
                      <div key={dot} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--lq-g2)',
                        animation: `dot-pulse 1.2s ${dot * 0.2}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && !loading && (
                <div style={{
                  padding: '9px 13px',
                  borderRadius: 12,
                  background: 'color-mix(in srgb, var(--lq-lavender) 14%, transparent)',
                  border: '1px solid var(--lq-line-strong)',
                  color: 'var(--lq-mist)',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              {ended && (
                <div role="status" style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid var(--lq-line-strong)', color: 'var(--lq-mist)', fontSize: 12.5, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span>{vt.chatEnded}</span>
                  <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <a href={pagePath(lang, 'contact')} onClick={(e) => { e.preventDefault(); setOpen(false); navigate(pagePath(lang, 'contact')); }} style={{ color: 'var(--lq-white)', textDecoration: 'underline' }}>{vt.chatForm}</a>
                    <a href={pagePath(lang, 'faq')} onClick={(e) => { e.preventDefault(); setOpen(false); navigate(pagePath(lang, 'faq')); }} style={{ color: 'var(--lq-white)', textDecoration: 'underline' }}>{vt.chatFaq}</a>
                  </span>
                </div>
              )}

              {/* Appointment success banner */}
              {appointmentDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'color-mix(in srgb, var(--lq-g2) 14%, transparent)',
                    border: '1px solid var(--lq-g2)',
                    color: 'var(--lq-mist)',
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: 'center',
                  }}
                >
                  {ui.appointmentDone}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Mic consent banner ───────────────────────────────────── */}
            <AnimatePresence>
              {micAsked && !micGranted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--lq-kelp)',
                    borderTop: '1px solid var(--lq-line)',
                    fontSize: 12.5,
                    color: 'var(--lq-mist)',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontWeight: 500 }}>{ui.micConsent}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={grantMic}
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 9999, border: '1px solid color-mix(in srgb, var(--c-quartz) 14%, transparent)',
                        background: 'color-mix(in srgb, var(--c-quartz) 5%, var(--c-abyss))', color: 'var(--c-quartz)',
                        fontSize: 11, fontWeight: 500, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                      }}
                    >
                      {ui.micAllow}
                    </button>
                    <button
                      onClick={denyMic}
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 6,
                        border: '1px solid var(--lq-line-strong)',
                        background: 'transparent', color: 'var(--lq-white)',
                        fontSize: 11, fontWeight: 500, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                      }}
                    >
                      {ui.micDeny}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input row ────────────────────────────────────────────── */}
            <div style={{
              padding: '12px 14px 14px',
              borderTop: '1px solid var(--lq-line)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexShrink: 0,
            }}>
              {/* Mic button */}
              {SHOW_MIC && hasSR && (
                <button
                  onClick={handleMicClick}
                  aria-label={micActive ? ui.micStop : ui.micStart}
                  title={micActive ? ui.micStop : ui.micStart}
                  disabled={locked || loading}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: micActive ? '1px solid var(--c-lilac)' : '1px solid color-mix(in srgb, var(--c-quartz) 14%, transparent)',
                    background: micActive ? 'color-mix(in srgb, var(--c-lilac) 18%, var(--c-abyss))' : 'color-mix(in srgb, var(--c-quartz) 5%, var(--c-abyss))',
                    color: 'var(--c-quartz)',
                    cursor: locked || loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    animation: micActive ? 'mic-pulse 1s ease-in-out infinite' : 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              )}

              <ChatOrb size={36} points={150} active={loading} />
              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                className="cw-ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locked ? '—' : ui.placeholder}
                disabled={loading || locked}
                maxLength={500}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  minWidth: 0,
                  borderRadius: 0,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--lq-white)',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'var(--lq-font)',
                  opacity: locked ? 0.5 : 1,
                }}
              />

              {/* Send button: appears only while typing (reference layout) */}
              {input.trim() && <button
                onClick={send}
                aria-label={ui.send}
                disabled={!input.trim() || loading || locked}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: input.trim() && !loading && !locked ? '1px solid var(--c-lilac)' : '1px solid color-mix(in srgb, var(--c-quartz) 14%, transparent)',
                  background: input.trim() && !loading && !locked
                    ? 'color-mix(in srgb, var(--c-lilac) 18%, var(--c-abyss))'
                    : 'color-mix(in srgb, var(--c-quartz) 5%, var(--c-abyss))',
                  color: input.trim() && !loading && !locked
                    ? 'var(--c-quartz)'
                    : 'var(--lq-silver)',
                  cursor: !input.trim() || loading || locked ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>}
            </div>
            {/* New chat / delete: always reachable under the input once there is a conversation */}
            {messages.length > 0 && (
              <div style={{ padding: '0 14px 10px', display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', fontSize: 12, color: 'var(--lq-silver)', flexShrink: 0 }}>
                {!confirmDel ? (<>
                  <button onClick={newChat} style={{ color: 'var(--lq-silver)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>{ui.newChat}</button>
                  <button onClick={() => setConfirmDel(true)} style={{ color: 'var(--lq-silver)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>{vt.deleteBtn}</button>
                </>) : (<span role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', color: 'var(--lq-mist)' }}>
                  <span>{vt.deleteConfirm}</span>
                  <button onClick={deleteChat} style={{ color: 'var(--lq-white)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>{vt.deleteYes}</button>
                  <button onClick={() => setConfirmDel(false)} style={{ color: 'var(--lq-silver)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}>{vt.deleteNo}</button>
                </span>)}
              </div>
            )}

            </>)}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyframes (injected once) ───────────────────────────────────── */}
      <style>{`
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes mic-pulse {
          0%, 100% { outline: 1px solid var(--lq-g2); outline-offset: 0; }
          50% { outline: 1px solid transparent; outline-offset: 6px; }
        }
        .cw-ai-panel { bottom: 28px; right: 28px; width: min(400px, calc(100vw - 32px)); height: min(680px, calc(100dvh - 48px)); }
        .cw-ai-input, .cw-ai-input:focus, .cw-ai-input:focus-visible { border: none !important; box-shadow: none !important; outline: none !important; }
        .cw-chip { display: flex; align-items: center; gap: 10px; text-align: left; padding: 10px 11px; border-radius: 14px; border: 1px solid color-mix(in srgb, var(--c-quartz) 8%, transparent); background: color-mix(in srgb, var(--c-quartz) 6%, transparent); cursor: pointer; transition: background .2s, border-color .2s, transform .2s; min-width: 0; }
        .cw-chip:hover:not(:disabled) { background: color-mix(in srgb, var(--c-lilac) 14%, transparent); border-color: color-mix(in srgb, var(--c-lilac) 45%, transparent); transform: translateY(-1px); }
        .cw-chip-ic { flex-shrink: 0; width: 30px; height: 30px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--c-lilac); background: color-mix(in srgb, var(--c-lilac) 14%, transparent); }
                .cw-ai-input::placeholder { color: var(--lq-silver); }
        .cw-ai-input:focus { border-color: var(--lq-g2) !important; outline: 1px solid var(--lq-g2) !important; }
        @media (max-width: 640px) {
          .cw-ai-panel { left: 0; right: 0; bottom: 0; width: 100%; height: min(90dvh, 720px); border-radius: 16px 16px 0 0 !important; }
        }
      `}</style>
    </>
  );
}

