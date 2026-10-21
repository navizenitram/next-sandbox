import { describe, expect, it } from "vitest";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

function entries(value: unknown, prefix = ""): [string, unknown][] {
  if (typeof value !== "object" || value === null) return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) => entries(child, prefix ? `${prefix}.${key}` : key));
}

describe("dictionaries", () => {
  it("have identical key sets in Spanish and English", () => {
    const keys = (dictionary: unknown) => entries(dictionary).map(([key]) => key).sort();
    expect(keys(en)).toEqual(keys(es));
  });

  it("have a non-empty string for every key", () => {
    for (const [key, value] of [...entries(es), ...entries(en)]) {
      expect(typeof value, key).toBe("string");
      expect((value as string).trim(), key).not.toBe("");
    }
  });
});
