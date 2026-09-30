/**
 * A section's mono eyebrow and display title. The title carries the section's
 * id, which the nav, the skip link and the scrollspy target; tabIndex -1 lets
 * those links move focus to it.
 */
export function SectionHead({
  id,
  eyebrow,
  title,
  className,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} tabIndex={-1} className="section-head__title">
        {title}
      </h2>
    </div>
  );
}
