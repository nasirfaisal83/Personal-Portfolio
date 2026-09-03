import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { fontVariables } from "@/lib/fonts";
import { buildMetadata, personJsonLd } from "@/lib/metadata";
import "@/styles/globals.css";

export const metadata: Metadata = buildMetadata();

export const viewport: Viewport = {
  themeColor: "#ECEFF3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {/* Reveals the JS-only screen controls without waiting for hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.body.classList.add("has-js")`,
          }}
        />
        <SkipLink />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
