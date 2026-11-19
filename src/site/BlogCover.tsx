import { useEffect, useRef, useState } from 'react';
/** On-brand abstract cover art per post (drawn UI mockup shapes, palette tokens only). */
const f = (c: string, o = 1): React.CSSProperties => ({ fill: `var(--c-${c})`, fillOpacity: o });
const s = (c: string, w = 2, o = 1): React.CSSProperties => ({ fill: 'none', stroke: `var(--c-${c})`, strokeWidth: w, strokeOpacity: o });

function Workflow() {
  const nodes = [[90, 300], [270, 190], [270, 380], [470, 285], [660, 285]];
  return (
    <g>
      {[[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]].map(([a, b]) => (
        <path key={`${a}${b}`} d={`M${nodes[a][0] + 70} ${nodes[a][1]} C ${nodes[a][0] + 130} ${nodes[a][1]}, ${nodes[b][0] - 60} ${nodes[b][1]}, ${nodes[b][0]} ${nodes[b][1]}`} style={s('lilac', 2, 0.5)} />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 70} y={y - 36} width="140" height="72" rx="12" style={{ ...f('deep-sea'), stroke: 'var(--c-hairline)', strokeWidth: 1.5 }} />
          <circle cx={x - 40} cy={y} r="13" style={f(i === 4 ? 'lilac' : 'signal', 0.9)} />
          <rect x={x - 16} y={y - 12} width="64" height="8" rx="4" style={f('mist', 0.8)} />
          <rect x={x - 16} y={y + 4} width="40" height="7" rx="3.5" style={f('ash', 0.4)} />
        </g>
      ))}
      <path d="M620 285l10 10 18-20" style={s('abyss', 3.5)} />
    </g>
  );
}

function Chat() {
  const bubble = (x: number, y: number, w: number, me: boolean, lines: number[]) => (
    <g>
      <rect x={x} y={y} width={w} height={30 + lines.length * 22} rx="18" style={me ? f('signal', 0.95) : { ...f('deep-sea'), stroke: 'var(--c-hairline)', strokeWidth: 1.5 }} />
      {lines.map((lw, i) => <rect key={i} x={x + 22} y={y + 22 + i * 22} width={lw} height="8" rx="4" style={f(me ? 'quartz' : 'mist', me ? 0.9 : 0.6)} />)}
    </g>
  );
  return (
    <g>
      {bubble(70, 80, 340, false, [250, 190])}
      {bubble(390, 190, 330, true, [240, 280, 140])}
      {bubble(70, 340, 300, false, [220, 160])}
      <rect x="390" y="440" width="120" height="44" rx="22" style={{ ...f('deep-sea'), stroke: 'var(--c-hairline)', strokeWidth: 1.5 }} />
      {[420, 450, 480].map((cx, i) => <circle key={cx} cx={cx} cy="462" r="6" style={f('lilac', 0.4 + i * 0.25)} />)}
      <path d="M690 90l8 18 18 8-18 8-8 18-8-18-18-8 18-8z" style={f('lilac', 0.9)} />
    </g>
  );
}

function Site() {
  return (
    <g>
      <rect x="90" y="70" width="620" height="420" rx="16" style={{ ...f('deep-sea'), stroke: 'var(--c-hairline)', strokeWidth: 1.5 }} />
      <path d="M90 118h620" style={s('hairline', 1.5)} />
      {[118, 140, 162].map((cx) => <circle key={cx} cx={cx} cy="94" r="6" style={f('ash', 0.5)} />)}
      <rect x="250" y="80" width="300" height="28" rx="14" style={f('inkline')} />
      <rect x="130" y="150" width="300" height="22" rx="8" style={f('quartz', 0.9)} />
      <rect x="130" y="186" width="220" height="22" rx="8" style={f('quartz', 0.9)} />
      <rect x="130" y="228" width="260" height="9" rx="4.5" style={f('ash', 0.5)} />
      <rect x="130" y="246" width="200" height="9" rx="4.5" style={f('ash', 0.5)} />
      <rect x="130" y="278" width="116" height="38" rx="19" style={f('signal')} />
      <rect x="470" y="150" width="200" height="166" rx="12" style={f('cobalt')} />
      <path d="M490 290l40-50 36 28 50-72 34 48" style={s('lilac', 3)} />
      {[130, 292, 454].map((x) => (
        <g key={x}>
          <rect x={x} y="350" width="140" height="110" rx="12" style={{ ...f('abyss'), stroke: 'var(--c-hairline)', strokeWidth: 1.2 }} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={x + 20 + i * 16} cy="374" r="5" style={f('lilac', i < 4 ? 0.95 : 0.3)} />)}
          <rect x={x + 16} y="398" width="100" height="8" rx="4" style={f('mist', 0.6)} />
          <rect x={x + 16} y="416" width="70" height="8" rx="4" style={f('ash', 0.4)} />
        </g>
      ))}
    </g>
  );
}

function Journey() {
  const pts: [number, number][] = [[110, 410], [260, 340], [410, 260], [560, 180], [700, 110]];
  return (
    <g>
      {[0, 1, 2].map((i) => <path key={i} d={`M0 ${470 + i * 26} q 50 -22 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0`} style={s(i ? 'hairline' : 'lilac', 2, i ? 0.8 : 0.55)} />)}
      {pts.slice(0, -1).map(([x, y], i) => <rect key={i} x={x - 55} y={y} width="110" height={470 - y} rx="8" style={f(i % 2 ? 'cobalt' : 'deep-sea', 0.95)} />)}
      <path d={`M${pts.map((p) => p.join(' ')).join(' L')}`} style={s('lilac', 3, 0.9)} strokeDasharray="2 10" strokeLinecap="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 4 ? 14 : 8} style={f(i === 4 ? 'quartz' : 'lilac', i === 4 ? 1 : 0.85)} />)}
      <circle cx="700" cy="110" r="34" style={s('lilac', 1.5, 0.5)} />
    </g>
  );
}


// ── Notebook covers (owner, 2026-11-19): a pen draws the post's real data on a notebook page when the cover comes
// into view. Labels follow the page language. Animations live in theme.css (.bc-*), paused until .is-in.
type L4 = 'tr' | 'en' | 'de' | 'el';
const pct = (n: number, lang: L4) => (lang === 'tr' ? `%${n}` : lang === 'de' ? `${n} %` : `${n}%`);
function Notebook({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect x="70" y="50" width="660" height="470" rx="14" style={{ ...f('deep-sea'), stroke: 'var(--c-hairline)', strokeWidth: 1.5 }} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1="70" x2="730" y1={110 + i * 32} y2={110 + i * 32} style={s('hairline', 1, 0.55)} />)}
      <line x1="140" x2="140" y1="50" y2="520" style={s('lilac', 1.5, 0.35)} />
      {Array.from({ length: 9 }, (_, i) => <g key={i}><circle cx={130 + i * 68} cy="50" r="9" style={f('abyss')} /><path d={`M${124 + i * 68} 50 a6 9 0 0 1 12 0`} style={s('ash', 2, 0.8)} /></g>)}
      {/* hand-drawn feel without a handwriting font (brand fonts only): a subtle wobble on strokes and letters */}
      <g filter="url(#bc-rough)">{children}</g>
    </g>
  );
}
const Hand = ({ x, y, size = 26, cls = '', delay = 0, color = 'quartz', children }: { x: number; y: number; size?: number; cls?: string; delay?: number; color?: string; children: React.ReactNode }) => (
  <text x={x} y={y} className={`bc-write ${cls}`} style={{ fill: `var(--c-${color})`, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: size, animationDelay: `${delay}s` }}>{children}</text>
);
const Pen = ({ path, delay = 0, dur = 3 }: { path: string; delay?: number; dur?: number }) => (
  <g className="bc-pen" style={{ offsetPath: `path('${path}')`, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>
    <g transform="rotate(-35) translate(-4 -40)">
      <rect x="-5" y="0" width="10" height="34" rx="3" style={{ ...f('abyss'), stroke: 'var(--c-lilac)', strokeWidth: 2 }} />
      <path d="M-5 34 L0 46 L5 34 Z" style={f('lilac')} />
    </g>
  </g>
);

function JobsCover({ lang }: { lang: L4 }) {
  const t = { tr: ['+170 milyon yeni iş', '−92 milyon', 'net +78 milyon'], en: ['+170M new jobs', '−92M lost', 'net +78M'], de: ['+170 Mio. neue Jobs', '−92 Mio. weg', 'netto +78 Mio.'], el: ['+170 εκ. νέες θέσεις', '−92 εκ.', 'καθαρά +78 εκ.'] }[lang];
  const hatch = (x: number, top: number, h: number, w: number, c: string, d0: number) => Array.from({ length: Math.floor(w / 12) }, (_, i) => (
    <line key={i} x1={x + 6 + i * 12} y1={top + h} x2={x + 6 + i * 12 + 10} y2={top} className="bc-draw" pathLength={1} style={{ ...s(c, 3, 0.8), animationDelay: `${d0 + i * 0.05}s` }} />
  ));
  return (
    <Notebook>
      <Hand x={170} y={100} size={24} color="ash" delay={0.1}>2030</Hand>
      <path d="M170 455 H690" className="bc-draw" pathLength={1} style={{ ...s('quartz', 3), animationDelay: '0.2s' }} />
      <rect x="220" y="185" width="150" height="270" className="bc-grow" style={{ ...f('lilac', 0.18), stroke: 'var(--c-lilac)', strokeWidth: 3, animationDelay: '0.7s' }} />
      {hatch(220, 185, 270, 150, 'lilac', 1.2)}
      <rect x="450" y="309" width="150" height="146" className="bc-grow" style={{ ...f('ash', 0.15), stroke: 'var(--c-ash)', strokeWidth: 3, animationDelay: '1.6s' }} />
      {hatch(450, 309, 146, 150, 'ash', 2.0)}
      <Hand x={190} y={165} size={26} delay={2.4}>{t[0]}</Hand>
      <Hand x={470} y={290} size={26} color="mist" delay={2.8}>{t[1]}</Hand>
      <ellipse cx="560" cy="160" rx="135" ry="38" className="bc-draw" pathLength={1} style={{ ...s('lilac', 3), animationDelay: '3.3s', transform: 'rotate(-4deg)', transformOrigin: '560px 160px' }} />
      <Hand x={455} y={170} size={28} color="lilac" delay={3.6}>{t[2]}</Hand>
      <Hand x={600} y={500} size={16} color="ash" delay={3.9}>WEF 2025</Hand>
      <Pen path="M170 455 H690 M220 455 V185 H370 V455 M450 455 V309 H600" dur={3.2} delay={0.2} />
    </Notebook>
  );
}

function RisksCover({ lang }: { lang: L4 }) {
  const t = {
    tr: [['Faydalar', 'Zaman', '7/24 yanıt', 'Diller'], ['Riskler', 'Yanlış yanıt', 'Veri koruma', 'Bağımlılık']],
    en: [['Benefits', 'Time', '24/7 answers', 'Languages'], ['Risks', 'Wrong answers', 'Data protection', 'Dependence']],
    de: [['Nutzen', 'Zeit', 'Rund um die Uhr', 'Sprachen'], ['Risiken', 'Falsche Antworten', 'Datenschutz', 'Abhängigkeit']],
    el: [['Οφέλη', 'Χρόνος', 'Απαντήσεις 24/7', 'Γλώσσες'], ['Κίνδυνοι', 'Λάθος απαντήσεις', 'Δεδομένα', 'Εξάρτηση']],
  }[lang];
  return (
    <Notebook>
      <path d="M430 120 V490" className="bc-draw" pathLength={1} style={{ ...s('quartz', 2.5, 0.8), animationDelay: '0.2s' }} />
      {t.map((col, c) => (
        <g key={c}>
          <Hand x={c ? 460 : 170} y={150} size={30} color={c ? 'mist' : 'lilac'} delay={0.5 + c * 0.3}>{col[0]}</Hand>
          <path d={c ? 'M460 162 H640' : 'M170 162 H340'} className="bc-draw" pathLength={1} style={{ ...s(c ? 'ash' : 'lilac', 3), animationDelay: `${0.8 + c * 0.3}s` }} />
          {col.slice(1).map((item, i) => (
            <g key={item}>
              {c === 0
                ? <path d={`M172 ${226 + i * 96} l10 10 l20 -24`} className="bc-draw" pathLength={1} style={{ ...s('lilac', 4), animationDelay: `${1.3 + i * 0.6}s` }} />
                : <path d={`M472 ${236 + i * 96} l12 -22 l12 22 z M484 ${222 + i * 96} v6`} className="bc-draw" pathLength={1} style={{ ...s('ash', 3), animationDelay: `${1.6 + i * 0.6}s` }} />}
              <Hand x={c ? 510 : 216} y={240 + i * 96} size={c ? 23 : 25} color={c ? 'mist' : 'quartz'} delay={1.5 + i * 0.6 + c * 0.3}>{item}</Hand>
            </g>
          ))}
        </g>
      ))}
      <Pen path="M430 120 V490 M170 162 H340 M460 162 H640" dur={2.4} delay={0.2} />
    </Notebook>
  );
}

function SmbCover({ lang }: { lang: L4 }) {
  const t = { tr: ['Küçük', 'Orta', 'Büyük', `2025: tümü ${pct(20, lang)}`], en: ['Small', 'Medium', 'Large', `2025: all ${pct(20, lang)}`], de: ['Klein', 'Mittel', 'Groß', `2025: alle ${pct(20, lang)}`], el: ['Μικρές', 'Μεσαίες', 'Μεγάλες', `2025: όλες ${pct(20, lang)}`] }[lang];
  const bars: [number, number][] = [[11, 0], [21, 1], [41, 2]];
  const base = 455, scale = 6.4;
  return (
    <Notebook>
      <Hand x={170} y={100} size={22} color="ash" delay={0.1}>{`EU 2024 · AI`}</Hand>
      <path d={`M170 ${base} H690 M170 ${base} V140`} className="bc-draw" pathLength={1} style={{ ...s('quartz', 3), animationDelay: '0.2s' }} />
      {bars.map(([v, i]) => {
        const h = v * scale, x = 220 + i * 160;
        return (
          <g key={i}>
            <rect x={x} y={base - h} width="110" height={h} className="bc-grow" style={{ ...f(i === 2 ? 'ash' : 'lilac', 0.2), stroke: `var(--c-${i === 2 ? 'ash' : 'lilac'})`, strokeWidth: 3, animationDelay: `${0.8 + i * 0.5}s` }} />
            <Hand x={x + 18} y={base - h - 18} size={30} color={i === 0 ? 'lilac' : 'quartz'} delay={1.3 + i * 0.5}>{pct(v, lang)}</Hand>
            <Hand x={x + 10} y={base + 38} size={22} color="mist" delay={1.0 + i * 0.5}>{t[i]}</Hand>
          </g>
        );
      })}
      <path d="M230 360 C 320 300, 420 260, 560 170" className="bc-draw" pathLength={1} style={{ ...s('lilac', 2.5, 0.9), strokeDasharray: '1', animationDelay: '2.8s' }} />
      <Hand x={400} y={132} size={24} color="lilac" delay={3.2}>{t[3]}</Hand>
      <Pen path={`M170 ${base} H690 M230 360 C 320 300, 420 260, 560 170`} dur={3.4} delay={0.2} />
    </Notebook>
  );
}

function ProcessesCover({ lang }: { lang: L4 }) {
  const items = {
    tr: ['Fatura ve ödeme hatırlatma', 'Müşteri takibi', 'Sosyal medya planı', 'Karşılama belgeleri', 'Raporlar ve paneller'],
    en: ['Invoices & payment reminders', 'Lead follow-ups', 'Social media planning', 'Onboarding documents', 'Reports & dashboards'],
    de: ['Rechnungen & Zahlungserinnerungen', 'Lead-Nachverfolgung', 'Social-Media-Planung', 'Onboarding-Unterlagen', 'Berichte & Dashboards'],
    el: ['Τιμολόγια & υπενθυμίσεις', 'Παρακολούθηση πελατών', 'Πλάνο social media', 'Έγγραφα υποδοχής', 'Αναφορές & πίνακες'],
  }[lang];
  return (
    <Notebook>
      <Hand x={170} y={118} size={56} color="lilac" delay={0.1}>5</Hand>
      <path d="M168 130 C 190 140, 215 138, 232 128" className="bc-draw" pathLength={1} style={{ ...s('lilac', 3), animationDelay: '0.4s' }} />
      {items.map((it, i) => (
        <g key={it}>
          <rect x="172" y={168 + i * 64} width="26" height="26" rx="5" className="bc-draw" pathLength={1} style={{ ...s('mist', 2.5), animationDelay: `${0.6 + i * 0.45}s` }} />
          <path d={`M177 ${185 + i * 64} l7 7 l14 -17`} className="bc-draw" pathLength={1} style={{ ...s('lilac', 4), animationDelay: `${1.0 + i * 0.45}s` }} />
          <Hand x={218} y={190 + i * 64} size={25} delay={0.8 + i * 0.45}>{it}</Hand>
        </g>
      ))}
      <Pen path="M177 182 l7 7 l14 -17 M177 246 l7 7 l14 -17 M177 310 l7 7 l14 -17 M177 374 l7 7 l14 -17 M177 438 l7 7 l14 -17" dur={2.6} delay={1.0} />
    </Notebook>
  );
}

function ToolsCover({ lang }: { lang: L4 }) {
  const t = {
    tr: [['Zaman kazandıran', 'Taslak ve özet', 'Kod yardımı', 'Araştırma'], ['Çoğu gürültü', '“10 kat verim” vaadi', 'Gereksiz eklentiler']],
    en: [['Saves time', 'Drafts & summaries', 'Coding help', 'Research'], ['Mostly noise', '“10x productivity” claims', 'Needless add-ons']],
    de: [['Spart Zeit', 'Entwürfe & Zusammenfassungen', 'Hilfe beim Code', 'Recherche'], ['Meist Lärm', '„10-fache Produktivität“', 'Unnötige Add-ons']],
    el: [['Εξοικονομεί χρόνο', 'Προσχέδια & περιλήψεις', 'Βοήθεια στον κώδικα', 'Έρευνα'], ['Κυρίως θόρυβος', '«10 φορές απόδοση»', 'Περιττά πρόσθετα']],
  }[lang];
  return (
    <Notebook>
      <path d="M440 120 V490" className="bc-draw" pathLength={1} style={{ ...s('quartz', 2.5, 0.8), animationDelay: '0.2s' }} />
      <Hand x={170} y={150} size={28} color="lilac" delay={0.4}>{t[0][0]}</Hand>
      <Hand x={465} y={150} size={28} color="mist" delay={0.7}>{t[1][0]}</Hand>
      {t[0].slice(1).map((it, i) => <g key={it}><path d={`M172 ${226 + i * 90} l10 10 l20 -24`} className="bc-draw" pathLength={1} style={{ ...s('lilac', 4), animationDelay: `${1.0 + i * 0.5}s` }} /><Hand x={214} y={236 + i * 90} size={22} delay={1.2 + i * 0.5}>{it}</Hand></g>)}
      {t[1].slice(1).map((it, i) => <g key={it}><path d={`M470 ${218 + i * 90} l18 18 M488 ${218 + i * 90} l-18 18`} className="bc-draw" pathLength={1} style={{ ...s('ash', 3.5), animationDelay: `${2.4 + i * 0.5}s` }} /><Hand x={498} y={236 + i * 90} size={19} color="mist" delay={2.6 + i * 0.5}>{it}</Hand></g>)}
      <Pen path="M440 120 V490" dur={1.4} delay={0.2} />
    </Notebook>
  );
}

function WebsiteCover({ lang }: { lang: L4 }) {
  const n = { tr: ['Hız', '5 sn’de netlik', 'Sosyal kanıt', 'Mobil'], en: ['Speed', 'Clear in 5 s', 'Social proof', 'Mobile first'], de: ['Tempo', 'Klar in 5 Sek.', 'Echte Bewertungen', 'Mobil zuerst'], el: ['Ταχύτητα', 'Σαφές σε 5″', 'Κοινωνική απόδειξη', 'Πρώτα κινητό'] }[lang];
  return (
    <Notebook>
      <rect x="170" y="130" width="380" height="290" rx="12" className="bc-draw" pathLength={1} style={{ ...s('quartz', 3), animationDelay: '0.2s' }} />
      <path d="M170 165 H550" className="bc-draw" pathLength={1} style={{ ...s('quartz', 2), animationDelay: '0.9s' }} />
      {[188, 206, 224].map((x, i) => <circle key={x} cx={x} cy="148" r="5" className="bc-write" style={{ ...f(i ? 'ash' : 'lilac'), animationDelay: `${1.0 + i * 0.1}s` }} />)}
      <path d="M200 210 H430 M200 238 H380" className="bc-draw" pathLength={1} style={{ ...s('mist', 7, 0.9), strokeLinecap: 'round', animationDelay: '1.2s' }} />
      <rect x="200" y="268" width="120" height="38" rx="19" className="bc-draw" pathLength={1} style={{ ...s('lilac', 3), animationDelay: '1.6s' }} />
      <Hand x={226} y={294} size={20} color="lilac" delay={1.9}>→</Hand>
      <Hand x={200} y={360} size={26} color="lilac" delay={2.1}>★★★★★</Hand>
      <rect x="590" y="190" width="100" height="190" rx="16" className="bc-draw" pathLength={1} style={{ ...s('quartz', 3), animationDelay: '2.3s' }} />
      <path d="M605 225 H675 M605 245 H655 M605 290 H675" className="bc-draw" pathLength={1} style={{ ...s('mist', 5, 0.8), strokeLinecap: 'round', animationDelay: '2.7s' }} />
      <Hand x={455} y={155} size={20} color="mist" delay={3.0}>{n[0]}</Hand>
      <Hand x={350} y={300} size={21} color="mist" delay={3.2}>{n[1]}</Hand>
      <Hand x={345} y={360} size={21} color="mist" delay={3.4}>{n[2]}</Hand>
      <Hand x={590} y={420} size={22} color="mist" delay={3.6}>{n[3]}</Hand>
      <Pen path="M170 130 H550 V420 H170 Z M590 190 H690 V380 H590 Z" dur={2.6} delay={0.2} />
    </Notebook>
  );
}

function JourneyCover({ lang }: { lang: L4 }) {
  const n = { tr: ['Tersane', 'Öğrenmek', 'Kod', 'Kendi işim'], en: ['Shipyard', 'Learning', 'Code', 'My business'], de: ['Werft', 'Lernen', 'Code', 'Eigene Firma'], el: ['Ναυπηγείο', 'Μάθηση', 'Κώδικας', 'Δική μου επιχείρηση'] }[lang];
  const pts: [number, number][] = [[210, 400], [340, 280], [500, 330], [640, 180]];
  const d = 'M210 400 C 260 330, 290 300, 340 280 S 450 350, 500 330 S 600 220, 640 180';
  const icons = [
    'M-14 -4 H14 M0 -20 V10 M-14 4 C -12 14, 12 14, 14 4 M0 -20 a5 5 0 1 0 0.01 0',       // anchor
    'M-16 -12 H-2 C 2 -12, 2 -8, 2 -6 V14 C 2 10, -2 10, -6 10 H-16 Z M16 -12 H2 V14 M16 -12 V10 H6', // book
    'M-18 -12 H18 V8 H-18 Z M-24 14 H24',                                                     // laptop
    'M0 -18 L5 -5 H18 L8 3 L12 16 L0 8 L-12 16 L-8 3 L-18 -5 H-5 Z',                          // star
  ];
  return (
    <Notebook>
      <path d={d} className="bc-draw" pathLength={1} style={{ ...s('lilac', 3), strokeDasharray: '1', animationDelay: '0.3s', animationDuration: '2.2s' }} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="34" className="bc-write" style={{ ...f('abyss'), stroke: `var(--c-${i === 3 ? 'lilac' : 'mist'})`, strokeWidth: 2.5, animationDelay: `${0.5 + i * 0.6}s` }} />
          <path d={icons[i]} transform={`translate(${x} ${y})`} className="bc-draw" pathLength={1} style={{ ...s(i === 3 ? 'lilac' : 'quartz', 2.5), animationDelay: `${0.7 + i * 0.6}s` }} />
          <Hand x={x - (i === 3 ? 78 : 40)} y={y + (i % 2 ? -52 : 68)} size={22} color={i === 3 ? 'lilac' : 'mist'} delay={0.9 + i * 0.6}>{n[i]}</Hand>
        </g>
      ))}
      <Pen path={d} dur={2.4} delay={0.3} />
    </Notebook>
  );
}

function DeclineCover({ lang }: { lang: L4 }) {
  const n = { tr: ['Dijitalleşen', 'Beklemede kalan', 'bugün'], en: ['Going digital', 'Waiting', 'today'], de: ['Digitalisiert', 'Abwartend', 'heute'], el: ['Ψηφιακές', 'Σε αναμονή', 'σήμερα'] }[lang];
  const up = 'M180 400 C 280 390, 360 330, 440 270 S 600 150, 690 130';
  const down = 'M180 380 C 280 382, 360 390, 440 405 S 600 440, 690 460';
  return (
    <Notebook>
      <path d="M170 470 H700 M170 470 V120" className="bc-draw" pathLength={1} style={{ ...s('quartz', 3), animationDelay: '0.2s' }} />
      <path d={up} className="bc-draw" pathLength={1} style={{ ...s('lilac', 4), animationDelay: '0.8s', animationDuration: '1.8s' }} />
      <path d={down} className="bc-draw" pathLength={1} style={{ ...s('ash', 4), animationDelay: '1.4s', animationDuration: '1.8s' }} />
      <path d="M440 470 V125" className="bc-draw" pathLength={1} style={{ ...s('mist', 1.5, 0.5), strokeDasharray: '1', animationDelay: '0.5s' }} />
      <Hand x={450} y={150} size={20} color="ash" delay={0.7}>{n[2]}</Hand>
      <Hand x={520} y={120} size={26} color="lilac" delay={2.6}>{n[0]}</Hand>
      <Hand x={520} y={500} size={24} color="mist" delay={3.0}>{n[1]}</Hand>
      <Pen path={up} dur={1.8} delay={0.8} />
    </Notebook>
  );
}

const ART: Record<string, (p: { lang: L4 }) => React.JSX.Element> = { 'automate-5-processes': ProcessesCover, 'ai-actually-saves-time': ToolsCover, 'trustworthy-website': WebsiteCover, 'ship-worker-to-tech': JourneyCover, 'ai-jobs-reality': JobsCover, 'ai-benefits-risks': RisksCover, 'small-business-ai-today': SmbCover, 'digital-or-decline': DeclineCover };

export default function BlogCover({ id, className = '', style, lang = 'en' }: { id: string; className?: string; style?: React.CSSProperties; lang?: L4 }) {
  const Art = ART[id] ?? Workflow;
  // animations (notebook covers) start when the cover comes into view
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} aria-hidden="true" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" className={`${className} ${inView ? 'is-in' : ''}`} style={{ display: 'block', width: '100%', height: '100%', ...style }}>
      <defs>
        <linearGradient id={`bc-bg-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: 'var(--c-cobalt)' }} /><stop offset="1" style={{ stopColor: 'var(--c-abyss)' }} /></linearGradient>
        <filter id="bc-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" /></filter>
        <radialGradient id={`bc-gl-${id}`} cx="0.75" cy="0.15" r="0.7"><stop offset="0" style={{ stopColor: 'var(--c-lilac)', stopOpacity: 0.35 }} /><stop offset="1" style={{ stopColor: 'var(--c-lilac)', stopOpacity: 0 }} /></radialGradient>
      </defs>
      <rect width="800" height="560" fill={`url(#bc-bg-${id})`} />
      <rect width="800" height="560" fill={`url(#bc-gl-${id})`} />
      <Art lang={lang} />
    </svg>
  );
}

// Earlier abstract covers, kept for reuse (old components are never deleted)
export { Chat as ChatCoverArt, Site as SiteCoverArt, Journey as JourneyCoverArt };
