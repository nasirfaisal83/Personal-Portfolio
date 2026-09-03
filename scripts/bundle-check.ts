/**
 * Bundle budget assertion (R13.3, R4.10).
 * First-load JavaScript must stay at or under 180 KB gzipped and each
 * lazily-loaded screen chunk at or under 60 KB gzipped.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, resolve } from "node:path";

const OUT = resolve(process.cwd(), "out");
const FIRST_LOAD_LIMIT = 180 * 1024;
const CHUNK_LIMIT = 60 * 1024;

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (full.endsWith(".js")) acc.push(full);
  }
  return acc;
}

function gzipBytes(file: string): number {
  return gzipSync(readFileSync(file)).byteLength;
}

function main(): void {
  if (!existsSync(OUT)) {
    console.error("bundle-check: out/ not found. Run `npm run build` first.");
    process.exit(1);
  }

  const html = readFileSync(join(OUT, "index.html"), "utf8");
  const referenced = new Set(
    [...html.matchAll(/\/_next\/static\/[^"']+?\.js/g)].map((m) => m[0].replace(/^\//, "")),
  );

  let firstLoad = 0;
  for (const rel of referenced) {
    const file = join(OUT, rel);
    if (existsSync(file)) firstLoad += gzipBytes(file);
  }

  const allChunks = walk(join(OUT, "_next", "static", "chunks"));
  const lazy = allChunks.filter(
    (f) => !referenced.has(f.slice(OUT.length + 1).replace(/\\/g, "/")),
  );

  const oversized = lazy
    .map((f) => ({ file: f.slice(OUT.length + 1), size: gzipBytes(f) }))
    .filter((c) => c.size > CHUNK_LIMIT);

  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`first-load JS (gzipped): ${kb(firstLoad)} / ${kb(FIRST_LOAD_LIMIT)}`);

  let failed = false;
  if (firstLoad > FIRST_LOAD_LIMIT) {
    console.error(
      `bundle-check error: first-load JS ${kb(firstLoad)} exceeds ${kb(FIRST_LOAD_LIMIT)}`,
    );
    failed = true;
  }
  for (const c of oversized) {
    console.error(
      `bundle-check error: ${c.file} is ${kb(c.size)}, over the ${kb(CHUNK_LIMIT)} chunk budget`,
    );
    failed = true;
  }

  if (failed) process.exit(1);
  console.log("bundle-check passed.");
}

main();
