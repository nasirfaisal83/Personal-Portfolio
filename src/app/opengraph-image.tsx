import { ImageResponse } from "next/og";
import { heroAscii } from "@/components/hero/heroMap";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

/**
 * R14.2 — built once at export time: the name over a static render of the hero
 * map, in the map's own README state so the card carries the site's idea.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0F1B2D",
        color: "#E6EDF3",
        padding: 72,
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 76, letterSpacing: -2 }}>{site.name}</div>
        <div style={{ fontSize: 26, color: "#7A8BA0", marginTop: 16 }}>{site.roleLine}</div>
      </div>
      <div
        style={{
          display: "flex",
          whiteSpace: "pre",
          fontSize: 20,
          lineHeight: 1.35,
          color: "#35D0C8",
        }}
      >
        {heroAscii}
      </div>
    </div>,
    size,
  );
}
