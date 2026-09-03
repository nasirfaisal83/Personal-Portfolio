import { SectionHeading } from "../ui/SectionHeading";
import { about, experience } from "@/content/experience";
import { isPlaceholder } from "@/content/site";

/**
 * R6 — only PRD §5.2 and §5.3 facts. R6.2 — while a period is TODO_DATES the
 * date column is omitted entirely rather than filled with a placeholder.
 */
export function About() {
  const showDates = experience.some((entry) => !isPlaceholder(entry.period));

  return (
    <section className="section" aria-labelledby="about">
      <div className="shell about__grid">
        <div className="stack-24">
          <SectionHeading id="about">About</SectionHeading>
          <div className="stack-16 measure">
            <p className="t-body">{about.study}</p>
            <p className="t-body">{about.community}</p>
            <p className="t-body">{about.learning}</p>
          </div>
        </div>
        <div className="stack-24">
          <h2 className="t-h2" id="experience">
            Experience
          </h2>
          <ol className="log">
            {experience.map((entry) => (
              <li key={`${entry.role}-${entry.org}`} className="log__entry">
                <span className="log__dot" aria-hidden="true" />
                <div className="stack-8">
                  <p className="t-emphasis">{entry.role}</p>
                  <p className="t-body">{entry.org}</p>
                  <p className="t-caption">{entry.detail}</p>
                  {showDates && !isPlaceholder(entry.period) ? (
                    <p className="t-caption log__period">{entry.period}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
