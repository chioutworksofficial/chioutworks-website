import { useEffect, useRef } from 'react';

// Generous rootMargin so a fast scroll (trackpad flick, PageDown, or a
// programmatic jump) can't skip an element's intersection sample entirely —
// the detection band extends well past both edges of the viewport.
const REVEAL_ROOT_MARGIN = '600px 0px 600px 0px';
const REVEAL_SWEEP_MARGIN = 600;

// Belt-and-suspenders fallback: IntersectionObserver can miss an element
// entirely on an instant, non-incremental jump (nav anchor links like
// #services, or any non-smooth scrollTo) — there's no intermediate frame
// for it to sample. This sweep re-checks every still-armed element's real
// position on every scroll/resize, so a jump that lands a section in view
// always reveals it. One listener, shared by every useReveal instance.
let revealFallbackInstalled = false;
function installRevealFallback() {
  if (revealFallbackInstalled || typeof window === 'undefined') return;
  revealFallbackInstalled = true;
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const vh = window.innerHeight;
    document.querySelectorAll<HTMLElement>('.reveal.reveal-armed:not(.visible)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom > -REVEAL_SWEEP_MARGIN && r.top < vh + REVEAL_SWEEP_MARGIN) {
        el.classList.add('visible');
      }
    });
  };
  const onScrollOrResize = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  };
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  window.addEventListener('hashchange', onScrollOrResize, { passive: true });
  sweep();
}

/** Arms and reveals every `.reveal` descendant of the returned ref in a
 *  staged, camera-timed entrance. Elements stay visible with no JS
 *  (`.reveal` alone), so this only enhances — it never gates content. */
export function useRevealGroup<T extends HTMLElement = HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    installRevealFallback();
    const targets = el.querySelectorAll<HTMLElement>('.reveal');
    targets.forEach(t => t.classList.add('reveal-armed'));
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); }),
      { threshold, rootMargin: REVEAL_ROOT_MARGIN }
    );
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}

/** Single-element reveal: same staged entrance, for a lone section root. */
export function useReveal<T extends HTMLElement = HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    installRevealFallback();
    el.classList.add('reveal', 'reveal-armed');
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold, rootMargin: REVEAL_ROOT_MARGIN }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}
