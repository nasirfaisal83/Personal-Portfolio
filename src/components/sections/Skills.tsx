"use client";

import { useState } from "react";
import { SectionHeading } from "../ui/SectionHeading";
import { skills } from "@/content/skills";
import { captionForSkill, captionText } from "@/lib/skillsIndex";

/**
 * R7 — the groups and items from PRD §5.5 and nothing else: no bars, no
 * percentages, no years, no stars. Hovering or focusing an item dims the rest
 * and names the projects that use it, computed from `projects[].stack`.
 */
export function Skills() {
  const [active, setActive] = useState<{ group: string; item: string } | null>(null);

  return (
    <section className="section" aria-labelledby="skills">
      <div className="shell stack-40">
        <SectionHeading id="skills">Skills</SectionHeading>
        <div className="skills">
          {skills.map((group) => {
            const activeHere = active?.group === group.group;
            const caption =
              activeHere && active ? captionText(captionForSkill(group, active.item)) : null;

            return (
              <div key={group.group} className="skills__group stack-8">
                <h3 className="t-emphasis">{group.group}</h3>
                <ul className="skills__list" data-dimmed={active !== null ? "true" : "false"}>
                  {group.items.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className="skills__item"
                        data-active={
                          active?.group === group.group && active.item === item ? "true" : "false"
                        }
                        onMouseEnter={() => setActive({ group: group.group, item })}
                        onMouseLeave={() => setActive(null)}
                        onFocus={() => setActive({ group: group.group, item })}
                        onBlur={() => setActive(null)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="t-caption skills__caption" aria-live="polite">
                  {caption ?? " "}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
