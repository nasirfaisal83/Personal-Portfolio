import { site } from "@/content/site";

/**
 * design §5.8 — one line, no "made with". The copyright year follows the
 * Lovable prototype; it is the year the site was built, fixed in the static
 * export.
 */
const builtIn = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <p>
          © {builtIn} {site.name}
        </p>
      </div>
    </footer>
  );
}
