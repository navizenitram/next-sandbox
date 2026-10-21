import { describe, expect, it } from "vitest";
import type { LocalizedText } from "@/domain/catalogue/catalogue";
import { fromPrebuilt, validate } from "@/domain/configuration/configuration";
import { staticCatalogueRepository } from "./static-catalogue";

const catalogue = await staticCatalogueRepository.getCatalogue();

const duplicates = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);

describe("static catalogue", () => {
  it("has 4 bike types, 10 categories and one pre-built bike per type", () => {
    expect(catalogue.bikeTypes.map((type) => type.id)).toEqual(["road", "mtb", "gravel", "city"]);
    expect(catalogue.categories).toHaveLength(10);
    for (const type of catalogue.bikeTypes) {
      expect(catalogue.bikes.filter((bike) => bike.bikeTypeId === type.id)).toHaveLength(1);
    }
  });

  it("has unique ids", () => {
    expect(duplicates(catalogue.bikeTypes.map((type) => type.id))).toEqual([]);
    expect(duplicates(catalogue.categories.map((category) => category.id))).toEqual([]);
    expect(duplicates(catalogue.components.map((component) => component.id))).toEqual([]);
    expect(duplicates(catalogue.bikes.map((bike) => bike.id))).toEqual([]);
  });

  it("only references things that exist", () => {
    const typeIds = new Set(catalogue.bikeTypes.map((type) => type.id));
    const categoryIds = new Set(catalogue.categories.map((category) => category.id));
    const componentIds = new Set(catalogue.components.map((component) => component.id));
    const bikeIds = new Set(catalogue.bikes.map((bike) => bike.id));

    for (const component of catalogue.components) expect(categoryIds).toContain(component.categoryId);
    for (const link of catalogue.typeComponents) {
      expect(typeIds).toContain(link.bikeTypeId);
      expect(componentIds).toContain(link.componentId);
    }
    for (const bike of catalogue.bikes) expect(typeIds).toContain(bike.bikeTypeId);
    for (const link of catalogue.prebuiltComponents) {
      expect(bikeIds).toContain(link.bikeId);
      expect(componentIds).toContain(link.componentId);
    }
  });

  it("links every component to at least one type", () => {
    const linked = new Set(catalogue.typeComponents.map((link) => link.componentId));
    for (const component of catalogue.components) expect(linked).toContain(component.id);
  });

  it("prices every component in EUR at a valid tax rate", () => {
    for (const component of catalogue.components) {
      expect(component.netPrice.currency).toBe("EUR");
      expect(component.netPrice.cents).toBeGreaterThan(0);
      expect(component.taxRateBps).toBe(2100);
    }
  });

  it.each(["road", "mtb", "gravel", "city"])("has a valid pre-built %s bike with one component per category", (typeId) => {
    const bike = catalogue.bikes.find((candidate) => candidate.bikeTypeId === typeId)!;
    const configuration = fromPrebuilt(catalogue, typeId)!;
    const linked = catalogue.prebuiltComponents.filter((link) => link.bikeId === bike.id);

    expect(Object.keys(configuration.selections)).toHaveLength(linked.length);
    expect(validate(catalogue, configuration)).toEqual({ ok: true, errors: [] });
  });

  it("has text in Spanish and English everywhere", () => {
    const texts: LocalizedText[] = [
      ...catalogue.bikeTypes.flatMap((type) => [type.name, type.description]),
      ...catalogue.categories.map((category) => category.name),
      ...catalogue.components.map((component) => component.name),
      ...catalogue.bikes.map((bike) => bike.name),
    ];
    for (const text of texts) {
      expect(text.es.trim()).not.toBe("");
      expect(text.en.trim()).not.toBe("");
    }
  });
});
