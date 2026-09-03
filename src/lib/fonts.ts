import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { site, isPlaceholder } from "@/content/site";

/**
 * R13.3 — four subsetted files on first load: Plex Mono Regular + Italic,
 * Plex Sans Regular + Medium. `adjustFontFallback` (on by default) supplies the
 * size-adjusted fallback that keeps font swap from shifting layout (R13.4).
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-sans",
});

/**
 * Plex Sans Arabic and Hebrew are only worth loading once the name has real
 * glyphs to set (task 0.4). While the spellings are placeholders the spans are
 * not rendered at all, so the faces stay unrequested.
 */
export const trilingualNameEnabled =
  !isPlaceholder(site.nameArabic) || !isPlaceholder(site.nameHebrew);

export const fontVariables = [plexMono.variable, plexSans.variable].join(" ");
