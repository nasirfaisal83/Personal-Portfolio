import { projects, visibleProjects, type Project } from "@/content/projects";
import { skills, type SkillGroup } from "@/content/skills";

/**
 * R7.3 — which projects use a skill is computed from `projects[].stack`, never
 * hand-maintained. Matching is case-insensitive on a normalized prefix: an item
 * like "Spring Cloud (Eureka, Gateway, OpenFeign)" reduces to "spring cloud" and
 * therefore matches every stack entry that starts with it.
 */
export function normalize(item: string): string {
  return item
    .replace(/\(.*?\)/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/[^a-zA-Z0-9+#./ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** The comparable head of a stack entry: name without trailing version numbers. */
function stackKey(entry: string): string {
  return normalize(entry)
    .replace(/\s+v?\d[\w.+-]*$/g, "")
    .trim();
}

function matches(skill: string, entry: string): boolean {
  const s = normalize(skill);
  const e = stackKey(entry);
  if (!s || !e) return false;
  if (s === e) return true;
  // A skill matches a stack entry when one is a whole-word prefix of the other.
  if (e.startsWith(`${s} `)) return true;
  if (s.startsWith(`${e} `)) return true;
  // "Docker / Docker Compose" style items match either side of the slash.
  return s.split(" / ").some((part) => part.length > 1 && (e === part || e.startsWith(`${part} `)));
}

/** Titles of the projects in `pool` that use `skill` — by default, those on the site. */
export function projectsForSkill(
  skill: string,
  pool: readonly Project[] = visibleProjects,
): string[] {
  return pool.filter((p) => p.stack.some((entry) => matches(skill, entry))).map((p) => p.title);
}

export type SkillCaption =
  | { kind: "projects"; titles: string[] }
  | { kind: "label"; text: string }
  | { kind: "none" };

export function captionForSkill(
  group: SkillGroup,
  skill: string,
  shown: readonly Project[] = visibleProjects,
): SkillCaption {
  if (group.label) return { kind: "label", text: group.label };
  const titles = projectsForSkill(skill, shown);
  if (titles.length > 0) return { kind: "projects", titles };
  // Used only by hidden projects: name nothing, rather than call it coursework.
  if (projectsForSkill(skill, projects).length > 0) return { kind: "none" };
  return { kind: "label", text: "Coursework" };
}

export function captionText(caption: SkillCaption): string {
  if (caption.kind === "none") return "";
  return caption.kind === "label" ? caption.text : `Used in ${caption.titles.join(", ")}`;
}

/** Every non-excluded skill item, paired with its group. Used by tests. */
export function allMatchableSkills(): { group: string; item: string }[] {
  return skills
    .filter((g) => !g.label)
    .flatMap((g) => g.items.map((item) => ({ group: g.group, item })));
}
