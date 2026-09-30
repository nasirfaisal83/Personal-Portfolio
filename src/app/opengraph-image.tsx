import { ImageResponse } from "next/og";
import { isPlaceholder, site } from "@/content/site";
import { siteUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

/*
 * Satori takes plain colours only, so the prototype's oklch tokens
 * (src/styles/tokens.css) are converted to sRGB here by hand.
 */
const INK = "#0d1528"; // --surface-ink   oklch(0.2 0.04 265)
const ON_INK = "#f3f5f8"; // --on-ink      oklch(0.97 0.005 250)
const GLOW = "#43d5dc"; // --primary-glow  oklch(0.8 0.12 200)
const onInk = (alpha: number) => `rgba(243, 245, 248, ${alpha})`;
const glow = (alpha: number) => `rgba(67, 213, 220, ${alpha})`;
const primary = (alpha: number) => `rgba(0, 117, 144, ${alpha})`; // --primary oklch(0.52 0.1 220)
const ink = (alpha: number) => `rgba(13, 21, 40, ${alpha})`;

/** The tagline as words, with the emphasised phrase marked, so it can wrap in a flex row. */
function taglineWords(): { word: string; strong: boolean }[] {
  const { tagline, taglineEmphasis } = site;
  const at = tagline.indexOf(taglineEmphasis);
  const parts =
    at < 0
      ? [{ text: tagline, strong: false }]
      : [
          { text: tagline.slice(0, at), strong: false },
          { text: taglineEmphasis, strong: true },
          { text: tagline.slice(at + taglineEmphasis.length), strong: false },
        ];
  return parts.flatMap(({ text, strong }) =>
    text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, strong })),
  );
}

/**
 * R14.2 — built once at export time, in the prototype's look: the dark ink
 * card with a teal glow, the name with its teal full stop, the tagline and
 * the role line, and the nav's `faisal.nasir` wordmark beside the site's host.
 */
export default function OpengraphImage() {
  const [first, ...rest] = site.name.toLowerCase().split(" ");
  const host = new URL(siteUrl).host;
  const words = isPlaceholder(site.tagline) ? [] : taglineWords();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: INK,
          color: ON_INK,
          overflow: "hidden",
        }}
      >
        {/* The prototype's bg-grid, faded towards the edges. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundImage: `linear-gradient(to right, ${onInk(0.08)} 1px, transparent 1px), linear-gradient(to bottom, ${onInk(0.08)} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
        {/* bg-grid's mask (black 30% → transparent 75%), painted as an ink vignette. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundImage: `radial-gradient(ellipse at 70% 40%, ${ink(0)} 30%, ${ink(1)} 75%)`,
          }}
        />
        {/* The hero glow, off the right edge. */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: -260,
            width: 820,
            height: 820,
            display: "flex",
            backgroundImage: `radial-gradient(circle closest-side at 50% 45%, ${glow(0.6)} 0%, ${primary(0.35)} 50%, ${primary(0)} 100%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex", letterSpacing: -0.5 }}>
            <span>{first}</span>
            {rest.length > 0 && <span style={{ color: GLOW }}>.</span>}
            {rest.length > 0 && <span>{rest.join("")}</span>}
          </div>
          {!isPlaceholder(site.badge) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 22px",
                borderRadius: 9999,
                border: `1px solid ${onInk(0.2)}`,
                background: onInk(0.04),
                fontSize: 22,
                color: onInk(0.85),
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  marginRight: 12,
                  borderRadius: 9999,
                  background: GLOW,
                }}
              />
              {site.badge}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 128, lineHeight: 1, letterSpacing: -5 }}>
            <span>{site.name}</span>
            <span style={{ color: GLOW }}>.</span>
          </div>
          {words.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: 900,
                marginTop: 32,
                fontSize: 34,
                lineHeight: 1.35,
                color: onInk(0.7),
              }}
            >
              {words.map(({ word, strong }, i) => (
                <span key={i} style={{ marginRight: 10, color: strong ? ON_INK : undefined }}>
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            fontSize: 22,
          }}
        >
          <span style={{ maxWidth: 860, color: onInk(0.6) }}>{site.roleLine}</span>
          <span style={{ color: GLOW, letterSpacing: 1 }}>{host}</span>
        </div>
      </div>
    ),
    size,
  );
}
