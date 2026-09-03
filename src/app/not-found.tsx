import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="shell stack-24">
        <h1 className="t-h2">Page not found</h1>
        <p className="t-body measure">That address does not exist on this site.</p>
        <p>
          <Link href="/">Back to the home page</Link>
        </p>
      </div>
    </section>
  );
}
