import type { Summary } from './types';
import { fmtDur } from './types';

export default function StatusStrip({ s }: { s: Summary | null }) {
  if (!s) return <div className="adm-skel" style={{ height: 84, marginBottom: 16 }} />;
  const tiles: [string, string, string?][] = [
    ['Mod', s.mode === 'live' ? 'Canlı' : 'Simülasyon', s.mode === 'live' ? 'bad' : 'paid'],
    ['Vapi', s.vapiConnected ? 'Bağlı' : 'Bağlı değil', s.vapiConnected ? 'paid' : 'no_answer'],
    ['Bugün / bu hafta', `${s.today} / ${s.week}`],
    ['Ortalama süre', fmtDur(s.avgDurationSec)],
    ['Olumlu sonuç', s.positiveRate === null ? '-' : `%${s.positiveRate}`],
    ['Aranmasın', String(s.doNotCall)],
  ];
  return (
    <div className="vo-strip" role="list" aria-label="Voice Agent durumu">
      {tiles.map(([k, v, st]) => <div key={k} className="vo-tile" role="listitem"><span className="adm-label">{k}</span><b {...(st ? { 'data-state': st } : {})}>{v}</b></div>)}
    </div>
  );
}
