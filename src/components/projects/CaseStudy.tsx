import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ScreenMount } from "./ScreenMount";
import { StackTable } from "./StackTable";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/icons";
import type { Project } from "@/content/projects";

/** design §5.3 — the screen first, then what it does, how it works, decisions, stack, source. */
export function CaseStudy({ project }: { project: Project }) {
  return (
    <article className="case">
      <div className="case__grid" aria-hidden="true" />

      <header className="shell case__head rise">
        <Link href="/#projects" className="case__back">
          <span aria-hidden="true">←</span> All projects
        </Link>
        <p className="eyebrow">{project.kind}</p>
        <h1 className="case__title">{project.title}</h1>
        <ul className="tag-list case__tags">
          {project.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <div className="shell case__body">
        <div
          className="case__screen"
          style={{ "--screen-transition": `screen-${project.slug}` } as CSSProperties}
        >
          <ScreenMount screen={project.screen} systemSummary={project.systemSummary} />
        </div>

        <div className="case__sections">
          <CaseSection id={`what-${project.slug}`} index={1} title="What it does">
            <p className="case__lede">{project.summary}</p>
          </CaseSection>

          <CaseSection id={`how-${project.slug}`} index={2} title="How it works">
            <div className="case__prose">
              {project.howItWorks.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </CaseSection>

          <CaseSection id={`decisions-${project.slug}`} index={3} title="Design decisions">
            <ul className="case__decisions">
              {project.highlights.map((item, i) => (
                <li key={i} className="case__decision">
                  <span className="case__decision-index" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CaseSection>

          <CaseSection id={`stack-${project.slug}`} index={4} title="Stack">
            <StackTable rows={project.stackTable} />
          </CaseSection>

          <CaseSection id={`source-${project.slug}`} index={5} title="Source">
            {project.github ? (
              <p>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill--primary"
                >
                  <GithubIcon />
                  View on GitHub
                  <ArrowUpRightIcon />
                </a>
              </p>
            ) : (
              <p className="case__lede">
                Private repository — built for a real client and running in production. The client
                is not named.
              </p>
            )}
          </CaseSection>
        </div>
      </div>
    </article>
  );
}

/** One titled block of the case study: a mono index and display heading beside its body. */
function CaseSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="case__section reveal" aria-labelledby={id}>
      <div className="case__label">
        <span className="case__index" aria-hidden="true">
          {pad(index)}
        </span>
        <h2 className="case__h2" id={id}>
          {title}
        </h2>
      </div>
      <div className="case__content">{children}</div>
    </section>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
