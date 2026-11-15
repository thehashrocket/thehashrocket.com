/**
 * Dims the 3D background for the whole page it renders on. A server-rendered
 * marker plus one CSS rule (`body:has([data-dim-canvas])` in app/globals.css),
 * so the canvas mounts already dim, and no other page's store cleanup can undo
 * it during client navigation. Browsers without `:has()` show the scene at full
 * strength; the page still works.
 *
 * DimCanvasBelow is the scroll-driven version for pages whose hero shows the scene.
 */
export function DimCanvas() {
  return <span data-dim-canvas hidden />;
}
