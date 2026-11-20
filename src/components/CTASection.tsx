import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CONTACT } from '../data/sections';
import type { Lang } from '../translations';
import { CONTACT_PAGE_UI } from '../site/i18n/contactPage';
import { RESOURCES_TOPICS, RESOURCES_TOPIC_UI } from '../site/i18n/resources';
import { createAppointment } from '../lib/appointments';
import { readVoiceSession } from '../lib/voiceSession';
import VoiceTranscriptModal from '../site/VoiceTranscriptModal';
import MonthCalendar from './MonthCalendar';
import BtnArrow from '../site/BtnArrow';
import { calcRoi, clearRoi, fmtMoney, fmtNum, readRoi, summaryLine, UNITS } from '../lib/roiModel';
import { guardFields, prefetchFormToken } from '../lib/formGuard';

interface Props { lang: Lang; }

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 6,
  border: '1px solid var(--lq-line)',
  background: 'var(--lq-deep)',
  color: 'var(--lq-white)',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'var(--lq-font)',
};
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lq-silver)' };
const mono: React.CSSProperties = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lq-silver)' };
const focusOn = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--lq-g2)'; };
const focusOff = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--lq-line)'; };

function Field({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label style={labelStyle}>
      {label} *
      <input required type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onFocus={focusOn} onBlur={focusOff} style={inputStyle} />
    </label>
  );
}

export default function CTASection({ lang }: Props) {
  const d = CONTACT[lang];
  const u = CONTACT_PAGE_UI[lang];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [reply, setReply] = useState<'written' | 'phone'>('written');
  const loc = useLocation();
  const rawTopic = new URLSearchParams(loc.search).get('topic');
  const initTopic = RESOURCES_TOPICS.find((t) => t === rawTopic) ?? null;
  const [topic, setTopic] = useState<(typeof RESOURCES_TOPICS)[number] | null>(initTopic);
  const tu = RESOURCES_TOPIC_UI[lang];
  const voiceState = (loc.state ?? null) as { voiceSessionId?: string; voiceSecret?: string; prefill?: string } | null;
  const [voice, setVoice] = useState(() => (typeof voiceState?.voiceSessionId === 'string' && typeof voiceState.voiceSecret === 'string' ? { id: voiceState.voiceSessionId, secret: voiceState.voiceSecret } : readVoiceSession()));
  const [roi, setRoi] = useState(readRoi);
  const [showRoi, setShowRoi] = useState(false);
  const [attachVoice, setAttachVoice] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const [message, setMessage] = useState(typeof voiceState?.prefill === 'string' ? voiceState.prefill.slice(0, 1000) : initTopic ? tu.starter[initTopic] : roi ? summaryLine(roi, lang) : '');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState('');
  useEffect(() => { prefetchFormToken(); }, []);
  const [preferredStart, setPreferredStart] = useState<string | null>(null);
  const [callTime, setCallTime] = useState('');
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch('/api/availability').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && Array.isArray(j.blocked)) setBlocked(new Set<string>(j.blocked)); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError(d.requiredError);
      return;
    }
    if (reply === 'phone' && (!preferredStart || !callTime)) {
      setError(u.callTimeLabel);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, phone, email, message, replyPreference: reply, ...(topic ? { topic } : roi ? { topic: 'roi' } : {}), ...(roi ? { roiCalc: roi } : {}), ...(preferredStart ? { preferredStart } : {}), ...(reply === 'phone' && callTime ? { callTime } : {}), lang, page: window.location.pathname, ...(await guardFields()), ...(voice && attachVoice ? { voiceSessionId: voice.id, voiceSecret: voice.secret } : {}) }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        if (j?.error === 'date_blocked') { setBlocked((b) => new Set(b).add(preferredStart ?? '')); setPreferredStart(null); setError(u.dateBlocked); setSending(false); return; }
        throw new Error(String(r.status));
      }
    } catch {
      setError(u.sendError);
      setSending(false);
      return;
    }
    setSending(false);
    createAppointment({ name, email, phone, address, date: new Date().toISOString().slice(0, 10), preferredTime: '', message });
    setSubmitted(true);
    if (roi) { clearRoi(); setRoi(null); }
    setName(''); setEmail(''); setPhone(''); setAddress(''); setReply('written'); setMessage(''); setPreferredStart(null); setCallTime('');
  };


  const facts: { label: string; value: string; href?: string; icon?: boolean }[] = [
    { label: u.replyTime, value: u.replyTimeValue },
    { label: u.languages, value: u.languagesValue },
    { label: u.location, value: u.locationValue, href: 'https://maps.google.com/?q=Waldstraße+124,+65451+Kelsterbach' },
    { label: u.linkedin, value: 'Chousein Chiout', href: 'https://www.linkedin.com/in/chousein-chiout-29345323a/' },
  ];
  const panel: React.CSSProperties = { padding: 'clamp(18px, 2.4vw, 28px)', position: 'relative' };
  const panelTitle: React.CSSProperties = { fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: 0 };

  return (
    <div className="relative mx-auto px-5 md:px-9" style={{ maxWidth: 1200, paddingBottom: 'clamp(56px, 8vh, 96px)' }}>
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.15fr_1fr] items-start">
        {/* Left - request form */}
        <div id="contact-form" className="lq-card" style={{ ...panel, overflow: 'hidden' }}>
          {submitted ? (
            <div style={{ padding: '24px 0' }}>
              <p style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', margin: '0 0 10px' }}>{d.successTitle}</p>
              <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--lq-silver)', margin: 0 }}>{d.successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={panelTitle}>{d.formTitle}</p>
              {topic && (
                <div style={{ display: 'flex' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 6px 5px 12px', borderRadius: 9999, fontSize: 12, border: '1px solid var(--c-hairline)', background: 'var(--c-deep-sea)', color: 'var(--c-quartz)' }}>
                    {tu.prefix}: {tu.labels[topic]}
                    <button type="button" aria-label={tu.remove} onClick={() => setTopic(null)} style={{ width: 20, height: 20, borderRadius: 9999, cursor: 'pointer', color: 'var(--c-mist)', lineHeight: 1 }}>×</button>
                  </span>
                </div>
              )}
              {roi && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', alignSelf: 'flex-start', gap: 10, padding: '5px 6px 5px 12px', borderRadius: 9999, fontSize: 12, border: '1px solid var(--c-hairline)', background: 'var(--c-deep-sea)', color: 'var(--c-quartz)' }}>
                    {u.roiAttached}
                    <button type="button" onClick={() => setShowRoi((v) => !v)} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--lq-white)' }}>{showRoi ? u.roiHide : u.roiView}</button>
                    <button type="button" aria-label={u.roiRemove} onClick={() => { clearRoi(); setRoi(null); }} style={{ padding: '0 10px', height: 20, borderRadius: 9999, cursor: 'pointer', color: 'var(--c-mist)' }}>× {u.roiRemove}</button>
                  </span>
                  {showRoi && (() => { const r = calcRoi(roi.tasks, roi.staff, roi.cost); const un = UNITS[lang]; return (
                    <div style={{ fontSize: 12, color: 'var(--lq-silver)', lineHeight: 1.6 }}>
                      <div>{roi.sectorLabel} · {fmtMoney(lang, roi.currency, roi.cost)}/{un.h} · ×{fmtNum(lang, roi.staff)}</div>
                      {roi.tasks.map((t, i) => <div key={i}>{t.name || '-'} · {t.min} {un.min} × {t.perWeek} · {t.auto}%</div>)}
                      <div style={{ color: 'var(--lq-white)' }}>{fmtNum(lang, r.monthH)} {un.h} · {fmtMoney(lang, roi.currency, r.moneyMonth)} · {fmtMoney(lang, roi.currency, r.moneyYear)}</div>
                    </div>); })()}
                </div>
              )}
              {voice && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--lq-silver)' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={attachVoice} onChange={(e) => setAttachVoice(e.target.checked)} />
                    {u.voiceAttach}
                  </label>
                  <button type="button" onClick={() => setShowVoice(true)} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--lq-white)' }}>{u.voiceView}</button>
                </div>
              )}
              <input type="text" name="website" data-hp="1" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label={d.nameLabel} type="text" value={name} onChange={setName} placeholder={d.namePlaceholder} />
                <Field label={d.phoneLabel} type="tel" value={phone} onChange={setPhone} placeholder={d.phonePlaceholder} />
                <Field label={d.emailLabel} type="email" value={email} onChange={setEmail} placeholder={d.emailPlaceholder} />
                <Field label={d.addressLabel} type="text" value={address} onChange={setAddress} placeholder={d.addressPlaceholder} />
              </div>
              <label style={labelStyle}>
                {d.messageLabel}
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={d.messagePlaceholder} rows={3} onFocus={focusOn} onBlur={focusOff} style={{ ...inputStyle, resize: 'vertical' }} />
              </label>

              <div>
                <p style={{ ...mono, margin: '0 0 8px' }}>{u.reply}</p>
                <div role="radiogroup" aria-label={u.reply} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {([['written', u.replyWritten], ['phone', u.replyPhone]] as const).map(([k, l]) => (
                    <button key={k} type="button" role="radio" aria-checked={reply === k} onClick={() => setReply(k)}
                      style={{ padding: '8px 14px', borderRadius: 9999, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--lq-font)',
                        border: reply === k ? '1px solid var(--c-lilac)' : '1px solid var(--c-hairline)',
                        background: reply === k ? 'color-mix(in srgb, var(--c-lilac) 18%, transparent)' : 'var(--c-deep-sea)',
                        color: reply === k ? 'var(--c-quartz)' : 'var(--c-mist)' }}>{l}</button>
                  ))}
                </div>
              </div>

              {error && <p role="alert" style={{ fontSize: 13, color: 'var(--lq-mist)', margin: 0 }}>{error}</p>}

              <button type="submit" disabled={sending} className="lq-btn-ghost lq-btn-block" style={{ marginTop: 4, opacity: sending ? 0.6 : 1 }}>
                {sending ? u.sending : d.submitLabel}<BtnArrow />
              </button>
            </form>
          )}
        </div>

        {/* Right - calendar + info */}
        <div className="flex flex-col gap-6">
          <div className="lq-card" style={panel}>
            <p style={{ ...panelTitle, fontSize: 16, marginBottom: 14 }}>{reply === 'phone' ? u.startLabel.replace(/\s*\([^)]*\)\s*$/, '') + ' *' : u.startLabel}</p>
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <MonthCalendar lang={lang} selected={preferredStart} onSelectDay={setPreferredStart} blockedDays={blocked} disabledLabel={u.bookedDays} />
              {blocked.size > 0 && <p style={{ ...mono, margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}><span aria-hidden style={{ width: 12, height: 12, borderRadius: 9999, background: 'repeating-linear-gradient(45deg, color-mix(in srgb, var(--c-slate) 35%, transparent) 0 3px, transparent 3px 6px)', border: '1px solid var(--c-hairline)' }} />{u.bookedDays}</p>}
            </div>
            {reply === 'phone' && (
              <div style={{ marginTop: 16 }}>
                <p style={{ ...mono, margin: '0 0 8px' }}>{u.callTimeLabel} *</p>
                <div role="radiogroup" aria-label={u.callTimeLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['10:00', '11:30', '14:00', '15:30', '17:00'].map(t => (
                    <button key={t} type="button" role="radio" aria-checked={callTime === t} onClick={() => setCallTime(t)}
                      style={{ padding: '8px 14px', borderRadius: 9999, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--lq-font)',
                        border: callTime === t ? '1px solid var(--c-lilac)' : '1px solid var(--c-hairline)',
                        background: callTime === t ? 'color-mix(in srgb, var(--c-lilac) 18%, transparent)' : 'var(--c-deep-sea)',
                        color: callTime === t ? 'var(--c-quartz)' : 'var(--c-mist)' }}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--lq-line)' }}>
            {facts.map(f => (
              <div key={f.label} className="flex items-baseline justify-between gap-4" style={{ padding: '12px 0', borderBottom: '1px solid var(--lq-line)' }}>
                <span style={mono}>{f.label}</span>
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'var(--lq-white)', textDecoration: 'none', textAlign: 'right' }}>{f.value}</a>
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--lq-white)', textAlign: 'right' }}>{f.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {showVoice && voice && <VoiceTranscriptModal lang={lang} id={voice.id} secret={voice.secret} onClose={() => setShowVoice(false)} onDeleted={() => setVoice(null)} />}
    </div>
  );
}
