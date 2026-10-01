import type { ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Github, Lock } from "lucide-react";
import { getCaseStudy } from "@/lib/case-studies";
import { links } from "@/lib/portfolio-data";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const study = getCaseStudy(params.slug);
    if (!study) throw notFound();
    return study;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Faisal Nasir` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.title} — Faisal Nasir` },
          { property: "og:description", content: loaderData.summary },
          { property: "og:type", content: "article" },
        ]
      : [],
  }),
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const study = Route.useLoaderData();
  const { slug } = Route.useParams();
  useReveal(slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            faisal<span className="text-primary">.</span>nasir
          </Link>
          <a
            href={`mailto:${links.email}`}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Email me
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="rise relative mx-auto max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
          <Link
            to="/"
            hash="projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
          <span className="mt-10 block font-mono text-xs uppercase tracking-widest text-primary">
            {study.kind}
          </span>
          <h1 className="mt-3 break-words font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            {study.title}
            <span className="text-primary">.</span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-2">
            {study.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-6 px-6 pb-24">
        <CaseSection index={1} title="What it does">
          <p className="text-lg leading-relaxed">{study.summary}</p>
        </CaseSection>

        <CaseSection index={2} title="How it works">
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {study.howItWorks.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </CaseSection>

        <CaseSection index={3} title="Design decisions">
          <ol className="space-y-3">
            {study.highlights.map((h, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-2xl border border-border bg-secondary/60 p-4 leading-relaxed"
              >
                <span className="font-mono text-sm text-primary">{pad(i + 1)}</span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </CaseSection>

        <CaseSection index={4} title="Stack">
          <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {study.stackTable.map((row) => (
              <div key={row.layer} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="font-mono text-xs uppercase tracking-widest text-primary sm:pt-0.5">
                  {row.layer}
                </dt>
                <dd className="text-muted-foreground">{row.tech}</dd>
              </div>
            ))}
          </dl>
        </CaseSection>

        <CaseSection index={5} title="Source">
          {study.github ? (
            <a
              href={study.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              <Github className="h-4 w-4" /> View on GitHub <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <p className="inline-flex items-start gap-3 leading-relaxed text-muted-foreground">
              <Lock className="mt-1 h-4 w-4 shrink-0 text-primary" />
              Private repository — built for a real client and running in production. The client is
              not named.
            </p>
          )}
        </CaseSection>
      </main>

      <section className="px-6 pb-10">
        <div className="reveal mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink px-8 py-12 text-ink-foreground md:flex-row md:items-center md:px-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary-glow">
              More work
            </span>
            <p className="mt-2 font-display text-2xl font-bold md:text-3xl">
              See the other systems, or <span className="text-primary-glow">say hello.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              hash="projects"
              className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 px-5 py-3 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> All projects
            </Link>
            <Link
              to="/"
              hash="contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary-glow px-5 py-3 text-sm font-semibold text-ink"
            >
              Get in touch
            </Link>
          </div>
        </div>
        <footer className="mx-auto mt-8 flex max-w-6xl justify-center text-xs text-muted-foreground">
          <span>© 2026 Faisal Nasir</span>
        </footer>
      </section>
    </div>
  );
}

/** One numbered block of the case study: mono index and heading beside its body. */
function CaseSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="reveal grid gap-6 rounded-3xl border border-border bg-card p-6 md:grid-cols-[14rem_1fr] md:p-10">
      <div>
        <span className="font-mono text-sm text-primary">{pad(index)}</span>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
