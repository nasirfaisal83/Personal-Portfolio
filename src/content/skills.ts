// Groups and items exactly as PRD v2 §5.5. No proficiency data of any kind (R7.2).

export interface SkillGroup {
  group: string;
  items: readonly string[];
  /** Groups excluded from project matching carry their own label instead (R7.3). */
  label?:"Language";
}

export const skills: readonly SkillGroup[] = [
  {
    group: "Languages",
    items: ["Java", "Python", "C++", "JavaScript", "TypeScript", "SQL"],
  },
  {
    group: "Backend",
    items: [
      "Rest API design",
      "JWT authentication",
      "FastAPI",
      "Spring Boot",
      "Spring AI",
      "Spring Cloud (Eureka, Gateway, OpenFeign)",
      "Multithreading & concurrency",
      "Apache Kafka"
    ],
  },
  {
    group: "AI/LLM engineering",
    items: [
      "Spring AI",
      "vector embeddings",
      "LLM Orchestration",
      "Skills & Tools",
      "MCP",
      "Spec-driven Development",
      "Automation Hooks",
      "Steering Files",
      "Agentic Loops",
      "Claude Code",
      "Kiro",
      "Codex",
      "Retrieval-Augmented Generation (pgvector)",
      "multi-agent orchestration (ReAct pattern)",
      "Tavily Search API"
    ],
  },
  { group: "Databases", items: ["PostgreSQL","MySQL","MongoDB", "pgvector"] },
  {
    group: "Systems & DevOps",
    items: ["Linux","Docker", "Kubernetes", "AWS(IAM,Lambda,EC2,S3,Managed Databases)", "Jenkins", "CI/CD pipelines", "GitHub Actions","Flyway","Maven","Gradle"],
  },
  { group: "Human languages", items: ["Arabic", "Hebrew", "English"], label: "Language" },
];
