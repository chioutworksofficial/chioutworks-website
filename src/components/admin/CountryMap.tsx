import { useEffect, useMemo, useRef, useState } from 'react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';

// ISO 3166-1 numeric -> alpha-2, only for countries in world-atlas countries-110m.
const NUM2CC = '242FJ834TZ732EH124CA840US398KZ860UZ598PG360ID032AR152CL180CD706SO404KE729SD148TD332HT214DO643RU044BS238FK578NO304GL260TF626TL710ZA426LS484MX858UY076BR068BO604PE170CO591PA188CR558NI340HN222SV320GT084BZ862VE328GY740SR250FR218EC630PR388JM192CU716ZW072BW516NA686SN466ML478MR204BJ562NE566NG120CM768TG288GH384CI324GN624GW430LR694SL854BF140CF178CG266GA226GQ894ZM454MW508MZ748SZ024AO108BI376IL422LB450MG275PS270GM788TN012DZ400JO784AE634QA414KW368IQ512OM548VU116KH764TH418LA104MM704VN408KP410KR496MN356IN050BD064BT524NP586PK004AF762TJ417KG795TM364IR760SY051AM752SE112BY804UA616PL040AT348HU498MD642RO440LT428LV233EE276DE100BG300GR792TR008AL191HR756CH442LU056BE528NL620PT724ES372IE540NC090SB554NZ036AU144LK156CN158TW380IT208DK826GB352IS031AZ268GE608PH458MY096BN705SI246FI703SK203CZ232ER392JP600PY887YE682SA196CY504MA818EG434LY231ET262DJ800UG646RW070BA807MK688RS499ME780TT728SS';
const CC: Record<string, string> = {};
for (let i = 0; i < NUM2CC.length; i += 5) CC[NUM2CC.slice(i, i + 3)] = NUM2CC.slice(i + 3, i + 5);

type F = Feature<Geometry, { name: string }>;
interface Row { label: string; value: number }
const W = 960, H = 500;

export default function CountryMap({ rows, name }: { rows: Row[]; name: (cc: string) => string }) {
  const [feats, setFeats] = useState<F[] | null>(null);
  const [tip, setTip] = useState<{ cc: string; x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    Promise.all([import('topojson-client'), import('world-atlas/countries-110m.json')]).then(([{ feature }, topo]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fc = feature(topo.default as any, (topo.default as any).objects.countries) as unknown as { features: F[] };
      if (live) setFeats(fc.features.filter((f) => f.properties.name !== 'Antarctica'));
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  const paths = useMemo(() => {
    if (!feats) return [];
    const proj = geoEqualEarth().fitSize([W, H], { type: 'FeatureCollection', features: feats });
    const gp = geoPath(proj);
    return feats.map((f) => ({ d: gp(f) ?? '', cc: f.properties.name === 'Kosovo' ? 'XK' : CC[String((f as { id?: string }).id ?? '')] ?? '' }));
  }, [feats]);

  const by = useMemo(() => new Map(rows.map((r) => [r.label, r.value])), [rows]);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((a, r) => a + r.value, 0) || 1;
  const show = (e: React.PointerEvent, cc: string) => {
    const b = box.current?.getBoundingClientRect();
    if (b) setTip({ cc, x: e.clientX - b.left, y: e.clientY - b.top });
  };

  if (!feats) return <div className="adm-skel" style={{ height: 180 }} />;
  return (
    <div className="adm-map" ref={box} onPointerLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ziyaretçilerin ülkelere göre dünya haritası">
        {paths.map((p, i) => {
          const v = by.get(p.cc) ?? 0;
          return <path key={i} d={p.d} className={v ? 'on' : undefined}
            style={v ? { fill: `color-mix(in srgb, var(--c-signal) ${Math.round(30 + 70 * (v / max))}%, var(--c-lilac))` } : undefined}
            onPointerEnter={(e) => p.cc && show(e, p.cc)} onPointerMove={(e) => p.cc && show(e, p.cc)} onPointerDown={(e) => p.cc && show(e, p.cc)} />;
        })}
      </svg>
      {tip && <div className="adm-maptip" style={{ left: tip.x, top: tip.y }}>{name(tip.cc)}: <b>{by.get(tip.cc) ?? 0}</b> · %{Math.round(((by.get(tip.cc) ?? 0) / total) * 100)}</div>}
    </div>
  );
}
