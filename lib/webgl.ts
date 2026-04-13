let cached: boolean | null = null;

export function isWebGLSupported(): boolean {
  if (cached !== null) return cached;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cached = gl !== null;
  } catch {
    cached = false;
  }
  return cached;
}
