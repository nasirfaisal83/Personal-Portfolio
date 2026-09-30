import { describe, expect, it } from "vitest";
import { checkVisible } from "../../scripts/content-check";
import {
  featuredProject,
  getProject,
  gridProjects,
  projects,
  splitFeatured,
  visibleProjects,
} from "@/content/projects";
import { describeSite } from "@/lib/metadata";
import { countWord, plural } from "@/lib/count";

const ALL = projects.map((p) => p.slug);
// The five public projects the site launched with, before Salon was added.
const FIVE = ALL.filter((slug) => slug !== "salon");
const without = (...hidden: string[]) => new Set(ALL.filter((slug) => !hidden.includes(slug)));

// The sentence as it was before projects could be hidden.
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
      `${ORIGINAL_DESCRIPTION} One private client project: a salon appointment system, built for a real client and running in production.`,
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

describe("featured card and grid", () => {
  it("features the first visible project that has steps", () => {
    const first = visibleProjects.find((p) => (p.steps?.length ?? 0) > 0);
    expect(featuredProject).toBe(first);
    if (featuredProject) expect(featuredProject.visible).toBe(true);
  });

  it("puts every other visible project in the grid, in list order", () => {
    expect(gridProjects).toEqual(visibleProjects.filter((p) => p !== featuredProject));
    expect(gridProjects.every((p) => p.visible)).toBe(true);
    const shown = [...(featuredProject ? [featuredProject] : []), ...gridProjects].map(
      (p) => p.slug,
    );
    expect([...shown].sort()).toEqual(visibleProjects.map((p) => p.slug).sort());
    expect(new Set(shown).size).toBe(shown.length);
  });

  it("puts every visible project in the grid when none has steps", () => {
    const stepless = visibleProjects.map((p) => ({ ...p, steps: undefined }));
    const { featured, grid } = splitFeatured(stepless);
    expect(featured).toBeUndefined();
    expect(grid).toEqual(stepless);
  });

  it("treats an empty step list as no steps", () => {
    const [first, ...rest] = visibleProjects;
    const list = [{ ...first, steps: [] }, ...rest];
    const withSteps = rest.find((p) => (p.steps?.length ?? 0) > 0);
    expect(splitFeatured(list).featured).toBe(withSteps);
  });

  it("features the next project with steps when the first one is hidden", () => {
    const withSteps = projects.filter((p) => (p.steps?.length ?? 0) > 0);
    const hidden = withSteps[0];
    if (!hidden) return;
    const onSite = projects.filter((p) => p.visible && p !== hidden);
    const { featured, grid } = splitFeatured(onSite);
    expect(featured).toBe(withSteps.find((p) => p !== hidden && p.visible));
    expect(grid).not.toContain(hidden);
    expect(grid.length + (featured ? 1 : 0)).toBe(onSite.length);
  });
});
