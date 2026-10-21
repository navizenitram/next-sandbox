import { describe, expect, it } from "vitest";
import { catalogueForType, componentsByCategory, prebuiltFor } from "./catalogue";
import { fixtureCatalogue } from "./catalogue.fixture";

const ids = (items: readonly { id: string }[]) => items.map((item) => item.id);

describe("componentsByCategory", () => {
  it("groups the components that fit a type by category, in category order", () => {
    const groups = componentsByCategory(fixtureCatalogue, "road");

    expect(groups.map((group) => group.category.id)).toEqual(["frame", "wheels"]);
    expect(ids(groups[0].components)).toEqual(["road-frame", "road-frame-sold-out"]);
    expect(ids(groups[1].components)).toEqual(["shared-wheels", "road-wheels"]);
  });

  it("leaves out categories with no component for the type", () => {
    const groups = componentsByCategory(fixtureCatalogue, "road");

    expect(groups.find((group) => group.category.id === "pedals")).toBeUndefined();
  });

  it("only includes components linked to the type", () => {
    const groups = componentsByCategory(fixtureCatalogue, "mtb");

    expect(groups.map((group) => ids(group.components))).toEqual([
      ["mtb-frame"],
      ["shared-wheels"],
      ["flat-pedals"],
    ]);
  });

  it("returns nothing for an unknown type", () => {
    expect(componentsByCategory(fixtureCatalogue, "unicycle")).toEqual([]);
  });
});

describe("prebuiltFor", () => {
  it("returns the pre-built bike of a type with its component ids", () => {
    expect(prebuiltFor(fixtureCatalogue, "mtb")).toEqual({
      bike: fixtureCatalogue.bikes[1],
      componentIds: ["mtb-frame", "shared-wheels", "flat-pedals"],
    });
  });

  it("returns undefined when the type has no pre-built bike", () => {
    expect(prebuiltFor(fixtureCatalogue, "unicycle")).toBeUndefined();
  });
});

describe("catalogueForType", () => {
  it("keeps only the type, its components, links and pre-built bike", () => {
    const slice = catalogueForType(fixtureCatalogue, "road");

    expect(ids(slice.bikeTypes)).toEqual(["road"]);
    expect(ids(slice.components)).toEqual(["road-frame", "road-frame-sold-out", "shared-wheels", "road-wheels"]);
    expect(slice.typeComponents.every((link) => link.bikeTypeId === "road")).toBe(true);
    expect(slice.typeComponents).toHaveLength(4);
    expect(ids(slice.bikes)).toEqual(["road-prebuilt"]);
    expect(slice.prebuiltComponents.map((link) => link.componentId)).toEqual(["road-frame", "shared-wheels"]);
  });

  it("keeps every category, so mandatory rules still apply", () => {
    expect(catalogueForType(fixtureCatalogue, "road").categories).toEqual(fixtureCatalogue.categories);
  });

  it("answers the same queries as the full catalogue for that type", () => {
    const slice = catalogueForType(fixtureCatalogue, "mtb");

    expect(componentsByCategory(slice, "mtb")).toEqual(componentsByCategory(fixtureCatalogue, "mtb"));
    expect(prebuiltFor(slice, "mtb")).toEqual(prebuiltFor(fixtureCatalogue, "mtb"));
  });
});
