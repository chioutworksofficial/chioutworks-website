import { useState } from 'react';
import { GROUP_ID, HINTS, TAB_ICON } from './hints';
import type { Tab } from '../../pages/Admin';

const key = (t: Tab) => `cw_adm_hint_${t}`;
const read = (t: Tab) => { try { return localStorage.getItem(key(t)) === '1'; } catch { return false; } };

/** Slim collapsible "what is this section for" card; collapsed state is remembered per tab. Mount with key={tab}. */
export default function TabHint({ tab, group, label, hideCard }: { tab: Tab; group: string; label: string; hideCard?: boolean }) {
  const [closed, setClosed] = useState(() => read(tab));
  const h = HINTS[tab];
  const toggle = () => { const n = !closed; setClosed(n); try { localStorage.setItem(key(tab), n ? '1' : '0'); } catch { /* ignore */ } };
  const Icon = TAB_ICON[tab];
  const g = GROUP_ID[group] ?? 'gen';
  return (
    <div className="adm-pagehead" data-g={g}>
    <span className="adm-pchip"><Icon size={16} aria-hidden="true" />{group !== 'Genel' && <>{group}<i aria-hidden="true">/</i></>}{label}</span>
    {!hideCard && <section className="adm-hint" aria-label="Bölüm yardımı">
      <button type="button" className="adm-hint-head" aria-expanded={!closed} onClick={toggle}>
        <span className="adm-hint-t"><Icon size={18} aria-hidden="true" />Bu bölüm ne işe yarar?</span><span className="adm-hint-chev" aria-hidden="true">{closed ? '+' : '−'}</span>
      </button>
      {!closed && (
        <div className="adm-hint-body">
          <p><b>Ne için?</b> {h.what}</p>
          <p><b>Ne zaman bakmalı?</b> {h.when}</p>
          <p><b>İpucu</b></p>
          <ul>{h.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>)}
    </section>}
    </div>
  );
}
