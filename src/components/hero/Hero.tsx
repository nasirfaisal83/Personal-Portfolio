"use client";

import { useCallback } from "react";
import { HeroScreen } from "./HeroScreen";
import { Name } from "./Name";
import { isPlaceholder, site } from "@/content/site";

/**
 * R1.1 — name, role line and the three primary actions are above the fold at
 * any width from 360px. R2.5 — activating a map node scrolls to that project's
 * section and moves focus to its heading.
 */
export function Hero({ resumeAvailable }: { resumeAvailable: boolean }) {
  const showTagline = !isPlaceholder(site.tagline);

  const goToProject = useCallback((slug: string) => {
    const heading = document.getElementById(`project-${slug}`);
    if (!heading) return;
    heading.scrollIntoView({ block: "start" });
    heading.focus({ preventScroll: true });
  }, []);

  return (
    <section className="section hero" aria-labelledby="hero-heading">
      <div className="shell hero__grid">
        <div className="hero__text stack-24">
          <div id="hero-heading">
            <Name />
          </div>
          {showTagline ? <p className="t-tagline measure">{site.tagline}</p> : null}
          <div className="stack-8 measure">
            <p className="t-body">{site.roleLine}</p>
            <p className="t-body">{site.location}</p>
            <p className="t-body">{site.languages}</p>
          </div>
          <div className="btn-row">
            <a className="btn btn--primary" href="#projects">
              See the projects
            </a>
            <a className="btn" href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {resumeAvailable ? (
              <a className="btn" href={site.resumeUrl} download>
                Download resume
              </a>
            ) : null}
          </div>
        </div>
        <div className="hero__panel">
          <HeroScreen onSelectProject={goToProject} />
        </div>
      </div>
    </section>
  );
}
