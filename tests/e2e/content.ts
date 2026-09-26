import { visibleProjects } from "../../src/content/projects";

/** The projects on the site, in page order. A hidden project has no page to test. */
export const visibleSlugs = visibleProjects.map((project) => project.slug);
export const visibleTitles = visibleProjects.map((project) => project.title);

/** Whether a project is on the site; tests about one project skip when it isn't. */
export function onSite(slug: string): boolean {
  return visibleSlugs.includes(slug);
}
