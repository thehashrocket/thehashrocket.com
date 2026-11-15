import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Value: protects=no shipped code, root config or public file still names the old @thehashrocket.com mailbox (retired Nov 15),
//   so visitors and mail all go to jasonshultz.com (#104); fails_when=a literal address in any letter case is added
//   back under app/, lib/, components/ or public/, or the scan silently covers no files; why_new=#104 swapped the
//   address and a second literal had hidden in the send call; seam=none; no_claim=docs, or the Vercel env (checked
//   by contactFromAddress at send time)
const REPO = fileURLToPath(new URL("..", import.meta.url));
const ROOTS = ["app", "lib", "components", "public"].map((dir) => join(REPO, dir));
// Root-level code and config that ships with the site.
const ROOT_FILE = /^(next\.config|sentry\..+\.config|instrumentation(-client)?|proxy|middleware|vercel)\.(ts|js|mjs|json)$/;
const TEXT = /\.(tsx?|jsx?|mjs|css|json|mdx?|txt|xml|html|svg|webmanifest|ya?ml)$/;
const OLD_ADDRESS = /@thehashrocket\.com/i;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : TEXT.test(name) ? [path] : [];
  });
}

describe("old contact address", () => {
  it("appears nowhere in app/, lib/, components/ or public/", () => {
    const rootFiles = readdirSync(REPO).filter((name) => ROOT_FILE.test(name)).map((name) => join(REPO, name));
    const scanned = [...ROOTS.flatMap(files), ...rootFiles];
    // The address used to live in lib/site.ts; a scan that misses it proves nothing.
    expect(scanned).toContain(join(REPO, "lib", "site.ts"));
    expect(scanned.filter((path) => OLD_ADDRESS.test(readFileSync(path, "utf8")))).toEqual([]);
  });
});
