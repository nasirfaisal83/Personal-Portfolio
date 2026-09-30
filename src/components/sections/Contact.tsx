import { SectionHead } from "@/components/ui/SectionHead";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadIcon, GithubIcon, LinkedinIcon, MailIcon } from "@/components/ui/icons";
import { site } from "@/content/site";

/**
 * R9 — mailto, copy-with-confirmation, and the two profile links, set on the
 * prototype's dark closing card. The resume link appears only while
 * public/resume.pdf exists (R9.3).
 */
export function Contact({ resumeAvailable }: { resumeAvailable: boolean }) {
  return (
    <section className="contact" aria-labelledby="contact">
      <div className="contact__card reveal">
        <SectionHead
          id="contact"
          className="contact__head"
          eyebrow={site.contact.eyebrow}
          title={
            <>
              {site.contact.headline}{" "}
              <span className="contact__accent">{site.contact.headlineAccent}</span>
            </>
          }
        />
        <div className="contact__actions">
          <a className="pill contact__mail" href={`mailto:${site.email}`}>
            <MailIcon />
            {site.email}
          </a>
          <CopyButton value={site.email} label="Copy email" className="pill contact__ghost" />
          <a
            className="pill contact__ghost contact__icon-link"
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
          <a
            className="pill contact__ghost contact__icon-link"
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedinIcon />
          </a>
          {resumeAvailable ? (
            <a className="pill contact__ghost" href={site.resumeUrl} download>
              <DownloadIcon />
              Download resume
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
