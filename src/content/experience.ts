// PRD v2 §5.2 and §5.3. Dates are unknown; the placeholder hides the column (R6.2).

export interface ExperienceEntry {
  role: string;
  org: string;
  detail: string;
  period: string;
}

export const experience: readonly ExperienceEntry[] = [
  {
    role: "Teaching Assistant",
    org: "Ben-Gurion University of the Negev",
    detail: "Data Structures; Introduction to CS (Java & OOP)",
    period: "TODO_DATES",
  },
  {
    role: "On-Campus Community Manager",
    org: "Hasoub",
    detail: "Organizes talks, industry events, and a hackathon",
    period: "TODO_DATES",
  },
] as const;

export const about = {
  study:
    "Computer Science student at Ben-Gurion University of the Negev, expected graduation 2028. Teaching Assistant for Data Structures and Introduction to CS (Java & OOP).",
  community:
    "On-Campus Community Manager for Hasoub, a tech community in Israel: talks, industry events, and a hackathon.",
  learning:
    "Self-directed: a structured AI engineering roadmap and off-campus bootcamps in microservices/DevOps, agentic AI, and Python/deep learning. Coursework includes the System Programming Laboratory (C, x86 NASM assembly, Unix processes and signals, ELF format) and Principles of Programming Languages (TypeScript functional programming, Ramda, monads, L3/Scheme).",
} as const;

export const community = {
  role: "On-Campus Community Manager, Hasoub",
  body: "Organizes talks, industry events, and a hackathon for the tech community in Israel.",
} as const;
