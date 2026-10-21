import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "./config";

const dictionaries = {
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
} satisfies Record<Locale, unknown>;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["es"]>>;

/** The locale of the current route, from the `[lang]` root param. */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
