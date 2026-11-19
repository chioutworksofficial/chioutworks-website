import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis: Lenis | null = null;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Start Lenis for the public site; returns a cleanup. No-op under reduced motion. */
export function initSmoothScroll(): () => void {
  if (lenis || reduced()) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  // Calm, "heavier" pace for the whole site: shorter wheel steps, longer glide. Scroll-scrubbed animations use SCRUB below.
  // Phones keep their own native (momentum) scrolling, like lialive.ai: JS-smoothed touch scrolling made phones stutter (2026-11-15).
  const l = new Lenis({ lerp: 0.055, wheelMultiplier: 0.6, smoothWheel: true, syncTouch: false });
  lenis = l;
  l.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => l.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  // Modals lock the page with body{overflow:hidden}: pause Lenis meanwhile
  const sync = () => (document.body.style.overflow === 'hidden' ? l.stop() : l.start());
  const mo = new MutationObserver(sync);
  mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  sync();
  return () => {
    mo.disconnect();
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    l.destroy();
    lenis = null;
  };
}

/** Smooth-scroll to an element/id (Lenis when active, native otherwise). */
export function scrollToTarget(target: string | HTMLElement | null | undefined) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
}

export const getLenis = () => lenis;

/** Shared catch-up time (s) for scroll-scrubbed GSAP animations: higher = smoother, heavier feel. */
export const SCRUB = 1.2;
