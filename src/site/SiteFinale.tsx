import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import { T, type Lang } from '../translations';
import { pagePath } from '../lib/routes';
import SiteFooter from './SiteFooter';
import BtnArrow from './BtnArrow';

const land = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land as GeometryCollection);

export default function SiteFinale({ lang }: { lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const planetRef = useRef<HTMLCanvasElement>(null);
  const c = T[lang].ctaSection;

  useEffect(() => {
    const sec = root.current, sc = starsRef.current, pc = planetRef.current;
    if (!sec || !sc || !pc) return;
    const sx = sc.getContext('2d'), px = pc.getContext('2d');
    if (!sx || !px) return;
    const cs = getComputedStyle(sec);
    const v = (n: string) => cs.getPropertyValue(n).trim();
    const col = { white: v('--lq-white'), kelp: v('--lq-kelp'), abyss: v('--lq-abyss'), g2: v('--lq-g2') };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);

    let W = 0, SH = 0, PH = 0, GAP = 0;
    type Star = { x: number; y: number; r: number; a: number; s: number; p: number };
    let stars: Star[] = [];
    let shoot: { x: number; y: number; t: number } | null = null;
    let nextShoot = performance.now() + 2500;
    let lon = -20;

    const size = () => {
      W = sec.clientWidth; SH = sec.clientHeight;
      PH = Math.round(Math.min(Math.max(W * 0.3, 240), 460)); GAP = 70;
      sc.width = W * dpr; sc.height = SH * dpr;
      pc.width = W * dpr; pc.height = PH * dpr;
      stars = Array.from({ length: 250 }, () => ({ x: Math.random() * W, y: Math.random() * SH, r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.6 + 0.3, s: Math.random() * 1.5 + 0.4, p: Math.random() * 6.28 }));
    };

    const drawStars = (now: number) => {
      sx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sx.clearRect(0, 0, W, SH);
      sx.fillStyle = col.white;
      for (const s of stars) {
        sx.globalAlpha = reduced ? s.a * 0.7 : s.a * (0.45 + 0.55 * Math.sin(now / 1000 * s.s + s.p));
        sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.283); sx.fill();
      }
      if (!reduced) {
        if (!shoot && now > nextShoot) { shoot = { x: Math.random() * W * 0.6, y: Math.random() * SH * 0.25, t: now }; nextShoot = now + 6000 + Math.random() * 3000; }
        if (shoot) {
          const k = (now - shoot.t) / 900;
          if (k >= 1) shoot = null;
          else {
            const hx = shoot.x + k * 420, hy = shoot.y + k * 300;
            const g = sx.createLinearGradient(hx - 110, hy - 78, hx, hy);
            g.addColorStop(0, 'transparent'); g.addColorStop(1, col.white);
            sx.globalAlpha = 1 - k * 0.6; sx.strokeStyle = g; sx.lineWidth = 1.4;
            sx.beginPath(); sx.moveTo(hx - 110, hy - 78); sx.lineTo(hx, hy); sx.stroke();
          }
        }
      }
      sx.globalAlpha = 1;
    };

    const drawPlanet = () => {
      const R = W * 1.1, cx = W / 2, cy = GAP + R;
      px.setTransform(dpr, 0, 0, dpr, 0, 0);
      px.clearRect(0, 0, W, PH);
      const proj = geoOrthographic().scale(R).translate([cx, cy]).rotate([lon, -28, 0]).clipAngle(90);
      const path = geoPath(proj, px);
      const og = px.createRadialGradient(cx, GAP + R * 0.1, R * 0.1, cx, cy, R);
      og.addColorStop(0, col.kelp); og.addColorStop(1, col.abyss);
      px.fillStyle = og; px.beginPath(); px.arc(cx, cy, R, 0, 6.283); px.fill();
      px.save();
      px.beginPath(); px.arc(cx, cy, R, 0, 6.283); px.clip();
      px.beginPath(); path(land); px.globalAlpha = 0.035; px.fillStyle = col.g2; px.fill();
      px.strokeStyle = col.g2; px.lineWidth = 1.2; px.lineJoin = 'round';
      px.globalAlpha = 0.24; px.shadowColor = col.g2; px.shadowBlur = 3 * dpr; px.stroke();
      px.shadowBlur = 0; px.globalAlpha = 0.3; px.stroke();
      px.restore();
      px.globalAlpha = 0.9; px.strokeStyle = col.g2; px.lineWidth = 2; px.shadowColor = col.g2; px.shadowBlur = 30;
      px.beginPath(); px.arc(cx, cy, R, 0, 6.283); px.stroke();
      px.shadowBlur = 0; px.globalAlpha = 1;
    };

    let raf = 0, last = performance.now(), visible = true;
    const frame = (now: number) => {
      lon += (now - last) * 0.006; last = now;
      drawStars(now); drawPlanet();
      if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame);
    };
    const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); };
    size(); drawStars(performance.now()); drawPlanet();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !reduced) start(); else cancelAnimationFrame(raf); });
    io.observe(sec);
    const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else if (visible && !reduced) start(); };
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => { size(); drawStars(performance.now()); drawPlanet(); });
    ro.observe(sec);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return (
    <section id="start" ref={root} className="relative overflow-hidden flex flex-col" style={{ minHeight: 'calc(660px + clamp(240px, 30vw, 460px))' }}>
      <canvas ref={starsRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none seam-fade-top" />
      <div aria-hidden="true" className="absolute inset-x-0 pointer-events-none seam-fade-top" style={{ height: '100%', top: 0, background: 'var(--glow-hero)' }} />
      <canvas ref={planetRef} aria-hidden="true" className="absolute left-0 bottom-0 w-full pointer-events-none" />
      <div className="relative z-10 mx-auto text-center flex flex-col items-center px-5 md:px-9" style={{ maxWidth: 900, paddingTop: 180 }}>
        <span className="inline-flex items-center gap-2.5 rounded-full" style={{ padding: '10px 22px 10px 18px', fontSize: 19, fontWeight: 500, letterSpacing: '-0.005em', fontFamily: 'var(--font-display)', color: 'color-mix(in srgb, var(--c-lilac) 85%, var(--c-quartz))', border: '1px solid color-mix(in srgb, var(--c-lilac) 28%, transparent)', background: 'color-mix(in srgb, var(--c-cobalt) 55%, transparent)', boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--c-quartz) 6%, transparent)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.4 4.6 2.4 6.9 7 7.4-4.6.5-6.6 2.8-7 7.6-.4-4.8-2.4-7.1-7-7.6 4.6-.5 6.6-2.8 7-7.4Z"/><path d="M19 15c.2 2 1 2.9 3 3.1-2 .2-2.8 1.1-3 3.1-.2-2-1-2.9-3-3.1 2-.2 2.8-1.1 3-3.1Z" opacity=".75"/></svg>{lang === 'tr' ? 'Başla' : lang === 'de' ? 'Start' : lang === 'el' ? 'Ξεκίνα' : 'Start'}</span>
        <h2 className="mt-8" style={{ fontSize: 'clamp(36px, 6vw, 61px)', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--lq-white)' }}>{c.title}</h2>
        <p className="mt-7 max-w-xl" style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--c-mist)' }}>{c.sub}</p>
        <Link to={pagePath(lang, 'contact')} className="mt-10 lq-btn-ghost">{c.btn}<BtnArrow /></Link>
      </div>
      <div className="relative z-10 mt-auto md:absolute md:inset-x-0 md:bottom-0 pt-24 md:pt-0">
        <SiteFooter lang={lang} variant="overlay" />
      </div>
    </section>
  );
}
