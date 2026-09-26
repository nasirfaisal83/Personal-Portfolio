import { describe, expect, it } from "vitest";
import { checkVisible } from "../../scripts/content-check";
import { getProject, projects, visibleProjects } from "@/content/projects";
import { describeSite } from "@/lib/metadata";
import { heroAsciiFor, heroScene, heroSceneFor } from "@/components/hero/heroMap";
import { countWord, plural } from "@/lib/count";

const ALL = projects.map((p) => p.slug);
// The five public projects the site launched with, before Salon was added.
const FIVE = ALL.filter((slug) => slug !== "salon");
const without = (...hidden: string[]) => new Set(ALL.filter((slug) => !hidden.includes(slug)));

// The drawing and the sentence as they were before projects could be hidden.
const ORIGINAL_ASCII = `                  rag-document-qa
                        │
   order-saga ──────────┼────────── tech-news-agent
                        │
                   ┌────┴────┐
                   │portfolio│
                   └────┬────┘
                        │
 emergency-alert-system ┴──────────── con-detection`;
const ORIGINAL_DESCRIPTION =
  "CS student at Ben-Gurion University of the Negev, teaching assistant, and Hasoub on-campus community manager. Five public projects: RAG document Q&A, a choreography saga, a multi-agent news pipeline, a STOMP alert system, and YOLOv5 cone detection.";

describe("visible flag", () => {
  it("is declared on every project", () => {
    for (const project of projects) expect(typeof project.visible).toBe("boolean");
  });

  it("decides what visibleProjects and getProject return", () => {
    expect(visibleProjects).toEqual(projects.filter((p) => p.visible));
    for (const project of projects) {
      expect(getProject(project.slug)).toBe(project.visible ? project : undefined);
    }
  });

  it("must leave at least one project on the site", () => {
    expect(checkVisible([{ visible: false }, { visible: false }])).toHaveLength(1);
    expect(checkVisible([{ visible: false }, { visible: true }])).toEqual([]);
  });
});

describe("countWord", () => {
  it("spells small counts and capitalises on request", () => {
    expect(countWord(3)).toBe("three");
    expect(countWord(5, true)).toBe("Five");
    expect(countWord(12)).toBe("12");
    expect(plural(1, "project", "projects")).toBe("project");
    expect(plural(4, "project", "projects")).toBe("projects");
  });
});

describe("site description", () => {
  it("is the PRD sentence word for word with the five public projects", () => {
    expect(describeSite(FIVE)).toBe(ORIGINAL_DESCRIPTION);
  });

  it("adds a private client sentence when Salon is on the site", () => {
    expect(describeSite(ALL)).toBe(
      `${ORIGINAL_DESCRIPTION} One private client project: a salon appointment system, built solo for a real client and running in production.`,
    );
  });

  it("drops hidden projects and recounts", () => {
    const three = describeSite([...without("order-saga", "con-detection")]);
    expect(three).toContain(
      "Three public projects: RAG document Q&A, a multi-agent news pipeline, and a STOMP alert system.",
    );
    expect(describeSite(["order-saga", "con-detection"])).toContain(
      "Two public projects: a choreography saga and YOLOv5 cone detection.",
    );
    expect(describeSite(["tech-news-agent"])).toContain(
      "One public project: a multi-agent news pipeline.",
    );
  });
});

describe("hero map", () => {
  it("draws the original README art for the five public projects", () => {
    expect(heroAsciiFor(new Set(FIVE))).toBe(ORIGINAL_ASCII);
  });

  it("hangs Salon under the lower junction", () => {
    expect(heroAsciiFor(new Set(ALL))).toBe(
      `${ORIGINAL_ASCII.replace("system ┴", "system ┼")}\n${" ".repeat(24)}│\n${" ".repeat(22)}salon`,
    );
    const alone = heroAsciiFor(new Set(["salon"])).split("\n");
    expect(alone.at(-1)).toBe(`${" ".repeat(22)}salon`);
    expect(alone.join("\n")).not.toMatch(/emergency|con-detection|rag|order|tech/);
  });

  it("removes a hidden project's label and redraws the junctions", () => {
    const noRag = heroAsciiFor(without("rag-document-qa")).split("\n");
    expect(noRag[0]).toBe("   order-saga ──────────┬────────── tech-news-agent");
    expect(noRag.join("\n")).not.toContain("rag-document-qa");

    const leftOnly = heroAsciiFor(new Set(["order-saga", "emergency-alert-system"]));
    expect(leftOnly).toContain("   order-saga ──────────┐");
    expect(leftOnly).toContain(" emergency-alert-system ┘");
    expect(leftOnly).not.toMatch(/tech-news-agent|con-detection|rag-document-qa/);
  });

  it("closes the hub box on a side with nothing left", () => {
    const top = heroAsciiFor(new Set(["rag-document-qa"])).split("\n");
    expect(top.at(-1)).toBe("                   └─────────┘");
    const bottom = heroAsciiFor(new Set(["con-detection"])).split("\n");
    expect(bottom[0]).toBe("                   ┌─────────┐");
    expect(bottom.at(-1)).toBe("                        └──────────── con-detection");
  });

  it("takes a hidden project's node and edge out of both layouts", () => {
    const scene = heroSceneFor(without("order-saga"));
    expect(scene.nodes.map((n) => n.id)).not.toContain("order-saga");
    expect(scene.narrow?.nodes.map((n) => n.id)).not.toContain("order-saga");
    expect(scene.edges.map((e) => e.from)).not.toContain("order-saga");
    expect(scene.nodes.map((n) => n.id)).toContain("portfolio");
    expect(scene.nodes).toHaveLength(heroScene.nodes.length - 1);
  });
});
