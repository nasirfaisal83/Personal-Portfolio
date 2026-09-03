import { isPlaceholder, site } from "@/content/site";

/**
 * R1.2–R1.4 — the name is real DOM text, in Latin plus the Arabic and Hebrew
 * spellings when those exist. While either is a placeholder its span is not
 * rendered at all, so the page never shows a TODO token.
 */
export function Name() {
  const showArabic = !isPlaceholder(site.nameArabic);
  const showHebrew = !isPlaceholder(site.nameHebrew);

  return (
    <div>
      <h1 className="t-name">{site.name}</h1>
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
    </div>
  );
}
