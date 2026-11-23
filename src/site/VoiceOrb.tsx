import { useEffect, useRef } from 'react';

/**
 * Living voice orb drawn on a <canvas> (lialive-style technique, own implementation): a soft dark core,
 * three faint guide arcs, a horizontal sound wave, four glowing organic strands and a gradient main ring.
 * All sizes are fractions of the box width f. Colours come from the --c-* tokens (hex fallbacks).
 */
type RGB = [number, number, number];
type Tok = [number, number, number, string];
const toRgb = (el: Element, prop: string, fb: Tok): RGB => {
  const probe = document.createElement('span');
  probe.style.color = `var(${prop}, ${fb[3]})`;
  el.appendChild(probe);
  const m = /(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(getComputedStyle(probe).color);
  probe.remove();
  return m ? [+m[1], +m[2], +m[3]] : [fb[0], fb[1], fb[2]];
};
const mix = (x: RGB, y: RGB, k: number): RGB => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function readPalette(el: Element) {
  const A = toRgb(el, '--c-lilac', [133, 166, 233, '#85a6e9']);
  const P = toRgb(el, '--c-pulse', [48, 95, 189, '#305fbd']);
  const B = toRgb(el, '--c-signal', [40, 98, 215, '#2862d7']);
  const L = toRgb(el, '--c-lilac', [133, 166, 233, '#85a6e9']);
  const deep = toRgb(el, '--c-deep-sea', [13, 23, 43, '#0d172b']);
  const light = document.documentElement.getAttribute('data-mode') === 'light';
  return { light, A, P, B, deep, M1: mix(A, P, 0.6), M2: mix(P, B, 0.5), WA: mix(A, [255, 255, 255], 0.55), WB: mix(L, [255, 255, 255], 0.6) };
}

export default function VoiceOrb({ label, onTalk, bare }: { label: string; onTalk: () => void; bare?: boolean }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const box = boxRef.current, cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!box || !cv || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pal = readPalette(box);
    let f = 0, dpr = 1, t = reduce ? 3 : 0, last = performance.now(), raf = 0, visible = true;

    const resize = () => {
      f = Math.max(1, Math.floor(box.offsetWidth));
      dpr = Math.min(window.devicePixelRatio || 1, window.matchMedia('(pointer: coarse)').matches ? 1.5 : 8);
      cv.width = f * dpr; cv.height = f * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) frame();
    };
    const arc = (r: number, a: number, w: number, from = 0, to = Math.PI * 2) => {
      ctx.beginPath(); ctx.arc(f / 2, f / 2, r, from, to);
      ctx.strokeStyle = rgba(pal.M1, a); ctx.lineWidth = w; ctx.stroke();
    };
    const glow = (blur: number, col: string) => { ctx.shadowBlur = blur * dpr; ctx.shadowColor = col; };

    const frame = () => {
      const c = f / 2;
      const s = 0.1 + 0.05 * Math.abs(Math.sin(t * 0.9)); // idle intensity
      const act = 0.06 + 0.05 * Math.abs(Math.sin(t * 0.7)); // strand activity
      ctx.clearRect(0, 0, f, f);
      ctx.shadowBlur = 0;
      const g = ctx.createRadialGradient(c, c, 0.04 * f, c, c, 0.5 * f);
      if (pal.light) {
        // light mode: a soft light-blue cloud from the page colour (fading to the same tone, so no grey edge)
        g.addColorStop(0, rgba(mix(pal.deep, pal.B, 0.16), 0.95));
        g.addColorStop(0.45, rgba(mix(pal.deep, pal.B, 0.1), 0.6 + 0.08 * s));
        g.addColorStop(0.75, rgba(mix(pal.deep, pal.B, 0.06), 0.25));
        g.addColorStop(1, rgba(mix(pal.deep, pal.B, 0.04), 0));
      } else {
        g.addColorStop(0, rgba(mix(pal.deep, pal.P, 0.03), 0.95));
        g.addColorStop(0.4, rgba(mix(pal.deep, pal.P, 0.02), 0.74 + 0.08 * s));
        g.addColorStop(1, 'rgba(0,0,0,0)');
      }
      ctx.fillStyle = g; ctx.fillRect(0, 0, f, f);
      arc(0.39 * f, 0.16 + 0.08 * s, 1.2 + 0.35 * s);
      arc(0.43 * f, 0.12 + 0.06 * s, 0.9, 0.08 * Math.PI, 1.7 * Math.PI);
      arc(0.47 * f, 0.08 + 0.04 * s, 0.7, 0.55 * Math.PI, 1.4 * Math.PI);

      // horizontal wave
      const wi = Math.max(s, 0.08);
      const wg = ctx.createLinearGradient(0, c, f, c);
      wg.addColorStop(0, rgba(pal.A, 0)); wg.addColorStop(0.18, rgba(pal.A, 0.9));
      wg.addColorStop(0.48, rgba(pal.WA, 0.82)); wg.addColorStop(0.52, rgba(pal.WB, 0.82));
      wg.addColorStop(0.82, rgba(pal.B, 0.9)); wg.addColorStop(1, rgba(pal.B, 0));
      ctx.beginPath();
      for (let x = 0; x <= f; x += 2) {
        const d = Math.abs(x - c);
        const y = c + Math.sin(0.08 * x + t * (7 + 6 * wi)) * (10 + 20 * wi) * Math.exp(-d / (0.14 * f)) + Math.sin(0.34 * x - t * (11 + 9 * wi)) * (4 + 8 * wi) * Math.exp(-d / (0.22 * f));
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = wg; ctx.lineWidth = 2.1 + 1.3 * wi; glow(18 + 10 * wi, rgba(pal.WA, 0.5)); ctx.stroke();

      // strands
      const R = 0.265 * f;
      for (let k = 0; k < 4; k++) {
        const sg = ctx.createLinearGradient(c - R, c, c + R, c);
        sg.addColorStop(0, rgba(pal.A, 0.95 - 0.16 * k)); sg.addColorStop(0.44, rgba(pal.M1, 0.72 - 0.12 * k));
        sg.addColorStop(0.56, rgba(pal.M2, 0.72 - 0.12 * k)); sg.addColorStop(1, rgba(pal.B, 0.95 - 0.16 * k));
        ctx.beginPath();
        for (let i = 0; i <= 360; i++) {
          const n = (i / 360) * Math.PI * 2;
          const q = 1 + act * (1.15 + 0.08 * k);
          const u = 18 * Math.sin(3.2 * n - 1.35 * t + 0.65 * k) * q + 10 * Math.cos(6.7 * n + 1.9 * t - k) * q + Math.sin(12.4 * n - 1.5 * t + 2 * k) * (5 + 12 * act);
          const rr = R + 12 * k + u + Math.sin(t * (1 + 2 * act) + k) * (4 + 8 * act);
          const ey = 0.94 + Math.sin(2 * n - t) * (0.03 + 0.04 * act);
          const px = c + Math.cos(n) * rr, py = c + Math.sin(n) * rr * ey;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = sg; ctx.lineWidth = 1.35 + 0.75 * act; glow(22 + 16 * act, rgba(k < 2 ? pal.A : pal.B, 0.55)); ctx.stroke();
      }

      // main ring
      const rg = ctx.createLinearGradient(c - 0.25 * f, c, c + 0.25 * f, c);
      rg.addColorStop(0, rgba(pal.A, 1)); rg.addColorStop(0.5, rgba(pal.WA, 0.2)); rg.addColorStop(1, rgba(pal.B, 1));
      ctx.beginPath(); ctx.arc(c, c, 0.306 * f + 6 * s, 0, Math.PI * 2);
      ctx.strokeStyle = rg; ctx.lineWidth = 3 + 1.5 * s; glow(30 + 18 * s, rgba(mix(pal.A, pal.B, 0.35), 0.7)); ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const loop = (now: number) => {
      t += ((now - last) / 1000) * 60 * (0.016 + 0.009 * 0.1);
      last = now;
      frame();
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }, { threshold: 0 });
    io.observe(box);
    document.addEventListener('visibilitychange', kick);
    resize();
    if (reduce) frame(); else kick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', kick); };
  }, []);

  return (
    <div ref={boxRef} className="relative" style={{ width: 'var(--orb, 600px)', aspectRatio: '1 / 1' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

      <span className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[5px] h-[22px]" style={{ top: '36%' }} aria-hidden="true">
        {[0.55, 0.85, 0.6, 1, 0.7, 0.95, 0.5].map((s, i) => (
          <span key={i} className="lq-anim w-[3px] h-full rounded-full"
            style={{ background: 'var(--lq-white)', animation: `lq-wave ${0.8 + s * 0.6}s ease-in-out ${i * 0.09}s infinite` }} />
        ))}
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap" style={{ top: bare ? '47%' : '41.5%', fontSize: 16, letterSpacing: '0.06em', color: 'var(--lq-white)' }}>{label}</span>
      {!bare && (<>
      <span aria-hidden="true" className="absolute left-1/2 rounded-full" style={{ top: '58%', width: 60, height: 60, transform: 'translate(-50%, -50%)', border: '1px solid color-mix(in srgb, var(--c-lilac, #85a6e9) 35%, transparent)' }} />
      <button type="button" onClick={onTalk} aria-label={label}
        className="absolute left-1/2 w-[46px] h-[46px] rounded-full flex items-center justify-center transition-transform hover:scale-105"
        style={{ top: '58%', transform: 'translate(-50%, -50%)', background: 'var(--c-deep-sea, #0d172b)', border: '1px solid var(--c-lilac, #85a6e9)', color: 'var(--lq-white)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
        </svg>
      </button>
      </>)}
    </div>
  );
}

/** Fixed bottom-centre chat button with faint rings (lialive-style), shown on every site page. */
export function ChatLauncher({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <div className="fixed left-1/2 bottom-5 -translate-x-1/2 z-[50] pointer-events-none">
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 120, height: 120, border: '1px solid var(--lq-line)' }} />
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 88, height: 88, border: '1px solid var(--lq-line)' }} />
      <button type="button" onClick={onOpen} aria-label={label}
        className="pointer-events-auto relative w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: 'var(--lq-kelp)', border: '1px solid var(--lq-line-strong)', color: 'var(--lq-white)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
      </button>
    </div>
  );
}
