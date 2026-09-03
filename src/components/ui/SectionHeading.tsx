export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="t-h2" tabIndex={-1}>
      {children}
    </h2>
  );
}
