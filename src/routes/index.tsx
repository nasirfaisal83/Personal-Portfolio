import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Github, Linkedin, Mail, Copy, Check, MapPin, GraduationCap } from "lucide-react";
import front from "@/assets/faisal-front.png";
import side from "@/assets/faisal-side.png";
import { links, featured, projects, experience, skills } from "@/lib/portfolio-data";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faisal Nasir — Backend & AI Engineer" },
      { name: "description", content: "CS student at Ben-Gurion University building production backends, microservices and AI systems with Java, Spring and LLMs." },
      { property: "og:title", content: "Faisal Nasir — Backend & AI Engineer" },
      { property: "og:description", content: "Production backends, microservices and AI systems. BGU CS '28." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground">{children}</span>;
}

function Index() {
  useReveal();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(links.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="font-display text-lg font-bold tracking-tight">
            faisal<span className="text-primary">.</span>nasir
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#projects" className="hover:text-foreground">Projects</a>
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#skills" className="hover:text-foreground">Skills</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <a href={`mailto:${links.email}`} className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90">
            Email me
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div className="rise pb-16 md:pb-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative h-2 w-2 rounded-full bg-primary" /></span>
              Open to internships & junior roles
            </span>
            <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
              Faisal<br />Nasir<span className="text-primary">.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Backend & AI engineer building <span className="font-medium text-foreground">production systems</span> — from event-driven microservices to RAG and multi-agent pipelines.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />CS · Ben-Gurion University '28</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Israel · Arabic, Hebrew, English</span>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#projects" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition hover:-translate-y-0.5">
                See the projects <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium transition hover:border-foreground/30">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </div>
          </div>

          <div className="relative flex h-full items-end justify-center self-end">
            <div className="absolute bottom-0 left-1/2 aspect-square w-[88%] -translate-x-1/2 rounded-full bg-hero-glow" />
            <img src={front} alt="Portrait of Faisal Nasir" className="rise-late relative z-10 w-[82%] max-w-[440px] select-none" />
            <Chip className="left-0 top-[26%] float-a">Java · Spring Boot</Chip>
            <Chip className="right-0 top-[44%] float-b">AI · RAG · Agents</Chip>
            <Chip className="bottom-[16%] left-[4%] float-b">Kafka Microservices</Chip>
          </div>
        </div>
      </section>


      {/* Featured */}
      <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHead eyebrow="Selected work" title="Systems I've built" />
        <article className="reveal mt-12 overflow-hidden rounded-3xl bg-ink text-ink-foreground shadow-elegant">
          <div className="grid gap-10 p-8 md:grid-cols-[1fr_1.1fr] md:p-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-primary-glow">{featured.tag}</span>
              <h3 className="mt-3 font-display text-3xl font-bold md:text-4xl">{featured.name}</h3>
              <p className="mt-4 leading-relaxed text-ink-foreground/75">{featured.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {featured.stack.map((s) => <span key={s} className="rounded-md border border-ink-foreground/15 px-2 py-1 font-mono text-[11px] text-ink-foreground/80">{s}</span>)}
              </div>
              <Link to="/projects/$slug" params={{ slug: featured.slug }} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary-glow hover:underline">
                Read the case study <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <ol className="relative space-y-3">
              {featured.steps.map((s) => (
                <li key={s.k} className="group flex gap-4 rounded-2xl border border-ink-foreground/10 bg-ink-foreground/[0.03] p-4 transition hover:border-primary-glow/50">
                  <span className="font-mono text-sm text-primary-glow">{s.k}</span>
                  <div>
                    <div className="font-display font-semibold">{s.t}</div>
                    <div className="text-sm text-ink-foreground/65">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </article>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <article key={p.name} className="reveal group flex flex-col rounded-3xl border border-border bg-card p-8 transition duration-300 hover:-translate-y-1 hover:shadow-elegant" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">{p.kind}</span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 2}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold">{p.name}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{p.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">{p.stack.map((s) => <Tag key={s}>{s}</Tag>)}</div>
              <div className="mt-6 flex gap-5 border-t border-border pt-5 text-sm font-medium">
                <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary"><Github className="h-4 w-4" />Code</a>
                <Link to="/projects/$slug" params={{ slug: p.slug }} className="inline-flex items-center gap-1.5 hover:text-primary">Case study <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-end gap-12 px-6 pt-24 md:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal relative order-2 flex justify-center md:order-1">
            <div className="absolute bottom-0 h-[78%] w-[86%] rounded-t-[999px] bg-primary" />
            <img src={side} alt="Faisal Nasir, arms crossed" loading="lazy" className="relative z-10 w-[80%] max-w-[400px]" />
          </div>
          <div className="reveal order-1 pb-24 md:order-2">
            <SectionHead eyebrow="About" title="Engineer, teacher, community builder." />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              I'm a Computer Science student at Ben-Gurion University of the Negev, graduating 2028. I like systems that hold up under real load — and I like explaining how they work.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Beyond coursework in systems programming (C, x86 assembly, Unix, ELF) and programming languages (functional TypeScript, Scheme), I follow a self-directed AI engineering roadmap and bootcamps in microservices/DevOps, agentic AI and deep learning.
            </p>
            <ol className="mt-10 space-y-4">
              {experience.map((e) => (
                <li key={e.role} className="rounded-2xl border border-border bg-card p-5">
                  <div className="font-display font-semibold">{e.role}</div>
                  <div className="text-sm font-medium text-primary">{e.org}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{e.detail}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHead eyebrow="Toolkit" title="What I work with" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <div key={s.group} className={`reveal rounded-3xl border border-border bg-card p-6 ${i === 2 ? "lg:row-span-1 ring-1 ring-primary/30" : ""}`}>
              <h3 className="font-display text-lg font-semibold">{s.group}</h3>
              <div className="mt-4 flex flex-wrap gap-2">{s.items.map((it) => <Tag key={it}>{it}</Tag>)}</div>
            </div>
          ))}
          <div className="reveal flex flex-col justify-between rounded-3xl bg-primary p-6 text-primary-foreground">
            <h3 className="font-display text-lg font-semibold">Human languages</h3>
            <p className="mt-4 font-display text-2xl font-bold">Arabic · Hebrew · English</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 pb-10">
        <div className="reveal mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-8 py-20 text-center text-ink-foreground md:px-16">
          <span className="font-mono text-xs uppercase tracking-widest text-primary-glow">Let's talk</span>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            Looking for an engineer who ships? <span className="text-primary-glow">Say hello.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${links.email}`} className="inline-flex items-center gap-2 rounded-full bg-primary-glow px-6 py-3 text-sm font-semibold text-ink">
              <Mail className="h-4 w-4" /> {links.email}
            </a>
            <button onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 px-5 py-3 text-sm">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
            </button>
            <a href={links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="rounded-full border border-ink-foreground/20 p-3"><Github className="h-4 w-4" /></a>
            <a href={links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-full border border-ink-foreground/20 p-3"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        <footer className="mx-auto mt-8 flex max-w-6xl justify-center text-xs text-muted-foreground">
          <span>© 2026 Faisal Nasir</span>
        </footer>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
    </div>
  );
}

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`absolute z-20 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-medium shadow-elegant backdrop-blur ${className}`}>
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
      {children}
    </span>
  );
}
