// Groups and items exactly as PRD v2 §5.5. No proficiency data of any kind (R7.2).

export interface SkillGroup {
  group: string;
  items: readonly string[];
  /** Groups excluded from project matching carry their own label instead (R7.3). */
  label?: "Coursework" | "Language";
}

export const skills: readonly SkillGroup[] = [
  {
    group: "Languages",
    items: ["Java", "Python", "C++", "C", "JavaScript", "x86 NASM Assembly", "TypeScript", "SQL"],
  },
  {
    group: "Backend",
    items: [
      "Spring Boot",
      "Spring AI",
      "Spring Cloud (Eureka, Gateway, OpenFeign)",
      "Spring WebFlux",
      "Spring Data JPA",
    ],
  },
  {
    group: "AI/LLM engineering",
    items: [
      "OpenAI GPT-4o / GPT-4o-mini integration",
      "Retrieval-Augmented Generation (pgvector)",
      "multi-agent orchestration (ReAct pattern)",
      "Tavily Search API",
      "GitHub MCP",
      "YOLOv5 object detection",
      "OpenCV",
    ],
  },
  { group: "Data", items: ["PostgreSQL", "pgvector", "Flyway"] },
  {
    group: "Messaging & infra",
    items: ["Apache Kafka", "Docker / Docker Compose", "STOMP protocol", "Boost ASIO"],
  },
  {
    group: "Architecture",
    items: [
      "Choreography Saga pattern",
      "microservices",
      "idempotent consumers",
      "optimistic locking",
      "thread-per-client & reactor concurrency models",
    ],
  },
  {
    group: "Document processing",
    items: ["Apache PDFBox", "Tesseract OCR", "Apache POI"],
  },
  {
    group: "Systems programming (coursework)",
    items: ["C", "x86 NASM assembly", "Unix processes/signals", "ELF format"],
    label: "Coursework",
  },
  {
    group: "Functional programming (coursework)",
    items: ["TypeScript", "Ramda", "monads (L3/Scheme)"],
    label: "Coursework",
  },
  { group: "Human languages", items: ["Arabic", "Hebrew", "English"], label: "Language" },
];
