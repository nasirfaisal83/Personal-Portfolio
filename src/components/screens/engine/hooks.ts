"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** R3.5 — the OS preference, live-updating, safe under SSR and in jsdom. */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

type VisibilityEntry = Pick<IntersectionObserverEntry, "isIntersecting" | "intersectionRatio"> &
  Partial<Pick<IntersectionObserverEntry, "intersectionRect" | "rootBounds">>;

/**
 * R4.3 / R4.7 — at least `threshold` of the element is visible. An element too
 * tall to ever get there (a phone held sideways, or the narration open on a
 * small phone) counts once it fills `threshold` of the viewport instead.
 */
export function isInView(entry: VisibilityEntry, threshold: number): boolean {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= threshold) return true;
  const viewport = entry.rootBounds?.height ?? 0;
  return viewport > 0 && (entry.intersectionRect?.height ?? 0) >= viewport * threshold;
}

/** Every 5%, so a tall element keeps reporting as it scrolls through. */
const VISIBILITY_STEPS = Array.from({ length: 21 }, (_, i) => i / 20);

/** R4.3 / R4.7 — is the screen in view, per `isInView`? */
export function useInView<T extends Element>(threshold = 0.5) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== "function") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(isInView(entry, threshold)),
      { threshold: VISIBILITY_STEPS },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** R4.7 — scenarios must not burn frames behind a hidden tab. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}

/**
 * design §14 — a phone with few cores or Data Saver on drops packet trails and
 * caps concurrency at 3.
 */
export function useSlowDevice(): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      hardwareConcurrency?: number;
    };
    const cores = nav.hardwareConcurrency ?? 8;
    setSlow(cores < 4 || nav.connection?.saveData === true);
  }, []);

  return slow;
}

/** True once React has hydrated; used to reveal JS-only controls (design §14). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/**
 * A requestAnimationFrame loop that only runs while `active` is true and hands
 * the callback the wall-clock delta, so pausing never loses elapsed time.
 */
export function useRafLoop(active: boolean, onFrame: (deltaMs: number) => void): void {
  const callback = useRef(onFrame);
  callback.current = onFrame;

  useEffect(() => {
    if (!active) return;
    if (typeof requestAnimationFrame !== "function") return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const delta = now - last;
      last = now;
      callback.current(delta);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** Stable callback identity for handlers passed into effects. */
export function useEvent<Args extends unknown[], R>(fn: (...args: Args) => R) {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: Args) => ref.current(...args), []);
}
