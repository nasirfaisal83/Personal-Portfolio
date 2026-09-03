import { describe, expect, it } from "vitest";
import { captionForSkill, captionText, normalize, projectsForSkill } from "@/lib/skillsIndex";
import { skills } from "@/content/skills";

describe("normalize", () => {
  it("strips bracketed detail and lowercases", () => {
    expect(normalize("Spring Cloud (Eureka, Gateway, OpenFeign)")).toBe("spring cloud");
    expect(normalize("Docker / Docker Compose")).toBe("docker / docker compose");
  });
});

describe("projectsForSkill", () => {
  it("maps Spring Cloud to Order-Saga", () => {
    expect(projectsForSkill("Spring Cloud (Eureka, Gateway, OpenFeign)")).toContain("Order-Saga");
  });

  it("maps Apache Kafka to Order-Saga", () => {
    expect(projectsForSkill("Apache Kafka")).toEqual(["Order-Saga"]);
  });

  it("maps pgvector to rag-document-qa", () => {
    expect(projectsForSkill("pgvector")).toEqual(["rag-document-qa"]);
  });

  it("maps Boost ASIO to the alert system", () => {
    expect(projectsForSkill("Boost ASIO")).toEqual(["Emergency-Alert-System"]);
  });

  it("ignores version suffixes on stack entries", () => {
    expect(projectsForSkill("Spring Boot")).toContain("Order-Saga");
    expect(projectsForSkill("Spring Boot")).toContain("tech-news-agent");
  });
});

describe("captionForSkill", () => {
  it("labels coursework and language groups instead of matching projects", () => {
    const coursework = skills.find((g) => g.group === "Systems programming (coursework)");
    const languages = skills.find((g) => g.group === "Human languages");
    expect(coursework && captionForSkill(coursework, "ELF format")).toEqual({
      kind: "label",
      text: "Coursework",
    });
    expect(languages && captionForSkill(languages, "Arabic")).toEqual({
      kind: "label",
      text: "Language",
    });
  });

  it("renders matched projects as a sentence", () => {
    const backend = skills.find((g) => g.group === "Backend");
    expect(backend).toBeDefined();
    if (!backend) return;
    const caption = captionForSkill(backend, "Spring Cloud (Eureka, Gateway, OpenFeign)");
    expect(captionText(caption)).toBe("Used in Order-Saga");
  });
});
