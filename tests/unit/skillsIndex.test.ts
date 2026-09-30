import { describe, expect, it } from "vitest";
import { captionForSkill, captionText, normalize, projectsForSkill } from "@/lib/skillsIndex";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";

// Matching is checked against every project, hidden or not, and titles are
// looked up by slug, so hiding or renaming a project doesn't break these.
const title = (slug: string) => projects.find((p) => p.slug === slug)?.title;
const using = (skill: string) => projectsForSkill(skill, projects);

describe("normalize", () => {
  it("strips bracketed detail and lowercases", () => {
    expect(normalize("Spring Cloud (Eureka, Gateway, OpenFeign)")).toBe("spring cloud");
    expect(normalize("Docker / Docker Compose")).toBe("docker / docker compose");
  });
});

describe("projectsForSkill", () => {
  it("maps Spring Cloud to Order-Saga", () => {
    expect(using("Spring Cloud (Eureka, Gateway, OpenFeign)")).toContain(title("order-saga"));
  });

  it("maps Apache Kafka to Order-Saga", () => {
    expect(using("Apache Kafka")).toEqual([title("order-saga")]);
  });

  it("maps pgvector to rag-document-qa", () => {
    expect(using("pgvector")).toEqual([title("rag-document-qa")]);
  });

  it("maps Boost ASIO to the alert system", () => {
    expect(using("Boost ASIO")).toEqual([title("emergency-alert-system")]);
  });

  it("ignores version suffixes on stack entries", () => {
    expect(using("Spring Boot")).toContain(title("order-saga"));
    expect(using("Spring Boot")).toContain(title("tech-news-agent"));
  });
});

describe("captionForSkill", () => {
  it("labels the language group instead of matching projects", () => {
    const languages = skills.find((g) => g.group === "Human languages");
    expect(languages).toBeDefined();
    expect(languages && captionForSkill(languages, "Arabic")).toEqual({
      kind: "label",
      text: "Language",
    });
  });

  it("renders matched projects as a sentence", () => {
    const backend = skills.find((g) => g.group === "Backend");
    expect(backend).toBeDefined();
    if (!backend) return;
    const caption = captionForSkill(backend, "Spring Cloud (Eureka, Gateway, OpenFeign)", projects);
    expect(captionText(caption)).toBe(`Used in ${title("order-saga")}`);
  });

  it("names nothing for a skill only a hidden project uses", () => {
    const backend = skills.find((g) => g.items.includes("Apache Kafka"));
    expect(backend).toBeDefined();
    if (!backend) return;
    const shown = projects.filter((p) => p.slug !== "order-saga");
    const caption = captionForSkill(backend, "Apache Kafka", shown);
    expect(caption).toEqual({ kind: "none" });
    expect(captionText(caption)).toBe("");
  });

  it("gives no caption, not a fallback label, to a skill no project on the site uses", () => {
    for (const group of skills.filter((g) => !g.label)) {
      for (const item of group.items) {
        const caption = captionForSkill(group, item);
        if (projectsForSkill(item).length > 0) expect(caption.kind).toBe("projects");
        else expect(caption).toEqual({ kind: "none" });
      }
    }
  });
});
