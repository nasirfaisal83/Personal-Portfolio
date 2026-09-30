import { Fragment } from "react";
import { isPlaceholder, site } from "@/content/site";

/**
 * R1.2–R1.4 — the name is real DOM text, in Latin plus the Arabic and Hebrew
 * spellings when those exist. While either is a placeholder its span is not
 * rendered at all, so the page never shows a TODO token.
 *
 * Each word of the name sits on its own line. The words are separated by a real
 * space, so the heading's accessible name is exactly `site.name`; the teal full
 * stop after it is decoration and hidden from assistive technology.
 */
export function Name({ id }: { id?: string }) {
  const showArabic = !isPlaceholder(site.nameArabic);
  const showHebrew = !isPlaceholder(site.nameHebrew);
  const words = site.name.split(" ");
  const last = words.length - 1;

  return (
    <>
      <h1 id={id} className="hero__name">
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span className="hero__name-line">
              {word}
              {i === last ? (
                <span className="hero__name-dot" aria-hidden="true">
                  .
                </span>
              ) : null}
            </span>
          </Fragment>
        ))}
      </h1>
      {showArabic || showHebrew ? (
        <p className="hero__names">
          {showArabic ? (
            <span lang="ar" dir="rtl" className="hero__name-alt">
              {site.nameArabic}
            </span>
          ) : null}
          {showHebrew ? (
            <span lang="he" dir="rtl" className="hero__name-alt">
              {site.nameHebrew}
            </span>
          ) : null}
        </p>
      ) : null}
    </>
  );
}
