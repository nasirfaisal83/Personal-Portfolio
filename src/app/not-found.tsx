import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="shell not-found">
        <span className="eyebrow">404</span>
        <h1 className="section-head__title">Page not found</h1>
        <p className="not-found__text">That address does not exist on this site.</p>
        <Link href="/" className="pill pill--solid">
          Back to the home page
        </Link>
      </div>
    </section>
  );
}
