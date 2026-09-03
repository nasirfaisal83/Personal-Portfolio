// Every factual string on the site lives in src/content (R15.1).
// Facts are quoted from PRD v2 §5.1; nothing here may be invented.

export const site = {
  name: "Faisal Nasir",
  nameArabic: "TODO_NAME_AR",
  nameHebrew: "TODO_NAME_HE",
  roleLine: "CS student at Ben-Gurion University of the Negev (expected graduation 2028)",
  location: "Based in Israel",
  languages: "Arabic, Hebrew, English",
  tagline: "TODO_TAGLINE",
  email: "nasirfaisal83@gmail.com",
  github: "https://github.com/nasirfaisal83",
  linkedin: "https://www.linkedin.com/in/faisal-nasir-381a33131",
  resumeUrl: "/resume.pdf",
  description:
    "CS student at Ben-Gurion University of the Negev, teaching assistant, and Hasoub on-campus community manager. Five public projects: RAG document Q&A, a choreography saga, a multi-agent news pipeline, a STOMP alert system, and YOLOv5 cone detection.",
} as const;

/** A content value is a placeholder while it still carries a TODO_ token (R1.4, R1.5, R6.2). */
export function isPlaceholder(value: string | undefined | null): boolean {
  return typeof value === "string" && value.startsWith("TODO_");
}
