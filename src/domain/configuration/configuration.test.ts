import { describe, expect, it } from "vitest";
import { fixtureCatalogue as catalogue } from "@/domain/catalogue/catalogue.fixture";
import { fromPrebuilt, select, validate, type Configuration } from "./configuration";

const roadPrebuilt: Configuration = {
  bikeTypeId: "road",
  selections: { frame: "road-frame", wheels: "shared-wheels" },
};

describe("fromPrebuilt", () => {
  it("starts from the pre-built bike of the type", () => {
    expect(fromPrebuilt(catalogue, "road")).toEqual(roadPrebuilt);
  });

  it("returns undefined for a type without a pre-built bike", () => {
    expect(fromPrebuilt(catalogue, "unicycle")).toBeUndefined();
  });
});

describe("select", () => {
  it("replaces the component of a category", () => {
    expect(select(catalogue, roadPrebuilt, "wheels", "road-wheels")).toEqual({
      ok: true,
      configuration: { bikeTypeId: "road", selections: { frame: "road-frame", wheels: "road-wheels" } },
    });
  });

  it("does not change the original configuration", () => {
    select(catalogue, roadPrebuilt, "wheels", "road-wheels");
    expect(roadPrebuilt.selections.wheels).toBe("shared-wheels");
  });

  it("rejects a component that does not fit the type", () => {
    expect(select(catalogue, roadPrebuilt, "frame", "mtb-frame")).toEqual({ ok: false, error: "off-type" });
  });

  it("rejects a component that is out of stock", () => {
    expect(select(catalogue, roadPrebuilt, "frame", "road-frame-sold-out")).toEqual({
      ok: false,
      error: "out-of-stock",
    });
  });

  it("rejects a component from another category", () => {
    expect(select(catalogue, roadPrebuilt, "frame", "shared-wheels")).toEqual({
      ok: false,
      error: "wrong-category",
    });
  });

  it("rejects an unknown component", () => {
    expect(select(catalogue, roadPrebuilt, "frame", "nope")).toEqual({ ok: false, error: "unknown-component" });
  });

  it("rejects an unknown category", () => {
    expect(select(catalogue, roadPrebuilt, "bell", null)).toEqual({ ok: false, error: "unknown-category" });
  });

  it("clears an optional category when given null", () => {
    const mtb = fromPrebuilt(catalogue, "mtb")!;
    expect(select(catalogue, mtb, "pedals", null)).toEqual({
      ok: true,
      configuration: { bikeTypeId: "mtb", selections: { frame: "mtb-frame", wheels: "shared-wheels" } },
    });
  });

  it("refuses to clear a mandatory category", () => {
    expect(select(catalogue, roadPrebuilt, "frame", null)).toEqual({ ok: false, error: "mandatory-category" });
  });
});

describe("validate", () => {
  it("accepts a configuration with every mandatory category filled", () => {
    expect(validate(catalogue, roadPrebuilt)).toEqual({ ok: true, errors: [] });
  });

  it("accepts a configuration without its optional categories", () => {
    const mtb = { bikeTypeId: "mtb", selections: { frame: "mtb-frame", wheels: "shared-wheels" } };
    expect(validate(catalogue, mtb)).toEqual({ ok: true, errors: [] });
  });

  it("reports each missing mandatory category", () => {
    expect(validate(catalogue, { bikeTypeId: "road", selections: {} })).toEqual({
      ok: false,
      errors: [
        { code: "missing-mandatory", categoryId: "frame" },
        { code: "missing-mandatory", categoryId: "wheels" },
      ],
    });
  });

  it("reports components that do not fit the type, are out of stock or sit in the wrong category", () => {
    const result = validate(catalogue, {
      bikeTypeId: "road",
      selections: { frame: "road-frame-sold-out", wheels: "nope", pedals: "flat-pedals" },
    });
    expect(result).toEqual({
      ok: false,
      errors: [
        { code: "out-of-stock", categoryId: "frame" },
        { code: "unknown-component", categoryId: "wheels" },
        { code: "off-type", categoryId: "pedals" },
      ],
    });
  });

  it("reports a component stored under the wrong category", () => {
    const result = validate(catalogue, {
      bikeTypeId: "road",
      selections: { frame: "road-frame", wheels: "road-frame" },
    });
    expect(result).toEqual({ ok: false, errors: [{ code: "wrong-category", categoryId: "wheels" }] });
  });

  it("reports an unknown category", () => {
    const result = validate(catalogue, { ...roadPrebuilt, selections: { ...roadPrebuilt.selections, bell: "x" } });
    expect(result).toEqual({ ok: false, errors: [{ code: "unknown-category", categoryId: "bell" }] });
  });

  it("reports an unknown bike type", () => {
    expect(validate(catalogue, { bikeTypeId: "unicycle", selections: {} })).toEqual({
      ok: false,
      errors: [{ code: "unknown-type" }],
    });
  });
});
