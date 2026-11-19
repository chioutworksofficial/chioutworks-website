import { useEffect, useRef, type RefObject } from 'react';

/** Plays a background <video> only while `sectionRef`'s element is on screen,
 *  and never at all under prefers-reduced-motion (the .video-bg-wrap video
 *  { display:none } rule in theme.css already hides it visually — this just
 *  stops decoding it). Takes the caller's existing section ref so it composes
 *  with whatever other observers that section already runs. */
export function useVideoInView<T extends HTMLElement>(sectionRef: RefObject<T | null>) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.15 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, [sectionRef]);

  return videoRef;
}
