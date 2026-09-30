"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { ArrowUpRightIcon } from "@/components/ui/icons";

const SECTIONS = [
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

/** The wordmark, "first.last" in lower case, built from the name in site.ts. */
const nameParts = site.name.trim().split(/\s+/);
const wordmark = {
  first: nameParts[0].toLowerCase(),
  last: nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "",
};

/**
 * The section a reader is in: the last one whose top has passed a line 40% of
 * the way down the space under the bar, or the last section once the page is
 * scrolled to the bottom. Ids sit on the section headings, so the measured box
 * is the heading's enclosing <section>.
 */
function sectionInView(targets: { id: string; box: HTMLElement }[], barHeight: number) {
  const root = document.documentElement;
  if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
    return targets[targets.length - 1].id;
  }
  const line = barHeight + (window.innerHeight - barHeight) * 0.4;
  let current: string | null = null;
  for (const target of targets) {
    if (target.box.getBoundingClientRect().top <= line) current = target.id;
  }
  return current;
}

/**
 * R10.1, R10.2 — sticky, translucent bar with the section in view marked.
 * From 768px the four section links sit between the wordmark and the "Email
 * me" pill. Below that the links collapse behind a "Menu" / "Close" button
 * next to the pill; no hamburger icon (design §3.3).
 */
export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === "";
  const [current, setCurrent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!onHome) return;
    const targets = SECTIONS.flatMap((section) => {
      const el = document.getElementById(section.id);
      return el ? [{ id: section.id, box: el.closest("section") ?? el }] : [];
    });
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      setCurrent(sectionInView(targets, header.current?.offsetHeight ?? 0));
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [onHome]);

  // The open menu closes on Escape (focus returns to the toggle) and on a tap
  // anywhere outside the bar.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const close = () => setOpen(false);

  return (
    <header ref={header} className="nav">
      <div className="shell nav__inner">
        <Link href="/" className="nav__wordmark" aria-label={site.name} onClick={close}>
          {wordmark.first}
          {wordmark.last ? (
            <>
              <span className="nav__dot">.</span>
              {wordmark.last}
            </>
          ) : null}
        </Link>

        <button
          ref={toggle}
          type="button"
          className="pill pill--outline nav__toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav
          id="nav-links"
          aria-label="Sections"
          className={`nav__links${open ? " nav__links--open" : ""}`}
        >
          <ul>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={href(section.id)}
                  aria-current={onHome && current === section.id ? "true" : undefined}
                  onClick={close}
                >
                  {section.label}
                </a>
              </li>
            ))}
            {/* Phone menu only: the wide bar shows the prototype's four links. */}
            <li className="nav__extra">
              <a href={site.github} target="_blank" rel="noopener noreferrer" onClick={close}>
                GitHub
                <ArrowUpRightIcon />
              </a>
            </li>
          </ul>
        </nav>

        <a className="pill pill--solid nav__email" href={`mailto:${site.email}`}>
          Email me
        </a>
      </div>
    </header>
  );
}
