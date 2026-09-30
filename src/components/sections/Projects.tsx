import { FeaturedProject } from "@/components/projects/FeaturedProject";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHead } from "@/components/ui/SectionHead";
import { featuredProject, gridProjects } from "@/content/projects";
import { site } from "@/content/site";

/**
 * The Projects section: the featured card, then the numbered grid of the
 * other projects. Both read the visible projects only, so hiding a project in
 * content/projects.ts takes it off here too. The animated diagrams run on the
 * case-study pages.
 */
export function Projects() {
  const { eyebrow, title } = site.sections.projects;
  // The featured card is 01; the grid's numbers continue after it.
  const firstNumber = featuredProject ? 2 : 1;

  return (
    <section className="section projects" aria-labelledby="projects">
      <div className="shell">
        <SectionHead id="projects" eyebrow={eyebrow} title={title} />
        {featuredProject && <FeaturedProject project={featuredProject} />}
        {gridProjects.length > 0 && (
          <div className="projects__grid">
            {gridProjects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                number={firstNumber + i}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
