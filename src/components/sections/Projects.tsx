import { ProjectSection } from "../projects/ProjectSection";
import { SectionHeading } from "../ui/SectionHeading";
import { visibleProjects } from "@/content/projects";
import { countWord, plural } from "@/lib/count";

/** "Five public repositories and one private client project." */
function countRepositories(publicCount: number, privateCount: number): string {
  const parts = [];
  if (publicCount > 0) {
    parts.push(
      `${countWord(publicCount)} public ${plural(publicCount, "repository", "repositories")}`,
    );
  }
  if (privateCount > 0) {
    parts.push(
      `${countWord(privateCount)} private client ${plural(privateCount, "project", "projects")}`,
    );
  }
  const sentence = parts.join(" and ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

export function Projects() {
  const privateCount = visibleProjects.filter((project) => !project.github).length;
  const publicCount = visibleProjects.length - privateCount;
  return (
    <section className="section" aria-labelledby="projects">
      <div className="shell stack-40">
        <div className="stack-16">
          <SectionHeading id="projects">Projects</SectionHeading>
          <p className="t-body measure">
            {countRepositories(publicCount, privateCount)}{" "}
            {privateCount > 0
              ? "Each screen runs the system its own documentation describes; the buttons drive real scenarios from it."
              : "Each screen runs the system described in that repository’s README; the buttons drive real scenarios from it."}
          </p>
        </div>
        {visibleProjects.map((project) => (
          <ProjectSection key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
