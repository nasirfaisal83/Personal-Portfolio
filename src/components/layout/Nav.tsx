"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

const SECTIONS = [
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "community", label: "Community" },
  { id: "contact", label: "Contact" },
] as const;

/**
 * R10.1, R10.2 — sticky bar, the section in view underlined, a hairline that
 * appears once the page has scrolled. Below 768px the links collapse behind a
 * "Menu" / "Close" button; no hamburger icon (design §3.3).
 */
export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === "";
  const [current, setCurrent] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome || typeof IntersectionObserver !== "function") return;
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setCurrent(visible.target.id);
      },
      { rootMargin: "-64px 0px -60% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className={`nav${scrolled ? " nav--scrolled" : ""}`}>
      <div className="shell nav__inner">
        <Link href="/" className="nav__name">
          {site.name}
        </Link>

        <nav aria-label="Sections" className={`nav__links${open ? " nav__links--open" : ""}`}>
          <ul>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={href(section.id)}
                  aria-current={onHome && current === section.id ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
