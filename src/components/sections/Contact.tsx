import { SectionHeading } from "../ui/SectionHeading";
import { CopyButton } from "../ui/CopyButton";
import { site } from "@/content/site";

/** R9 — mailto, copy-with-confirmation, and the two profile links. */
export function Contact({ resumeAvailable }: { resumeAvailable: boolean }) {
  return (
    <section className="section" aria-labelledby="contact">
      <div className="shell stack-24">
        <SectionHeading id="contact">Contact</SectionHeading>
        <a className="contact__email" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <div className="btn-row">
          <CopyButton value={site.email} label="Copy email" />
          <a className="btn" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a className="btn" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          {resumeAvailable ? (
            <a className="btn" href={site.resumeUrl} download>
              Download resume
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
