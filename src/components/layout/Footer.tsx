import { site } from "@/content/site";

/** design §5.8 — one line. No year, no "made with". */
export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <p className="t-caption">{site.name}</p>
      </div>
    </footer>
  );
}
