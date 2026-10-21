import { describe, expect, it } from "vitest";
import { money } from "@/domain/shared/money";
import { formatMoney, formatTaxRate, intlLocale } from "./format";

describe("intlLocale", () => {
  it("uses the market's Intl locale for each language", () => {
    expect(intlLocale("es")).toBe("es-ES");
    expect(intlLocale("en")).toBe("en-GB");
  });
});

describe("formatMoney", () => {
  it("formats euros the Spanish way", () => {
    expect(formatMoney(money(123450, "EUR"), "es")).toBe("1234,50 €");
    expect(formatMoney(money(12345678, "EUR"), "es")).toBe("123.456,78 €");
  });

  it("formats euros the English way", () => {
    expect(formatMoney(money(123450, "EUR"), "en")).toBe("€1,234.50");
  });

  it("always shows cents", () => {
    expect(formatMoney(money(100000, "EUR"), "en")).toBe("€1,000.00");
  });
});

describe("formatTaxRate", () => {
  it("formats basis points as a percentage in each language", () => {
    expect(formatTaxRate(2100, "es")).toBe("21 %");
    expect(formatTaxRate(2100, "en")).toBe("21%");
  });

  it("keeps decimals when the rate has them", () => {
    expect(formatTaxRate(550, "en")).toBe("5.5%");
  });
});
