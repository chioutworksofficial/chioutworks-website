import { T, type Lang } from '../../translations';
import DemoShowcase from '../../components/DemoShowcase';

/** Demos page: lialive-style page hero (kicker / giant title / intro) followed by the demo showcase */
export default function DemosPage({ lang }: { lang: Lang }) {
  const d = T[lang].demos;
  return (
    <>
      <section className="relative overflow-hidden" style={{ minHeight: '70vh' }}>
        <div aria-hidden="true" className="deco-fade absolute inset-0 pointer-events-none">
          {[1500, 1100, 760].map((s) => (
            <span key={s} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: s, height: s, transform: 'translate(-50%, -50%)', border: '1px solid var(--lq-line)' }} />
          ))}
          <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: 900, height: 900, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, color-mix(in srgb, var(--lq-g1) 22%, transparent), transparent 65%)' }} />
        </div>
        <div className="relative mx-auto px-5 md:px-9 pt-44 pb-20 flex flex-col justify-end" style={{ maxWidth: 1200, minHeight: '70vh' }}>
          <p className="mb-6" style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lq-silver)' }}>{d.tag}</p>
          <h1 style={{ fontSize: 'clamp(44px, 6vw, 96px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)', maxWidth: 1100 }}>{d.title}</h1>
          <p className="mt-8" style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--lq-silver)', maxWidth: 560 }}>{d.sub}</p>
        </div>
      </section>
      <DemoShowcase lang={lang} hideHeader />
    </>
  );
}
