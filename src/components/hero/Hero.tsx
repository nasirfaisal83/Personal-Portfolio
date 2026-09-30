import Image from "next/image";
import { Name } from "./Name";
import { isPlaceholder, site } from "@/content/site";
import {
  ArrowUpRightIcon,
  DownloadIcon,
  GithubIcon,
  GraduationCapIcon,
  MapPinIcon,
} from "@/components/ui/icons";

/** Where each floating chip sits around the photo, in content order. */
const CHIP_PLACES = ["hero__chip--a float-a", "hero__chip--b float-b", "hero__chip--c float-b"];

/**
 * The tagline, with the part named by `taglineEmphasis` set in the ink colour.
 * Falls back to the plain sentence if the emphasis is not in it.
 */
function Tagline() {
  const { tagline, taglineEmphasis } = site;
  const at = tagline.indexOf(taglineEmphasis);
  if (at < 0 || isPlaceholder(taglineEmphasis)) return <>{tagline}</>;
  return (
    <>
      {tagline.slice(0, at)}
      <span className="hero__pitch-em">{taglineEmphasis}</span>
      {tagline.slice(at + taglineEmphasis.length)}
    </>
  );
}

/**
 * R1.1 — name, role line and the three primary actions are above the fold at
 * any width from 360px: on phones the text comes first and the photo follows.
 * Every string comes from content/site.ts.
 */
export function Hero({ resumeAvailable }: { resumeAvailable: boolean }) {
  const showTagline = !isPlaceholder(site.tagline);
  const showBadge = !isPlaceholder(site.badge);
  const chips = site.heroChips.filter((chip) => !isPlaceholder(chip));

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__grid-bg" aria-hidden="true" />
      <div className="shell hero__inner">
        <div className="hero__text rise">
          {showBadge ? (
            <p className="hero__badge">
              <span className="hero__badge-dot" aria-hidden="true" />
              {site.badge}
            </p>
          ) : null}
          <Name id="hero-heading" />
          {showTagline ? (
            <p className="hero__pitch">
              <Tagline />
            </p>
          ) : null}
          <ul className="hero__meta">
            <li className="hero__meta-item">
              <GraduationCapIcon className="icon hero__meta-icon" />
              <span>{site.roleLine}</span>
            </li>
            <li className="hero__meta-item">
              <MapPinIcon className="icon hero__meta-icon" />
              <span>
                {site.location} · {site.languages}
              </span>
            </li>
          </ul>
          <div className="hero__actions">
            <a className="pill pill--primary" href="#projects">
              See the projects
              <ArrowUpRightIcon />
            </a>
            <a
              className="pill pill--outline"
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
              GitHub
            </a>
            {resumeAvailable ? (
              <a className="pill pill--outline" href={site.resumeUrl} download>
                <DownloadIcon />
                Download resume
              </a>
            ) : null}
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__glow" aria-hidden="true" />
          <Image
            className="hero__photo rise-late"
            src="/images/faisal-front.webp"
            width={880}
            height={1333}
            alt="Portrait of Faisal Nasir"
            priority
          />
          {chips.length > 0 ? (
            <ul className="hero__chips">
              {chips.map((chip, i) => (
                <li key={chip} className={`hero__chip ${CHIP_PLACES[i] ?? ""}`}>
                  <span className="hero__chip-dot" aria-hidden="true" />
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
