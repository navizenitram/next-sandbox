import type { Catalogue } from "@/domain/catalogue/catalogue";
import type { Configuration } from "@/domain/configuration/configuration";

export type Layer = Readonly<{ categoryId: string; componentId: string; colour: string; variant: string }>;

/** What to draw: the frame geometry and the component layers, back to front. */
export type BikeVisual = Readonly<{ geometry: string; layers: readonly Layer[] }>;

/** Back-to-front draw order. Categories not listed are drawn last, in catalogue order. */
const drawOrder = ["mudguards", "tyres", "wheels", "brakes", "drivetrain", "fork", "frame", "saddle", "handlebar", "pedals"];

export function toBikeVisual(configuration: Configuration, catalogue: Catalogue): BikeVisual {
  const rank = (categoryId: string) => {
    const slot = drawOrder.indexOf(categoryId);
    const categoryIndex = catalogue.categories.findIndex((category) => category.id === categoryId);
    return slot >= 0 ? slot : drawOrder.length + categoryIndex;
  };

  const layers = Object.entries(configuration.selections)
    .flatMap(([categoryId, componentId]) => {
      const component = catalogue.components.find((candidate) => candidate.id === componentId);
      return component ? [{ categoryId, componentId, ...component.visual }] : [];
    })
    .sort((a, b) => rank(a.categoryId) - rank(b.categoryId));

  const frame = layers.find((layer) => layer.categoryId === "frame");
  return { geometry: frame?.variant ?? configuration.bikeTypeId, layers };
}
