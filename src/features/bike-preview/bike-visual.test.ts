import { describe, expect, it } from "vitest";
import type { Catalogue } from "@/domain/catalogue/catalogue";
import { fixtureCatalogue } from "@/domain/catalogue/catalogue.fixture";
import { toBikeVisual } from "./bike-visual";

const catalogue: Catalogue = {
  ...fixtureCatalogue,
  categories: [...fixtureCatalogue.categories, { id: "bell", name: { es: "Timbre", en: "Bell" }, mandatory: false }],
  components: [
    ...fixtureCatalogue.components.map((component) =>
      component.id === "mtb-frame" ? { ...component, visual: { colour: "#15803d", variant: "mtb" } } : component,
    ),
    { ...fixtureCatalogue.components[0], id: "brass-bell", categoryId: "bell", visual: { colour: "#ca8a04", variant: "ding" } },
  ],
};

describe("toBikeVisual", () => {
  it("lists the selected components back to front, whatever the selection order", () => {
    const visual = toBikeVisual(
      { bikeTypeId: "mtb", selections: { pedals: "flat-pedals", frame: "mtb-frame", wheels: "shared-wheels" } },
      catalogue,
    );

    expect(visual.layers.map((layer) => layer.categoryId)).toEqual(["wheels", "frame", "pedals"]);
  });

  it("carries each component's colour and variant", () => {
    const visual = toBikeVisual({ bikeTypeId: "mtb", selections: { frame: "mtb-frame" } }, catalogue);

    expect(visual.layers).toEqual([
      { categoryId: "frame", componentId: "mtb-frame", colour: "#15803d", variant: "mtb" },
    ]);
  });

  it("takes the geometry from the frame variant", () => {
    expect(toBikeVisual({ bikeTypeId: "road", selections: { frame: "mtb-frame" } }, catalogue).geometry).toBe("mtb");
  });

  it("falls back to the bike type for the geometry when there is no frame", () => {
    expect(toBikeVisual({ bikeTypeId: "road", selections: {} }, catalogue).geometry).toBe("road");
  });

  it("draws categories without a known slot last, in catalogue order", () => {
    const visual = toBikeVisual(
      { bikeTypeId: "mtb", selections: { bell: "brass-bell", frame: "mtb-frame" } },
      catalogue,
    );

    expect(visual.layers.map((layer) => layer.categoryId)).toEqual(["frame", "bell"]);
  });

  it("skips components that are not in the catalogue", () => {
    expect(toBikeVisual({ bikeTypeId: "mtb", selections: { frame: "nope" } }, catalogue).layers).toEqual([]);
  });
});
