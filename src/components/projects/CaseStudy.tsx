import type { CSSProperties } from "react";
import { ScreenMount } from "./ScreenMount";
import { StackTable } from "./StackTable";
import type { Project } from "@/content/projects";

/** design §5.3 — the screen first, then what it does, how it works, decisions, stack, source. */
export function CaseStudy({ project }: { project: Project }) {
  return (
    <article className="shell case stack-40">
      <h1 className="t-h2">{project.title}</h1>

      <div
        className="case__screen"
        style={{ "--screen-transition": `screen-${project.slug}` } as CSSProperties}
      >
        <ScreenMount screen={project.screen} systemSummary={project.systemSummary} />
      </div>

      <section className="stack-16" aria-labelledby={`what-${project.slug}`}>
        <h2 className="t-h3" id={`what-${project.slug}`}>
          What it does
        </h2>
        <p className="t-body measure">{project.summary}</p>
      </section>

      <section className="stack-16" aria-labelledby={`how-${project.slug}`}>
        <h2 className="t-h3" id={`how-${project.slug}`}>
          How it works
        </h2>
        <div className="stack-16 measure">
          {project.howItWorks.map((paragraph, i) => (
            <p key={i} className="t-body">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="stack-16" aria-labelledby={`decisions-${project.slug}`}>
        <h2 className="t-h3" id={`decisions-${project.slug}`}>
          Design decisions
        </h2>
        <ul className="case__list measure">
          {project.highlights.map((item, i) => (
            <li key={i} className="t-body">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="stack-16" aria-labelledby={`stack-${project.slug}`}>
        <h2 className="t-h3" id={`stack-${project.slug}`}>
          Stack
        </h2>
        <StackTable rows={project.stackTable} />
      </section>

      <section className="stack-16" aria-labelledby={`source-${project.slug}`}>
        <h2 className="t-h3" id={`source-${project.slug}`}>
          Source
        </h2>
        <p className="t-body">
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </section>
    </article>
  );
}
