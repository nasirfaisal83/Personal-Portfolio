import type { Metadata } from "next";
import { visibleProjects } from "@/content/projects";
import { site } from "@/content/site";
import { countWord, plural } from "@/lib/count";

function listOf(phrases: readonly string[]): string {
  const n = phrases.length;
  return n <= 2
    ? phrases.join(" and ")
    : `${phrases.slice(0, -1).join(", ")}, and ${phrases[n - 1]}`;
}

function onSite(phrases: readonly (readonly [string, string])[], visibleSlugs: readonly string[]) {
  return phrases.filter(([slug]) => visibleSlugs.includes(slug)).map(([, phrase]) => phrase);
}

/**
 * The site description, listing only the projects on the site (see
 * `site.descriptionPhrases`). With the five public projects visible and no
 * private one, it is the PRD sentence word for word.
 */
export function describeSite(visibleSlugs: readonly string[]): string {
  const sentences: string[] = [site.descriptionLead];
  const open = onSite(site.descriptionPhrases, visibleSlugs);
  if (open.length > 0) {
    const n = open.length;
    sentences.push(
      `${countWord(n, true)} public ${plural(n, "project", "projects")}: ${listOf(open)}.`,
    );
  }
  const closed = onSite(site.descriptionPrivatePhrases, visibleSlugs);
  if (closed.length > 0) {
    const n = closed.length;
    sentences.push(
      `${countWord(n, true)} private client ${plural(n, "project", "projects")}: ${listOf(closed)}.`,
    );
  }
  return sentences.join(" ");
}

export const siteDescription = describeSite(visibleProjects.map((project) => project.slug));

/** Deployment origin: the live domain, unless NEXT_PUBLIC_SITE_URL says otherwise. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.faisalnasir.dev").replace(
  /\/$/,
  "",
);

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: site.name,
    description: siteDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      title: site.name,
      description: siteDescription,
      url: siteUrl,
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: siteDescription,
    },
    robots: { index: true, follow: true },
    ...overrides,
  };
}

/** R14.3 — Person JSON-LD, facts limited to PRD v2. */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: siteUrl,
  description: siteDescription,
  sameAs: [site.github, site.linkedin],
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Ben-Gurion University of the Negev",
  },
} as const;
