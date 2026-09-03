import { SectionHeading } from "../ui/SectionHeading";
import { community } from "@/content/experience";

/** R8 — the role and its three stated activities. Nothing else. */
export function Community() {
  return (
    <section className="section" aria-labelledby="community">
      <div className="shell stack-24">
        <SectionHeading id="community">Community</SectionHeading>
        <div className="stack-8 measure">
          <p className="t-emphasis">{community.role}</p>
          <p className="t-body">{community.body}</p>
        </div>
      </div>
    </section>
  );
}
