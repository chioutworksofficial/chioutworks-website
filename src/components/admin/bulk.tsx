import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from './api';

// Selection limited to currently visible ids; supports shift-click range.
export function useSelection(visible: string[]) {
  const [raw, setRaw] = useState<Set<string>>(new Set());
  const last = useRef<string | null>(null);
  const vis = new Set(visible);
  const sel = [...raw].filter((id) => vis.has(id));
  const selSet = new Set(sel);
  const toggle = useCallback((id: string, shift: boolean) => {
    setRaw((prev) => {
      const next = new Set(prev);
      const on = !prev.has(id);
      const a = last.current ? visible.indexOf(last.current) : -1;
      const b = visible.indexOf(id);
      if (shift && a >= 0 && b >= 0) {
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) { if (on) next.add(visible[i]); else next.delete(visible[i]); }
      } else if (on) next.add(id); else next.delete(id);
      return next;
    });
    last.current = id;
  }, [visible]);
  const all = visible.length > 0 && sel.length === visible.length;
  const toggleAll = () => setRaw(all ? new Set() : new Set(visible));
  const clear = () => { setRaw(new Set()); last.current = null; };
  return { sel, has: (id: string) => selSet.has(id), toggle, all, some: sel.length > 0 && !all, toggleAll, clear };
}

export function Check({ checked, label, onToggle, indeterminate }: { checked: boolean; label: string; onToggle: (shift: boolean) => void; indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return <input ref={ref} type="checkbox" className="adm-check" aria-label={label} checked={checked}
    onChange={() => { /* handled in onClick for shiftKey */ }}
    onClick={(e) => { e.stopPropagation(); onToggle(e.shiftKey); }} />;
}

export function SelectHeader({ s, total }: { s: ReturnType<typeof useSelection>; total: number }) {
  if (!total) return null;
  return (
    <div className="adm-selhead">
      <label className="adm-selall"><Check checked={s.all} indeterminate={s.some} label="Tümünü seç" onToggle={s.toggleAll} />Tümünü seç</label>
      <span className="adm-meta" aria-live="polite">{s.sel.length} seçili</span>
      {s.sel.length > 0 && <button className="adm-link" onClick={s.clear}>Seçimi temizle</button>}
    </div>
  );
}

export function BulkBar({ count, onDelete, children }: { count: number; onDelete: () => void; children?: ReactNode }) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (!count) setConfirm(false); }, [count]);
  if (!count) return null;
  return (
    <div className="adm-bulkbar" role="region" aria-label="Toplu işlemler">
      {confirm ? <>
        <span className="adm-name" role="alert">{count} kayıt kalıcı olarak silinecek. Emin misiniz?</span>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => { setConfirm(false); onDelete(); }}>Sil</button>
        <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(false)}>Vazgeç</button>
      </> : <>
        <span className="adm-name">{count} seçili</span>
        {children}
        <button className="lq-btn-ghost adm-btn sm" onClick={() => setConfirm(true)}>Sil</button>
      </>}
    </div>
  );
}

export type Note = { ok: boolean; text: string } | null;
export function useNote() {
  const [note, setNote] = useState<Note>(null);
  const t = useRef<number | undefined>(undefined);
  const show = (n: Note) => { window.clearTimeout(t.current); setNote(n); if (n?.ok) t.current = window.setTimeout(() => setNote(null), 4000); };
  const el = note && <div className="adm-banner" role={note.ok ? 'status' : 'alert'}>{note.text}</div>;
  return { show, el };
}

// POST in chunks of 300 ids (server cap 500, JSON body cap 16kb).
export async function bulkApi(path: string, ids: string[], action: string): Promise<number> {
  let n = 0;
  for (let i = 0; i < ids.length; i += 300) {
    const chunk = ids.slice(i, i + 300);
    const r = await api<{ affected?: number }>(path, 'POST', { ids: chunk, action });
    n += r.affected ?? chunk.length;
  }
  return n;
}
