/**
 * Content integrity gate (R15.2, R15.3, R9.3). Runs from `prebuild`.
 *
 * - Fails when any TODO_ token survives in src/content during a production build.
 * - Fails when the project slug set is not exactly the five in requirements §2.
 * - Warns when public/resume.pdf is missing (the UI then hides every resume control).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const CONTENT_DIR = join(ROOT, "src", "content");
const RESUME = join(ROOT, "public", "resume.pdf");

export const EXPECTED_SLUGS = [
  "rag-document-qa",
  "order-saga",
  "tech-news-agent",
  "emergency-alert-system",
  "con-detection",
] as const;

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

const TODO_TOKEN = /TODO_[A-Z0-9_]+/g;

export function findPlaceholders(files: { file: string; text: string }[]): string[] {
  const found: string[] = [];
  for (const { file, text } of files) {
    text.split("\n").forEach((line, i) => {
      for (const match of line.matchAll(TODO_TOKEN)) {
        // The literal token names in the regex and in helper docs are not content.
        if (match[0] === "TODO_") continue;
        found.push(`${file}:${i + 1} ${match[0]}`);
      }
    });
  }
  return found;
}

export function checkSlugs(slugs: readonly string[]): string[] {
  const expected = [...EXPECTED_SLUGS].sort();
  const actual = [...slugs].sort();
  if (expected.length !== actual.length || expected.some((s, i) => s !== actual[i])) {
    return [`Project slugs must be exactly ${expected.join(", ")} — found ${actual.join(", ")}`];
  }
  return [];
}

function readContentFiles(): { file: string; text: string }[] {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => ({
      file: join("src/content", f),
      text: readFileSync(join(CONTENT_DIR, f), "utf8"),
    }));
}

async function run(): Promise<CheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  const files = readContentFiles();

  const placeholders = findPlaceholders(files);
  if (placeholders.length > 0) {
    const lines = placeholders.map((p) => `  ${p}`).join("\n");
    if (isProduction) {
      errors.push(`Unresolved placeholders in src/content:\n${lines}`);
    } else {
      warnings.push(`Unresolved placeholders (blocked in production builds):\n${lines}`);
    }
  }

  const { projectSlugs } = (await import(join(CONTENT_DIR, "projects.ts"))) as {
    projectSlugs: string[];
  };
  errors.push(...checkSlugs(projectSlugs));

  if (!existsSync(RESUME)) {
    warnings.push("public/resume.pdf is missing — every “Download resume” control will be hidden.");
  }

  return { errors, warnings };
}

const isEntry = (process.argv[1] ?? "").includes("content-check");

if (isEntry) {
  run()
    .then(({ errors, warnings }) => {
      for (const w of warnings) console.warn(`content-check warning: ${w}`);
      if (errors.length > 0) {
        for (const e of errors) console.error(`content-check error: ${e}`);
        process.exit(1);
      }
      console.log("content-check passed.");
    })
    .catch((err) => {
      console.error("content-check failed to run:", err);
      process.exit(1);
    });
}
