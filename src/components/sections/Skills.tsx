import { SectionHeading } from "../ui/SectionHeading";
import { SkillGroups } from "./SkillGroups";
import { skills } from "@/content/skills";
import { captionForSkill, captionText } from "@/lib/skillsIndex";

/**
 * R7 — the groups and items from PRD §5.5 and nothing else: no bars, no
 * percentages, no years, no stars. Each item's caption names the projects that
 * use it, computed from `projects[].stack` here on the server, so the project
 * list (hidden projects included) never ships to the browser.
 */
export function Skills() {
  const captions = Object.fromEntries(
    skills.map((group) => [
      group.group,
      Object.fromEntries(
        group.items.map((item) => [item, captionText(captionForSkill(group, item))]),
      ),
    ]),
  );

  return (
    <section className="section" aria-labelledby="skills">
      <div className="shell stack-40">
        <SectionHeading id="skills">Skills</SectionHeading>
        <SkillGroups groups={skills} captions={captions} />
      </div>
    </section>
  );
}
