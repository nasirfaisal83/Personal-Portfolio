import { Hero } from "@/components/hero/Hero";
import { Projects } from "@/components/sections/Projects";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";
import { resumeAvailable } from "@/lib/resume";

/**
 * The single page, in the prototype's order. The Hasoub community role is an
 * entry in About's experience list, so it no longer has a section of its own.
 */
export default function HomePage() {
  return (
    <>
      <Hero resumeAvailable={resumeAvailable} />
      <Projects />
      <About />
      <Skills />
      <Contact resumeAvailable={resumeAvailable} />
    </>
  );
}
