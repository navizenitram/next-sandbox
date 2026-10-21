import type { BikeVisual } from "./bike-visual";
import { geometryFor } from "./geometry";
import { layerRenderers } from "./layers";

/** The configured bike as stacked SVG layers, one per component category. */
export function BikePreview({ visual, label }: { visual: BikeVisual; label: string }) {
  const g = geometryFor(visual.geometry);
  return (
    <svg viewBox="0 60 600 330" role="img" aria-label={label} className="h-auto w-full">
      {visual.layers.map((layer) => {
        const Render = layerRenderers[layer.categoryId];
        return Render ? <Render key={layer.categoryId} layer={layer} g={g} /> : null;
      })}
    </svg>
  );
}
