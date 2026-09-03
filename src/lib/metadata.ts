import type { Metadata } from "next";
import { site } from "@/content/site";

/** Deployment origin; overridden per environment, defaulted for local builds. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://faisalnasir.dev").replace(
  /\/$/,
  "",
);

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: site.name,
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      title: site.name,
      description: site.description,
      url: siteUrl,
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
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
  description: site.description,
  sameAs: [site.github, site.linkedin],
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Ben-Gurion University of the Negev",
  },
} as const;
