import type { CSSProperties } from "react";
import { ScreenMount } from "./ScreenMount";
import { TransitionLink } from "../ui/TransitionLink";
import type { Project } from "@/content/projects";

/**
 * design §5.2 — repo name, locked summary, the stack as a comma list (no
 * pills), two links, and the screen. No numbers on the sections: the order is a
 * judgment about interest, not a ranking.
 */
export function ProjectSection({ project }: { project: Project }) {
  return (
    <article className="project">
      <div className="project__text stack-24">
        <h3 className="t-h3" id={`project-${project.slug}`} tabIndex={-1}>
          {project.title}
        </h3>
        <p className="t-body measure">{project.summary}</p>
        <div className="stack-8">
          <p className="t-caption">Stack</p>
          <p className="t-body measure">{project.stack.join(", ")}</p>
        </div>
        <p className="project__links">
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
          <TransitionLink href={`/projects/${project.slug}/`}>Read the case study</TransitionLink>
        </p>
      </div>
      <div
        className="project__screen"
        style={{ "--screen-transition": `screen-${project.slug}` } as CSSProperties}
      >
        <ScreenMount screen={project.screen} systemSummary={project.systemSummary} />
      </div>
    </article>
  );
}
