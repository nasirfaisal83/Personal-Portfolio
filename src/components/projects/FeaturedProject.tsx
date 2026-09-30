import type { CSSProperties } from "react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import type { Project } from "@/content/projects";

/**
 * The dark featured card at the top of the Projects section: the project's
 * category, title, summary and short stack tags on the left, its numbered
 * steps on the right. Every string comes from content/projects.ts.
 *
 * R5.3 — the card carries the `view-transition-name` its case-study screen
 * uses, so following the link morphs the card into that screen.
 */
export function FeaturedProject({ project }: { project: Project }) {
  const steps = project.steps ?? [];
  return (
    <article
      className="project project--featured reveal"
      style={{ "--screen-transition": `screen-${project.slug}` } as CSSProperties}
    >
      <div className="project__inner">
        <div>
          <span className="eyebrow project__kind">{project.kind}</span>
          <h3 className="project__title" id={`project-${project.slug}`} tabIndex={-1}>
            {project.title}
          </h3>
          <p className="project__summary">{project.summary}</p>
          <ul className="tag-list project__tags" aria-label="Stack">
            {project.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          <p className="project__cta">
            <TransitionLink href={`/projects/${project.slug}/`}>
              Read the case study <ArrowUpRightIcon />
            </TransitionLink>
          </p>
        </div>
        {steps.length > 0 && (
          <ol className="project__steps">
            {steps.map((step, i) => (
              <li key={step.title} className="project__step">
                {/* The list already announces the order; the number is for the eye. */}
                <span className="project__step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="project__step-title">{step.title}</div>
                  <div className="project__step-detail">{step.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
