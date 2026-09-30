import Image from "next/image";
import { SectionHead } from "@/components/ui/SectionHead";
import { about, experience } from "@/content/experience";
import { isPlaceholder, site } from "@/content/site";

/**
 * R6 — only PRD §5.2 and §5.3 facts. R6.2 — while a period is TODO_DATES the
 * date line is omitted entirely rather than filled with a placeholder.
 *
 * Laid out after the Lovable prototype: the side photo stands on a solid arch
 * on the left, the copy and the experience cards on the right. On a phone the
 * copy comes first and the photo closes the band.
 */
export function About() {
  const { eyebrow, title } = site.sections.about;

  return (
    <section className="about" aria-labelledby="about">
      <div className="shell about__grid">
        <div className="about__portrait reveal">
          <div className="about__arch" aria-hidden="true" />
          <Image
            className="about__photo"
            src="/images/faisal-side.webp"
            alt="Faisal Nasir, arms crossed"
            width={800}
            height={1156}
            loading="lazy"
          />
        </div>
        <div className="about__body reveal">
          <SectionHead id="about" eyebrow={eyebrow} title={title} />
          <p className="about__lead">{about.study}</p>
          <p className="about__text">{about.community}</p>
          <p className="about__text">{about.learning}</p>
          <h3 id="experience" className="visually-hidden">
            Experience
          </h3>
          <ol className="about__exp" aria-labelledby="experience">
            {experience.map((entry) => (
              <li key={`${entry.role}-${entry.org}`} className="about__exp-card">
                <p className="about__exp-role">{entry.role}</p>
                <p className="about__exp-org">{entry.org}</p>
                <p className="about__exp-detail">{entry.detail}</p>
                {!isPlaceholder(entry.period) ? (
                  <p className="about__exp-period">{entry.period}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
