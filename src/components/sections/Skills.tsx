import { SectionHead } from "@/components/ui/SectionHead";
import { SkillGroups } from "./SkillGroups";
import { site } from "@/content/site";
import { skills } from "@/content/skills";
import { captionForSkill, captionText } from "@/lib/skillsIndex";

/**
 * R7 — the groups and items from PRD §5.5 and nothing else: no bars, no
 * percentages, no years, no stars. Each item's caption names the projects that
 * use it, computed from `projects[].stack` here on the server, so the project
 * list (hidden projects included) never ships to the browser.
 *
 * Laid out after the Lovable prototype: one card per group, with the human
 * languages as the solid accent tile. That group (the one carrying a label,
 * R7.3) is excluded from project matching, so it gets no captions.
 */
export function Skills() {
  const { eyebrow, title } = site.sections.skills;
  const captions = Object.fromEntries(
    skills
      .filter((group) => !group.label)
      .map((group) => [
        group.group,
        Object.fromEntries(
          group.items.map((item) => [item, captionText(captionForSkill(group, item))]),
        ),
      ]),
  );

  return (
    <section className="section" aria-labelledby="skills">
      <div className="shell">
        <SectionHead id="skills" eyebrow={eyebrow} title={title} />
        <SkillGroups groups={skills} captions={captions} />
      </div>
    </section>
  );
}
