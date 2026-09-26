"use client";

import { useState } from "react";
import type { SkillGroup } from "@/content/skills";

/**
 * The interactive half of the Skills section. Hovering, focusing or tapping an
 * item dims the rest and shows its caption, which the server worked out.
 */
export function SkillGroups({
  groups,
  captions,
}: {
  groups: readonly SkillGroup[];
  /** Caption text per group, then per item. */
  captions: Record<string, Record<string, string>>;
}) {
  const [active, setActive] = useState<{ group: string; item: string } | null>(null);

  return (
    <div className="skills">
      {groups.map((group) => {
        const activeHere = active?.group === group.group;
        const caption = activeHere && active ? captions[group.group]?.[active.item] : null;

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
                    onClick={() => setActive({ group: group.group, item })}
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
              {caption ?? " "}
            </p>
          </div>
        );
      })}
    </div>
  );
}
