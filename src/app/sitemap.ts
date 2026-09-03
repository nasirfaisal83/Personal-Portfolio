import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { siteUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, priority: 1 },
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}/`,
      priority: 0.7,
    })),
  ];
}
