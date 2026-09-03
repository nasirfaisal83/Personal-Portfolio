import { Hero } from "@/components/hero/Hero";
import { Projects } from "@/components/sections/Projects";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Community } from "@/components/sections/Community";
import { Contact } from "@/components/sections/Contact";
import { resumeAvailable } from "@/lib/resume";

export default function HomePage() {
  return (
    <>
      <Hero resumeAvailable={resumeAvailable} />
      <Projects />
      <About />
      <Skills />
      <Community />
      <Contact resumeAvailable={resumeAvailable} />
    </>
  );
}
