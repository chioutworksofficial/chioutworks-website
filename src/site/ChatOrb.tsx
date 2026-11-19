import { useEffect, useRef } from 'react';

/**
 * Chat assistant "face" (owner, 2026-11-19, adapted from a reference chat widget, own implementation):
 * a slowly turning 3D sphere of glowing points on a 2D canvas. ~350 points on a Fibonacci sphere, perspective
 * projection, depth-based size and alpha. Colours come from the theme tokens (--c-lilac, --c-signal, --c-quartz).
 * `active` (assistant is thinking) makes it turn faster and breathe. Reduced motion: one still frame.
 */
type RGB = [number, number, number];
const tok = (el: Element, prop: string, fb: string): RGB => {
  const probe = document.createElement('span');
  probe.style.color = `var(${prop}, ${fb})`;
  el.appendChild(probe);
  const m = /(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(getComputedStyle(probe).color);
  probe.remove();
  return m ? [+m[1], +m[2], +m[3]] : [133, 166, 233];
};

export default function ChatOrb({ size = 200, active = false, points = 360 }: { size?: number; active?: boolean; points?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr; cv.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const A = tok(cv, '--c-lilac', '#85a6e9'), B = tok(cv, '--c-signal', '#2862d7'), W = tok(cv, '--c-quartz', '#ffffff');
    const light = document.documentElement.getAttribute('data-mode') === 'light';
    // Fibonacci sphere with a little organic jitter
    const P: [number, number, number, number][] = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < points; i++) {
      const y = 1 - (i / (points - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
      const j = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.06;
      P.push([Math.cos(th) * r * j, y * j, Math.sin(th) * r * j, Math.random()]);
    }
    let rot = 0, t = 0, last = performance.now(), raf = 0, visible = true;
    const c = size / 2, R = size * 0.36;

    const frame = () => {
      const act = activeRef.current;
      ctx.clearRect(0, 0, size, size);
      // soft glow behind the sphere
      const halo = ctx.createRadialGradient(c, c, R * 0.1, c, c, R * 1.45);
      halo.addColorStop(0, `rgba(${B[0]},${B[1]},${B[2]},${light ? 0.22 : (size < 80 ? 0.6 : 0.38) + (act ? 0.12 : 0)})`);
      halo.addColorStop(0.55, `rgba(${A[0]},${A[1]},${A[2]},${light ? 0.08 : 0.12})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(0, 0, size, size);
      const breathe = 1 + (act ? 0.05 : 0.02) * Math.sin(t * (act ? 5 : 1.6));
      const cy = Math.cos(rot), sy = Math.sin(rot), tilt = 0.38, cx = Math.cos(tilt), sx = Math.sin(tilt);
      for (const [x0, y0, z0, n] of P) {
        // rotate around Y, then tilt around X
        const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cx - z1 * sx, z2 = y0 * sx + z1 * cx;
        const persp = 2.4 / (2.4 - z2);
        const px = c + x1 * R * breathe * persp, py = c + y2 * R * breathe * persp;
        const depth = (z2 + 1) / 2;                       // 0 back … 1 front
        const tw = 0.75 + 0.25 * Math.sin(t * 2 + n * 10); // twinkle
        const col = depth > 0.62 ? W : depth > 0.35 ? A : B;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${(0.18 + 0.82 * depth) * tw})`;
        const s = (0.6 + 1.5 * depth) * Math.max(size / 200, 0.5);   // small orbs (input bar) keep visible points
        ctx.beginPath(); ctx.arc(px, py, s, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      t += dt; rot += dt * (activeRef.current ? 1.1 : 0.32);
      if (visible) frame();
      raf = requestAnimationFrame(loop);
    };
    if (reduce) frame(); else raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [size, points]);

  return <canvas ref={ref} aria-hidden="true" style={{ width: size, height: size, display: 'block' }} />;
}
