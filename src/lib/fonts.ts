import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";

/**
 * The prototype's three faces: Space Grotesk for headings, DM Sans for text,
 * JetBrains Mono for labels and tags. Each is a variable font, so every weight
 * comes from one subsetted file, and `adjustFontFallback` (on by default)
 * keeps the swap from shifting layout (R13.4).
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const fontVariables = [spaceGrotesk.variable, dmSans.variable, jetbrainsMono.variable].join(
  " ",
);
