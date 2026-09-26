import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { getProject, visibleProjects } from "@/content/projects";
import { buildMetadata } from "@/lib/metadata";

/** R5.1 — a case-study route is statically generated for each project on the site. */
export function generateStaticParams() {
  return visibleProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return buildMetadata();
  return buildMetadata({
    title: `${project.title} — Faisal Nasir`,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}/` },
    openGraph: { title: project.title, description: project.summary },
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return (
    <div className="section">
      <CaseStudy project={project} />
    </div>
  );
}
