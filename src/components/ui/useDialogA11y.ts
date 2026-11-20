import { useCallback, useRef } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),textarea:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

/** Callback ref for a modal/drawer root: moves focus in on mount, traps Tab, returns focus to the trigger on unmount. */
export function useDialogA11y() {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: HTMLElement | null) => {
    cleanup.current?.(); cleanup.current = null;
    if (!el) return;
    const trigger = document.activeElement as HTMLElement | null;
    const items = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((e) => e.getClientRects().length > 0);
    if (!el.contains(document.activeElement)) {
      if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
      (items()[0] ?? el).focus({ preventScroll: true });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const l = items();
      if (!l.length) { e.preventDefault(); return; }
      const a = document.activeElement;
      if (e.shiftKey && (a === l[0] || a === el)) { e.preventDefault(); l[l.length - 1].focus(); }
      else if (!e.shiftKey && a === l[l.length - 1]) { e.preventDefault(); l[0].focus(); }
    };
    el.addEventListener('keydown', onKey);
    cleanup.current = () => { el.removeEventListener('keydown', onKey); if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true }); };
  }, []);
}
