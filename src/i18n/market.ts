import type { Locale } from "./config";

/** The market the shop sells in. Opening another market means another entry here. */
export const market = {
  country: "ES",
  currency: "EUR",
  /** Intl locale per language. Not `${language}-${country}`: CLDR's en-ES mixes separators. */
  intlLocales: { es: "es-ES", en: "en-GB" } satisfies Record<Locale, string>,
} as const;
