import { describe, expect, it } from "vitest";
import { defaultLocale, hasLocale, locales, negotiateLocale } from "./config";

describe("locales", () => {
  it("supports Spanish and English, Spanish by default", () => {
    expect(locales).toEqual(["es", "en"]);
    expect(defaultLocale).toBe("es");
  });

  it("recognises supported locales only", () => {
    expect(hasLocale("es")).toBe(true);
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("toString")).toBe(false);
  });
});

describe("negotiateLocale", () => {
  it("falls back to the default without a header", () => {
    expect(negotiateLocale(null)).toBe("es");
    expect(negotiateLocale("")).toBe("es");
  });

  it("picks the first supported language by quality", () => {
    expect(negotiateLocale("en-US,en;q=0.9,es;q=0.8")).toBe("en");
    expect(negotiateLocale("fr-FR,fr;q=0.9,es;q=0.5,en;q=0.7")).toBe("en");
  });

  it("matches regional variants on their base language", () => {
    expect(negotiateLocale("es-MX")).toBe("es");
    expect(negotiateLocale("EN-gb")).toBe("en");
  });

  it("keeps header order for equal qualities", () => {
    expect(negotiateLocale("en, es")).toBe("en");
  });

  it("ignores languages with q=0, wildcards and malformed entries", () => {
    expect(negotiateLocale("en;q=0, es;q=0.1")).toBe("es");
    expect(negotiateLocale("*, en;q=0.5")).toBe("en");
    expect(negotiateLocale("en;q=abc")).toBe("en");
  });

  it("falls back to the default when nothing is supported", () => {
    expect(negotiateLocale("fr, de;q=0.8")).toBe("es");
  });
});
