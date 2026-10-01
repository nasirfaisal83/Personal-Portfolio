export const links = {
  email: "nasirfaisal83@gmail.com",
  github: "https://github.com/nasirfaisal83",
  linkedin: "https://www.linkedin.com/in/faisal-nasir-381a33131",
  site: "https://www.faisalnasir.dev",
};

// Projects: `featured` is the large card at the top of the Projects section,
// `projects` is the grid below it, shown in list order. Each one's case-study
// page text lives in case-studies.ts under the same `slug`; don't change a slug.
//
// To hide a project, set `visible: false` — its card disappears and its
// /projects/<slug> page becomes a 404. Set it back to `true` to restore both.
// Don't delete entries to hide them.

export const featured = {
  visible: true,
  name: "Salon Appointment System",
  tag: "Private client project · In production",
  summary:
    "A full-stack booking and salon-management system built for a real client. Customers book without an account, verify their phone with a one-time code, and every request is approved by the assigned stylist. Confirmations, reminders and a cryptographically signed manage link are handled automatically.",
  stack: ["Spring Boot", "Java", "PostgreSQL", "Flyway", "Next.js", "React 19", "TypeScript", "Cloudflare R2", "JUnit 5", "Docker"],
  steps: [
    { k: "01", t: "Pick a slot", d: "Availability computed live: hours − time off − busy appointments." },
    { k: "02", t: "Verify phone", d: "One-time SMS code sets a remembered-phone cookie." },
    { k: "03", t: "Request", d: "Advisory lock + exclusion constraint prevent double booking." },
    { k: "04", t: "Approve", d: "Stylist confirms from the dashboard; reminders are scheduled." },
    { k: "05", t: "Self-manage", d: "Signed link lets the customer cancel or reschedule." },
  ],
  slug: "salon",
};

export const projects = [
  {
    visible: true,
    name: "Order-Saga",
    kind: "Distributed systems",
    summary:
      "Order processing across 5 microservices using the Choreography Saga pattern. Services coordinate purely through Kafka events, with automatic compensation when a step fails.",
    stack: ["Spring Boot 3.4", "Kafka", "PostgreSQL", "Spring Cloud", "Docker"],
    github: "https://github.com/nasirfaisal83/Order-Saga",
    slug: "order-saga",
  },
  {
    visible: true,
    name: "rag-document-qa",
    kind: "AI · Retrieval",
    summary:
      "Upload documents, ask questions, get streamed answers grounded in the source. 3-strategy PDF extraction (PDFBox → Tesseract → GPT-4o Vision) and pgvector search with citations.",
    stack: ["Spring AI", "GPT-4o", "pgvector", "WebFlux", "Java 21"],
    github: "https://github.com/nasirfaisal83/rag-document-qa",
    slug: "rag-document-qa",
  },
  {
    visible: true,
    name: "tech-news-agent",
    kind: "AI · Multi-agent",
    summary:
      "An orchestrator runs a ReAct loop over five specialised agents to turn a topic into a fact-checked LinkedIn post, retrying automatically when confidence is too low.",
    stack: ["Spring AI", "gpt-4o-mini", "Tavily", "GitHub MCP", "Java 21"],
    github: "https://github.com/nasirfaisal83/tech-news-agent",
    slug: "tech-news-agent",
  },
  {
    visible: true,
    name: "Emergency-Alert-System",
    kind: "Networking · Concurrency",
    summary:
      "Pub-sub alert broadcasting over STOMP: a Java server switchable between thread-per-client and a non-blocking NIO reactor, paired with a C++11 Boost ASIO client.",
    stack: ["Java", "STOMP", "Java NIO", "C++11", "Boost ASIO"],
    github: "https://github.com/nasirfaisal83/Emergency-Alert-System",
    slug: "emergency-alert-system",
  },
];

/** The grid projects that are on the site. */
export const visibleProjects = projects.filter((p) => p.visible);

/** Whether a project's card and case-study page are on the site. */
export function isProjectVisible(slug: string): boolean {
  return [featured, ...projects].some((p) => p.slug === slug && p.visible);
}

export const experience = [
  { role: "Teaching Assistant", org: "Ben-Gurion University of the Negev", detail: "Data Structures · Introduction to CS (Java & OOP)" },
  { role: "On-Campus Community Manager", org: "Hasoub", detail: "Organises talks, industry events and a hackathon for Israel's tech community" },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Java", "Python", "C++", "JavaScript", "TypeScript", "SQL"] },
  { group: "Backend", items: ["Spring Boot", "Spring Cloud", "REST API design", "JWT auth", "FastAPI", "Kafka", "Concurrency"] },
  { group: "AI / LLM", items: ["Spring AI", "RAG (pgvector)", "Multi-agent (ReAct)", "MCP", "Embeddings", "Claude Code", "Codex"] },
  { group: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "pgvector"] },
  { group: "Systems & DevOps", items: ["Linux", "Docker", "Kubernetes", "AWS", "Jenkins", "GitHub Actions", "CI/CD"] },
];
