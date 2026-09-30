import type { CSSProperties } from "react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";
import type { Project } from "@/content/projects";

/**
 * One card in the Projects grid: category and number, title, summary, short
 * stack tags, and the code and case-study links. A project with no `github`
 * is a private client project and says so instead of linking.
 *
 * `number` continues after the featured card; `index` staggers the scroll
 * reveal. R5.3 — the card carries its case-study screen's
 * `view-transition-name`, so following the link morphs one into the other.
 */
export function ProjectCard({
  project,
  number,
  index,
}: {
  project: Project;
  number: number;
  index: number;
}) {
  const style = {
    "--screen-transition": `screen-${project.slug}`,
    "--reveal-delay": `${index * 60}ms`,
  } as CSSProperties;

  return (
    <article className="project project--card reveal" style={style}>
      <div className="project__top">
        <span className="eyebrow project__kind">{project.kind}</span>
        <span className="project__num" aria-hidden="true">
          {String(number).padStart(2, "0")}
        </span>
      </div>
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
      <div className="project__footer">
        {project.github ? (
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <GithubIcon />
            Code<span className="visually-hidden">: {project.title} on GitHub</span>
          </a>
        ) : (
          <span className="project__private">Private client project</span>
        )}
        <TransitionLink href={`/projects/${project.slug}/`}>
          Case study<span className="visually-hidden">: {project.title}</span>
          <ArrowUpRightIcon />
        </TransitionLink>
      </div>
    </article>
  );
}
