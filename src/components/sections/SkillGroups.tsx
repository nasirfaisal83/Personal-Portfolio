"use client";

import { useState, type FocusEvent } from "react";
import type { SkillGroup } from "@/content/skills";

type Active = { group: string; item: string } | null;

/**
 * The interactive half of the Skills section. An item with a caption (the
 * projects on the site that use it, worked out on the server) is a button:
 * hovering, focusing or tapping it highlights it, dims the rest of its group
 * and shows the caption. An item without one is a plain tag, so no one tabs
 * through buttons that do nothing; pointing at it clears the highlight, so the
 * caption on show never seems to belong to it.
 *
 * Each tile's class never changes after the first render: RevealObserver adds
 * `is-in` to it directly, and a React-managed className would wipe that out.
 * The highlight state lives on the list and the items instead.
 */
export function SkillGroups({
  groups,
  captions,
}: {
  groups: readonly SkillGroup[];
  /** Caption text per group, then per item. Labelled groups have none. */
  captions: Record<string, Record<string, string>>;
}) {
  const [active, setActive] = useState<Active>(null);
  const cards = groups.filter((group) => group.label !== "Language");

  return (
    <div className="skills">
      {groups.map((group) => {
        if (group.label === "Language") {
          return (
            <div key={group.group} className="skills__tile skills__tile--solid reveal">
              <h3 className="skills__name">{group.group}</h3>
              {/* The dot stays with the word before it when the line wraps. */}
              <p className="skills__spoken">{group.items.join("\u00a0· ")}</p>
            </div>
          );
        }

        // The prototype rings its third card.
        const ringed = cards.indexOf(group) === 2;
        const groupCaptions = captions[group.group] ?? {};
        const activeHere = active?.group === group.group ? active.item : null;
        const caption = activeHere !== null ? (groupCaptions[activeHere] ?? "") : "";
        // Every caption this group can show, stacked unseen in the caption's own
        // cell: the line is always as tall as the longest one, so showing a
        // caption never moves the page.
        const sizers = [...new Set(Object.values(groupCaptions))].filter(Boolean);

        const clearOnFocusOut = (event: FocusEvent<HTMLUListElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null);
        };

        return (
          <div
            key={group.group}
            className={ringed ? "skills__tile skills__tile--ringed reveal" : "skills__tile reveal"}
          >
            <h3 className="skills__name">{group.group}</h3>
            <ul
              className="tag-list skills__list"
              data-dimmed={activeHere !== null ? "true" : "false"}
              onMouseLeave={() => setActive(null)}
              onBlur={clearOnFocusOut}
            >
              {group.items.map((item) => {
                if (!groupCaptions[item]) {
                  return (
                    <li key={item}>
                      <span className="tag skills__item" onMouseEnter={() => setActive(null)}>
                        {item}
                      </span>
                    </li>
                  );
                }
                const show = () => setActive({ group: group.group, item });
                return (
                  <li key={item}>
                    <button
                      type="button"
                      className="tag skills__item"
                      data-active={activeHere === item ? "true" : "false"}
                      onClick={show}
                      onMouseEnter={show}
                      onFocus={show}
                    >
                      {item}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="skills__caption">
              {sizers.map((text) => (
                <span key={text} className="skills__sizer" aria-hidden="true">
                  {text}
                </span>
              ))}
              <p className="skills__live" aria-live="polite">
                {caption}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
