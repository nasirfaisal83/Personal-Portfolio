import { ProjectSection } from "../projects/ProjectSection";
import { SectionHeading } from "../ui/SectionHeading";
import { projects } from "@/content/projects";

export function Projects() {
  return (
    <section className="section" aria-labelledby="projects">
      <div className="shell stack-40">
        <div className="stack-16">
          <SectionHeading id="projects">Projects</SectionHeading>
          <p className="t-body measure">
            Five public repositories. Each screen runs the system described in that
            repository&rsquo;s README; the buttons drive real scenarios from it.
          </p>
        </div>
        {projects.map((project) => (
          <ProjectSection key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
