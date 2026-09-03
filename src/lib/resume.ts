import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * R9.3 — while public/resume.pdf is absent every "Download resume" control is
 * hidden. Resolved once at build time so the static export never links a 404.
 */
export const resumeAvailable = existsSync(join(process.cwd(), "public", "resume.pdf"));
