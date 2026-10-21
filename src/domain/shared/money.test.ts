import { describe, expect, it } from "vitest";
import { add, money, sum, taxAt } from "./money";

describe("money", () => {
  it("creates a value from integer cents and a currency", () => {
    expect(money(1250, "EUR")).toEqual({ cents: 1250, currency: "EUR" });
  });

  it("refuses non-integer cents", () => {
    expect(() => money(12.5, "EUR")).toThrow();
  });

  it("refuses negative cents", () => {
    expect(() => money(-1, "EUR")).toThrow();
  });
});

describe("add", () => {
  it("adds two amounts in the same currency", () => {
    expect(add(money(100, "EUR"), money(250, "EUR"))).toEqual(money(350, "EUR"));
  });

  it("refuses mixed currencies", () => {
    expect(() => add(money(100, "EUR"), money(100, "USD"))).toThrow(/currency/i);
  });
});

describe("sum", () => {
  it("sums a list of amounts", () => {
    expect(sum([money(1, "EUR"), money(2, "EUR"), money(3, "EUR")], "EUR")).toEqual(money(6, "EUR"));
  });

  it("returns zero in the given currency for an empty list", () => {
    expect(sum([], "EUR")).toEqual(money(0, "EUR"));
  });

  it("refuses an amount in another currency", () => {
    expect(() => sum([money(1, "USD")], "EUR")).toThrow(/currency/i);
  });
});

describe("taxAt", () => {
  it("computes the tax for a rate in basis points", () => {
    expect(taxAt(money(10000, "EUR"), 2100)).toEqual(money(2100, "EUR"));
  });

  it("rounds half up to the nearest cent", () => {
    // 50 * 21% = 10.5 → 11
    expect(taxAt(money(50, "EUR"), 2100)).toEqual(money(11, "EUR"));
    // 47 * 21% = 9.87 → 10
    expect(taxAt(money(47, "EUR"), 2100)).toEqual(money(10, "EUR"));
    // 11 * 21% = 2.31 → 2
    expect(taxAt(money(11, "EUR"), 2100)).toEqual(money(2, "EUR"));
  });

  it("is zero for a zero rate", () => {
    expect(taxAt(money(999, "EUR"), 0)).toEqual(money(0, "EUR"));
  });

  it("refuses a negative or non-integer rate", () => {
    expect(() => taxAt(money(100, "EUR"), -1)).toThrow();
    expect(() => taxAt(money(100, "EUR"), 10.5)).toThrow();
  });
});
