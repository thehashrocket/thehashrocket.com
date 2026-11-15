/**
 * @vitest-environment jsdom
 */
// Value: protects=HeroScene's frame loop fades its dots to 0 while page text in <main> covers them and back to 0.5
//   once it moves away, gradually with motion and at once under reduced motion, without rotating (#109);
//   fails_when=the reduced-motion early return comes back or its rotation guard goes, the fade loop is dropped,
//   dot refs are lost, or text is never re-measured after it moves; why_new=scene-text-avoid.test.ts covers the helpers only, not the wiring;
//   seam=none (real R3F reconciler and three.js objects; the WebGL renderer is a stub with no-op methods);
//   no_claim=what the dots look like in a real WebGL canvas, or the projection of a real camera at real sizes
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, advance, createRoot, extend, type ReconcilerRoot, type RootState } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshBasicMaterial } from "three";

// <Canvas> registers the THREE namespace itself; a bare createRoot does not.
extend(THREE as never);
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SIZE = { width: 1440, height: 900, top: 0, left: 0 };

function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

/** Puts one <main> heading on the page, covering the whole viewport or parked far below it. */
function setText(coversViewport: boolean) {
  document.body.innerHTML = `<main><h1 id="t">Hello</h1></main>`;
  const r = coversViewport
    ? { left: 0, top: 0, width: SIZE.width, height: SIZE.height }
    : { left: 0, top: 5000, width: SIZE.width, height: 40 };
  document.getElementById("t")!.getBoundingClientRect = () =>
    ({ ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top, toJSON: () => r }) as DOMRect;
}

const fakeRenderer = {
  render: vi.fn(),
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  dispose: vi.fn(),
  domElement: document.createElement("canvas"),
};

let root: ReconcilerRoot<HTMLCanvasElement> | null = null;
let state: RootState;
let clock = 0;

async function mountHero() {
  const { HeroScene } = await import("@/components/scenes/HeroScene");
  const canvas = document.createElement("canvas");
  root = createRoot(canvas);
  await act(async () => {
    await root!.configure({ gl: fakeRenderer as never, frameloop: "never", size: SIZE, dpr: 1 });
    root!.render(<HeroScene progress={0} active />);
  });
  const { _roots } = await import("@react-three/fiber");
  state = _roots.get(canvas)!.store.getState();
  clock = 0;
}

function frame(seconds: number) {
  clock += seconds;
  advance(clock, true, state);
}

function dotOpacities(): number[] {
  const out: number[] = [];
  state.scene.traverse((obj) => {
    const mesh = obj as Mesh;
    const mat = mesh.material as MeshBasicMaterial | undefined;
    // The dots are the only MeshBasicMaterial meshes; the icosahedron uses a standard material.
    if ((mesh as { isMesh?: boolean }).isMesh && mat?.type === "MeshBasicMaterial") out.push(mat.opacity);
  });
  return out;
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  document.body.innerHTML = "";
});

describe("HeroScene dot fade over page text", () => {
  it("under reduced motion, hides every dot at once over text and restores them once the text moves", async () => {
    setReducedMotion(true);
    setText(true);
    await mountHero();
    // Let the reduced-motion effect land before the first measured frame.
    await act(async () => {});
    const before = dotOpacities();
    expect(before.length).toBe(60);

    frame(0.25);
    expect(new Set(dotOpacities())).toEqual(new Set([0]));
    // Reduced motion still holds the scene still: the fade runs, the rotation does not.
    const icosahedron = state.scene.getObjectByProperty("type", "Mesh")!;
    expect(icosahedron.rotation.y).toBe(0);

    setText(false);
    frame(0.25); // past the 0.2 s re-measure interval
    expect(new Set(dotOpacities())).toEqual(new Set([0.5]));
  });

  it("with motion, fades gradually rather than jumping", async () => {
    setReducedMotion(false);
    setText(true);
    await mountHero();
    await act(async () => {});

    frame(0.05); // 0.05 s at 2 opacity/s is a 0.1 step
    for (const o of dotOpacities()) expect(o).toBeCloseTo(0.4);
    frame(0.5);
    expect(new Set(dotOpacities())).toEqual(new Set([0]));
  });
});
