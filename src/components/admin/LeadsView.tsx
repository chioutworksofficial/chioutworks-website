import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Tab } from '../../pages/Admin';

// Müşteri adayları (server/leads.ts): tüm toplanan kişiler tek yerde, kaynak ayrı. Yönetim arayüzü Türkçe.
type Src = 'newsletter' | 'sitecheck' | 'voice' | 'chat' | 'form';
interface Lead {
  id: string; source: Src; sources: Src[]; refs: { source: Src; tab: string; id: string }[]; refId: string; createdAt: string; lastSeen: string;
  name?: string; email?: string; phone?: string; website?: string; address?: string; socials?: { platform: string; url: string }[]; company?: string;
  language?: string; country?: string; gender?: 'm' | 'f'; consent?: string; status?: string; summary: string;
  state?: { status: string; note: string; at: string };
  score?: 'sıcak' | 'kararsız'; preferredChannel?: string; callConsent?: boolean; doNotCall?: boolean;
}
interface Anon { id: string; source: 'voice' | 'chat'; createdAt: string; language: string; turns: number; topic: string }
const CHAN: Record<string, string> = { email: 'E-posta', phone: 'Telefon (aranabilir)', whatsapp: 'WhatsApp' };
const SRC: Record<Src, string> = { newsletter: 'Bülten', sitecheck: 'Site kontrolü', voice: 'Sesli asistan', chat: 'Sohbet', form: 'Form' };
const TABS: ('all' | Src)[] = ['all', 'newsletter', 'sitecheck', 'voice', 'chat', 'form'];
const STATUS: [string, string][] = [['yeni', 'Yeni'], ['iletisime-gecildi', 'İletişime geçildi'], ['musteri', 'Müşteri'], ['ilgisiz', 'İlgisiz']];
const SOC: Record<string, string> = { instagram: 'IG', facebook: 'FB', linkedin: 'in', tiktok: 'TT', x: 'X', youtube: 'YT', telegram: 'TG' };
const EMPTY: Record<string, string> = { all: 'Henüz müşteri adayı yok.', newsletter: 'Henüz bülten abonesi yok.', sitecheck: 'Henüz site kontrolü talebi yok.', voice: 'Henüz iletişim bırakan sesli asistan görüşmesi yok.', chat: 'Henüz iletişim bırakan sohbet yok.', form: 'Henüz form veya analiz formu talebi yok.' };
const fmt = (s: string) => (s ? new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const safeHref = (u: string) => (/^https?:\/\//i.test(u) ? u : '#');

export default function LeadsView({ go }: { go: (t: Tab, id?: string) => void }) {
  const [all, setAll] = useState<Lead[] | null>(null);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState<'all' | Src | 'anon'>('all');
  const [anon, setAnon] = useState<Anon[] | null>(null);
  const [q, setQ] = useState('');
  const [needPhone, setNeedPhone] = useState(false);
  const [needSite, setNeedSite] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState<Lead | null>(null);
  const load = useCallback(() => { setErr(false); api<{ leads: Lead[] }>('/api/admin/leads').then((r) => setAll(r.leads)).catch(() => setErr(true)); }, []);
  useEffect(load, [load]);
  useEffect(() => { if (tab === 'anon' && !anon) api<{ sessions: Anon[] }>('/api/admin/leads/anonymous').then((r) => setAnon(r.sessions)).catch(() => setAnon([])); }, [tab, anon]);

  const counts = useMemo(() => { const c: Record<string, number> = { all: all?.length ?? 0 }; for (const l of all ?? []) for (const s of l.sources) c[s] = (c[s] ?? 0) + 1; return c; }, [all]);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase(); const f = from ? Date.parse(from) : 0; const e = to ? Date.parse(to) + 864e5 : Infinity;
    return (all ?? []).filter((l) => {
      if (tab !== 'all' && tab !== 'anon' && !l.sources.includes(tab)) return false;
      if (needPhone && !l.phone) return false;
      if (needSite && !l.website) return false;
      const d = Date.parse(l.lastSeen); if (d < f || d >= e) return false;
      return !t || [l.name, l.email, l.phone, l.website, l.company, l.address, l.summary].some((x) => x?.toLowerCase().includes(t));
    });
  }, [all, tab, q, needPhone, needSite, from, to]);

  const csv = () => {
    const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
    const head = ['Ad', 'İşletme adı', 'E-posta', 'Telefon', 'Web sitesi', 'Sosyal', 'Adres', 'Kaynak', 'Dil', 'Durum', 'Skor', 'Tercih edilen iletişim', 'Aranabilir', 'Son görülme'];
    const lines = rows.map((l) => [l.name, l.company, l.email, l.phone, l.website, (l.socials ?? []).map((s) => s.url).join(' '), l.address, l.sources.map((s) => SRC[s]).join(' + '), l.language, STATUS.find((s) => s[0] === (l.state?.status ?? 'yeni'))?.[1], l.score, l.preferredChannel ? CHAN[l.preferredChannel] : '', l.callConsent ? 'evet' : '', fmt(l.lastSeen)].map(cell).join(','));
    const blob = new Blob(['﻿' + [head.map(cell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `musteri-adaylari-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const badges = (l: Lead) => l.sources.map((s) => <span key={s} className="adm-chip tag">{SRC[s]}</span>);
  const socials = (l: Lead) => (l.socials ?? []).map((s) => <a key={s.url} className="adm-chip" href={safeHref(s.url)} target="_blank" rel="noopener noreferrer" title={s.url} aria-label={s.platform} onClick={(e) => e.stopPropagation()}>{SOC[s.platform] ?? s.platform}</a>);
  const site = (l: Lead) => l.website ? <a href={safeHref(l.website)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{host(l.website)}</a> : null;

  const chips = (
    <div className="adm-chips" role="tablist">{TABS.map((k) => <button key={k} role="tab" aria-selected={tab === k} className="adm-chip" aria-pressed={tab === k} onClick={() => setTab(k)}>{k === 'all' ? 'Tümü' : SRC[k]} ({counts[k] ?? 0})</button>)}<button role="tab" aria-selected={tab === 'anon'} className="adm-chip" aria-pressed={tab === 'anon'} onClick={() => setTab('anon')}>Anonim görüşmeler{anon ? ` (${anon.length})` : ''}</button></div>
  );
  if (tab === 'anon') return (
    <>
      <h1 className="adm-h1">Müşteri adayları</h1>
      <p className="adm-sub">Anonim görüşmeler: iletişim bırakmayan sesli asistan ve sohbet oturumları. Yalnızca konu özeti gösterilir; kişisel veri yoktur.</p>
      {chips}
      {!anon && <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>}
      {anon && !anon.length && <div className="adm-banner" role="status">Henüz anonim görüşme yok.</div>}
      {anon && anon.length > 0 && <div className="adm-list">{anon.map((a) => <div key={a.id} className="lq-card adm-card"><div className="adm-head"><span className="adm-name">{a.topic || '—'}</span><span className="adm-chip tag">{SRC[a.source]}</span></div><div className="adm-meta">{fmt(a.createdAt)} · {a.language.toUpperCase()} · {a.turns} mesaj</div></div>)}</div>}
    </>
  );
  return (
    <>
      <h1 className="adm-h1">Müşteri adayları</h1>
      <p className="adm-sub">Bülten, site kontrolü, sesli asistan, sohbet ve formlardan gelen tüm kişiler. Aynı e-posta veya telefon tek kayıtta birleşir.</p>
      {chips}
      <div className="adm-ranges">
        <input className="adm-input lds-search" type="search" placeholder="Ara: ad, e-posta, telefon, site…" aria-label="Ara" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="adm-selall"><input type="checkbox" className="adm-check" checked={needPhone} onChange={(e) => setNeedPhone(e.target.checked)} /> Telefonu var</label>
        <label className="adm-selall"><input type="checkbox" className="adm-check" checked={needSite} onChange={(e) => setNeedSite(e.target.checked)} /> Web sitesi var</label>
        <label className="adm-selall">Başlangıç <input className="adm-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="adm-selall">Bitiş <input className="adm-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button className="lq-btn-ghost adm-btn sm" disabled={!rows.length} onClick={csv}>CSV indir ({rows.length})</button>
      </div>
      {err && <div className="adm-banner" role="alert">Yüklenemedi. <button className="lq-btn-ghost adm-btn sm" onClick={load}>Tekrar dene</button></div>}
      {!all && !err && <div className="adm-list"><div className="adm-skel" /><div className="adm-skel" /></div>}
      {all && !rows.length && <div className="adm-banner" role="status">{all.length && (q || needPhone || needSite || from || to || tab !== 'all') ? 'Bu filtreyle eşleşen kayıt yok.' : EMPTY[tab]}</div>}
      {rows.length > 0 && <>
        <div className="adm-table-wrap lds-table"><table className="adm-table"><thead><tr><th>Ad</th><th>İşletme adı</th><th>E-posta</th><th>Telefon</th><th>Web sitesi</th><th>Sosyal</th><th>Adres</th><th>Kaynak</th><th>Tarih</th></tr></thead><tbody>
          {rows.map((l) => <tr key={l.id} tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setOpen(l)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(l); }}>
            <td>{l.name ?? '—'}{l.score && <> <span className="adm-chip tag">{l.score}</span></>}{l.doNotCall ? <> <span className="adm-chip" data-state="bad">Aranmasın</span></> : l.callConsent && <> <span className="adm-chip">Aranabilir</span></>}{l.state && l.state.status !== 'yeni' && <> <span className="adm-chip">{STATUS.find((s) => s[0] === l.state!.status)?.[1]}</span></>}</td><td><b>{l.company ?? '—'}</b></td><td>{l.email ?? '—'}</td><td>{l.phone ?? '—'}</td><td>{site(l) ?? '—'}</td><td><span className="lds-soc">{socials(l)}</span></td><td>{l.address ?? '—'}</td><td><span className="lds-soc">{badges(l)}</span></td><td>{fmt(l.lastSeen)}</td></tr>)}
        </tbody></table></div>
        <div className="adm-list lds-cards">{rows.map((l) => <button key={l.id} className="adm-row lds-card" onClick={() => setOpen(l)}>
          <b>{l.name ?? l.company ?? l.email ?? l.phone}{l.score ? ` · ${l.score}` : ''}{l.doNotCall ? ' · aranmasın' : l.callConsent ? ' · aranabilir' : ''}</b>
          {l.company && l.name && <span><b>{l.company}</b></span>}
          {l.email && <span>{l.email}</span>}{l.phone && <span>{l.phone}</span>}{l.website && <span>{host(l.website)}</span>}
          <span className="lds-soc">{badges(l)}</span><small>{fmt(l.lastSeen)}</small>
        </button>)}</div>
      </>}
      {open && <Drawer lead={open} go={go} onClose={() => setOpen(null)} onSaved={(s) => { setAll((p) => p && p.map((x) => (x.id === open.id ? { ...x, state: s } : x))); setOpen((o) => o && { ...o, state: s }); }} />}
    </>
  );
}

function Drawer({ lead: l, go, onClose, onSaved }: { lead: Lead; go: (t: Tab, id?: string) => void; onClose: () => void; onSaved: (s: Lead['state']) => void }) {
  const [status, setStatus] = useState(l.state?.status ?? 'yeni');
  const [note, setNote] = useState(l.state?.note ?? '');
  const [dnc, setDnc] = useState(l.doNotCall === true);
  const [msg, setMsg] = useState('');
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  const save = async () => {
    setMsg('');
    try { await api(`/api/admin/leads/${encodeURIComponent(l.id)}`, 'PUT', { status, note, doNotCall: dnc }); onSaved({ status, note, at: new Date().toISOString() }); setMsg('Kaydedildi.'); } catch { setMsg('Kaydedilemedi.'); }
  };
  const jump = (r: Lead['refs'][number]) => { const t = r.tab as Tab; onClose(); go(t, t === 'requests' || t === 'voice' ? r.id : undefined); };
  const F = ({ k, children }: { k: string; children?: React.ReactNode }) => children ? <div className="adm-field"><span className="adm-label">{k}</span><div>{children}</div></div> : null;
  return (
    <>
      <div className="adm-drawer-bg" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Müşteri adayı ayrıntısı">
        <div className="adm-head"><h2>{l.name ?? l.company ?? l.email ?? l.phone}</h2><button className="lq-btn-ghost adm-btn sm" onClick={onClose}>Kapat</button></div>
        <div className="adm-chips">{l.sources.map((s) => <span key={s} className="adm-chip tag">{SRC[s]}</span>)}</div>
        <F k="Ad">{l.name}</F><F k="İşletme adı">{l.company}</F>
        <F k="E-posta">{l.email && <a href={`mailto:${l.email}`}>{l.email}</a>}</F>
        <F k="Telefon">{l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}</F>
        <F k="Web sitesi">{l.website && <a href={safeHref(l.website)} target="_blank" rel="noopener noreferrer">{l.website}</a>}</F>
        <F k="Sosyal medya">{l.socials?.length ? <span className="lds-soc">{l.socials.map((s) => <a key={s.url} href={safeHref(s.url)} target="_blank" rel="noopener noreferrer">{s.platform}: {host(s.url)}</a>)}</span> : null}</F>
        <F k="Adres">{l.address}</F><F k="Dil">{l.language?.toUpperCase()}</F><F k="Ülke">{l.country}</F>
        <F k="Cinsiyet (kişinin kendi beyanı)">{l.gender === 'm' ? 'Erkek' : l.gender === 'f' ? 'Kadın' : null}</F>
        <F k="Durum / izin">{[l.status, l.consent].filter(Boolean).join(' · ')}</F>
        <F k="Skor">{l.score}</F><F k="Tercih edilen iletişim">{l.preferredChannel ? CHAN[l.preferredChannel] : null}</F><F k="Arama izni">{l.callConsent ? 'Evet: telefonu seçti, Voice Agent arayabilir' : null}</F>
        <F k="Özet">{l.summary}</F>
        <F k="İlk kayıt">{fmt(l.createdAt)}</F><F k="Son görülme">{fmt(l.lastSeen)}</F>
        <div className="adm-field"><span className="adm-label">Orijinal kayıt</span><div className="adm-actions">{l.refs.map((r) => <button key={`${r.tab}:${r.id}`} className="lq-btn-ghost adm-btn sm" onClick={() => jump(r)}>{SRC[r.source]} sekmesinde aç</button>)}</div></div>
        <div className="adm-field"><label className="adm-label" htmlFor="lds-st">Takip durumu</label>
          <select id="lds-st" className="adm-input" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <label className="adm-selall"><input type="checkbox" className="adm-check" checked={dnc} onChange={(e) => setDnc(e.target.checked)} disabled={!l.phone} /> Aranmasın (Voice Agent bu numarayı asla aramaz)</label>
          <label className="adm-label" htmlFor="lds-note">Not</label>
          <textarea id="lds-note" className="adm-input" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="adm-actions"><button className="lq-btn-ghost adm-btn sm adm-pri" onClick={save}>Kaydet</button>{msg && <span className="adm-sub" style={{ margin: 0 }} role="status">{msg}</span>}</div>
        </div>
      </aside>
    </>
  );
}
