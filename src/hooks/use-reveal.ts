import { useEffect } from "react";

/**
 * Adds `is-in` to every `.reveal` element once it scrolls into view. Elements are
 * collected when the effect runs, so pass a `key` that changes whenever the page
 * content is swapped without remounting (e.g. the slug of a `$slug` route).
 */
export function useReveal(key?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.is-in)");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}
