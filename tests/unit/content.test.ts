import { describe, expect, it } from "vitest";
import { EXPECTED_SLUGS, checkSlugs, findPlaceholders } from "../../scripts/content-check";
import { projectSlugs, projects } from "@/content/projects";
import { site } from "@/content/site";
import { experience } from "@/content/experience";

describe("content-check", () => {
  it("accepts exactly the six slugs", () => {
    expect(checkSlugs(projectSlugs)).toEqual([]);
    expect(checkSlugs([...EXPECTED_SLUGS].reverse())).toEqual([]);
  });

  it("rejects a changed project set", () => {
    expect(checkSlugs(["order-saga"])).toHaveLength(1);
    expect(checkSlugs([...EXPECTED_SLUGS, "extra"])).toHaveLength(1);
  });

  it("finds placeholder tokens with their file and line", () => {
    const found = findPlaceholders([
      { file: "src/content/site.ts", text: 'a\nnameArabic: "TODO_NAME_AR",\n' },
    ]);
    expect(found).toEqual(["src/content/site.ts:2 TODO_NAME_AR"]);
  });

  it("reports nothing when every placeholder is filled", () => {
    expect(findPlaceholders([{ file: "x.ts", text: 'name: "Faisal Nasir"' }])).toEqual([]);
  });
});

describe("content shape", () => {
  it("gives every project a summary, a stack, and a screen", () => {
    for (const project of projects) {
      expect(project.summary.length).toBeGreaterThan(40);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.stackTable.length).toBeGreaterThan(0);
      expect(project.howItWorks.length).toBeGreaterThanOrEqual(2);
      expect(project.highlights.length).toBeGreaterThan(0);
      // A project without `github` is a private client project.
      if (project.github) {
        expect(project.github.startsWith("https://github.com/nasirfaisal83/")).toBe(true);
      }
    }
  });

  it("keeps the contact details from the PRD", () => {
    expect(site.email).toBe("nasirfaisal83@gmail.com");
    expect(site.github).toBe("https://github.com/nasirfaisal83");
    expect(site.linkedin).toBe("https://www.linkedin.com/in/faisal-nasir-381a33131");
  });

  it("lists exactly the two roles from the PRD", () => {
    expect(experience.map((e) => e.role)).toEqual([
      "Teaching Assistant",
      "On-Campus Community Manager",
    ]);
  });
});

describe("project cards", () => {
  it("gives every project a category and at least one tag", () => {
    for (const project of projects) {
      expect(project.kind.trim().length).toBeGreaterThan(0);
      expect(project.tags.length).toBeGreaterThan(0);
    }
  });

  it("takes every tag from that project's own stack", () => {
    for (const project of projects) {
      const stack = project.stack.map((entry) => entry.toLowerCase());
      for (const tag of project.tags) {
        expect(
          stack.some((entry) => entry.includes(tag.toLowerCase())),
          `${project.slug}: tag "${tag}" is not in its stack`,
        ).toBe(true);
      }
    }
  });

  it("numbers the featured card's steps with a title and a detail each", () => {
    for (const project of projects) {
      for (const step of project.steps ?? []) {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.detail.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
