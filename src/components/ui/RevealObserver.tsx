"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sections marked `.reveal` fade and rise in as they scroll into view.
 *
 * The hidden start state only applies once this component has run and set
 * `data-reveal` on <html>, so with JavaScript off (or before hydration) every
 * section is simply visible. Anything already on screen at that moment is
 * marked revealed first, so nothing blinks out and back in.
 *
 * It also sets `data-hydrated`, which the e2e tests wait on before clicking.
 * It lives in the root layout and re-scans after every client-side navigation.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    const onScreen = (el: HTMLElement) => {
      const box = el.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    };
    elements.filter(onScreen).forEach((el) => el.classList.add("is-in"));

    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("is-in");
                observer?.unobserve(entry.target);
              }
            },
            { threshold: 0.12 },
          )
        : null;

    if (observer) {
      elements
        .filter((el) => !el.classList.contains("is-in"))
        .forEach((el) => observer.observe(el));
      root.dataset.reveal = "on";
    }
    root.dataset.hydrated = "true";

    return () => observer?.disconnect();
  }, [pathname]);

  return null;
}
