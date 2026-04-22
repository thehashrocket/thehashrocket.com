import { readFile } from "fs/promises";
import { join } from "path";

let cachePromise: Promise<{ spaceGrotesk: Buffer; inter: Buffer }> | null = null;

export function loadOgFonts(): Promise<{ spaceGrotesk: Buffer; inter: Buffer }> {
  if (cachePromise) return cachePromise;
  const fontsDir = join(process.cwd(), "public", "fonts");
  cachePromise = Promise.all([
    readFile(join(fontsDir, "SpaceGrotesk-Bold.ttf")),
    readFile(join(fontsDir, "Inter-Regular.ttf")),
  ])
    .then(([spaceGrotesk, inter]) => ({ spaceGrotesk, inter }))
    .catch((err) => {
      cachePromise = null;
      throw err;
    });
  return cachePromise;
}
