import { describe, expect, it } from "vitest";
import { fixtureCatalogue as catalogue } from "@/domain/catalogue/catalogue.fixture";
import { money } from "@/domain/shared/money";
import { grossPriceOf, priceConfiguration } from "./pricing";

const eur = (cents: number) => money(cents, "EUR");

describe("priceConfiguration", () => {
  it("prices each selected component as a line, in category order", () => {
    const quote = priceConfiguration(catalogue, {
      bikeTypeId: "mtb",
      selections: { pedals: "flat-pedals", frame: "mtb-frame", wheels: "shared-wheels" },
    }, "EUR");

    expect(quote.lines).toEqual([
      { categoryId: "frame", componentId: "mtb-frame", net: eur(90000), taxRateBps: 2100, tax: eur(18900), gross: eur(108900) },
      { categoryId: "wheels", componentId: "shared-wheels", net: eur(40000), taxRateBps: 2100, tax: eur(8400), gross: eur(48400) },
      { categoryId: "pedals", componentId: "flat-pedals", net: eur(2500), taxRateBps: 2100, tax: eur(525), gross: eur(3025) },
    ]);
  });

  it("totals the lines and groups tax by rate", () => {
    const quote = priceConfiguration(catalogue, {
      bikeTypeId: "road",
      selections: { frame: "road-frame", wheels: "road-wheels" },
    }, "EUR");

    expect(quote.netTotal).toEqual(eur(160000));
    expect(quote.taxBreakdown).toEqual([
      { rateBps: 1000, base: eur(60000), tax: eur(6000) },
      { rateBps: 2100, base: eur(100000), tax: eur(21000) },
    ]);
    expect(quote.taxTotal).toEqual(eur(27000));
    expect(quote.grossTotal).toEqual(eur(187000));
  });

  it("sums rounded line taxes rather than re-rounding the group", () => {
    const tiny = {
      ...catalogue,
      components: [
        ...catalogue.components,
        { ...catalogue.components[0], id: "a", categoryId: "frame", netPrice: eur(50) },
        { ...catalogue.components[0], id: "b", categoryId: "wheels", netPrice: eur(50) },
      ],
    };
    const quote = priceConfiguration(tiny, { bikeTypeId: "road", selections: { frame: "a", wheels: "b" } }, "EUR");

    // Each line: 50 * 21% = 10.5 → 11. Group: 22 (not round(21) = 21).
    expect(quote.taxBreakdown).toEqual([{ rateBps: 2100, base: eur(100), tax: eur(22) }]);
    expect(quote.grossTotal).toEqual(eur(122));
  });

  it("is zero for an empty configuration", () => {
    const quote = priceConfiguration(catalogue, { bikeTypeId: "road", selections: {} }, "EUR");

    expect(quote).toEqual({ lines: [], netTotal: eur(0), taxBreakdown: [], taxTotal: eur(0), grossTotal: eur(0) });
  });

  it("refuses an unknown component", () => {
    expect(() =>
      priceConfiguration(catalogue, { bikeTypeId: "road", selections: { frame: "nope" } }, "EUR"),
    ).toThrow(/nope/);
  });
});

describe("grossPriceOf", () => {
  it("is the net price plus tax rounded half up", () => {
    const component = { ...catalogue.components[0], netPrice: eur(50), taxRateBps: 2100 };
    expect(grossPriceOf(component)).toEqual(eur(61));
  });
});
