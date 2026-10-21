export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Picks the best supported locale from an Accept-Language header, or the default. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      const q = qParam ? Number(qParam.slice(2)) : 1;
      return { language: tag.split("-")[0].toLowerCase(), q: Number.isNaN(q) ? 1 : q, index };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { language } of ranked) {
    if (hasLocale(language)) return language;
  }
  return defaultLocale;
}
