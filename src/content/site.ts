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
  /**
   * The site description, in two parts: `describeSite` in lib/metadata.ts
   * lists only the projects on the site, in this order. With all five visible
   * it reads as the PRD sentence word for word.
   */
  descriptionLead:
    "CS student at Ben-Gurion University of the Negev, teaching assistant, and Hasoub on-campus community manager.",
  descriptionPhrases: [
    ["rag-document-qa", "RAG document Q&A"],
    ["order-saga", "a choreography saga"],
    ["tech-news-agent", "a multi-agent news pipeline"],
    ["emergency-alert-system", "a STOMP alert system"],
    ["con-detection", "YOLOv5 cone detection"],
  ],
  /** Private client projects, described in their own sentence after the public list. */
  descriptionPrivatePhrases: [
    ["salon", "a salon appointment system, built solo for a real client and running in production"],
  ],
} as const;

/** A content value is a placeholder while it still carries a TODO_ token (R1.4, R1.5, R6.2). */
export function isPlaceholder(value: string | undefined | null): boolean {
  return typeof value === "string" && value.startsWith("TODO_");
}
