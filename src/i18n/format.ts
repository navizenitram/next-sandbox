import type { Money } from "@/domain/shared/money";
import type { Locale } from "./config";
import { market } from "./market";

/** BCP 47 locale for Intl: how the shop's market formats each language. */
export function intlLocale(locale: Locale): string {
  return market.intlLocales[locale];
}

export function formatMoney(amount: Money, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: amount.currency }).format(
    amount.cents / 100,
  );
}

/** A tax rate in basis points (2100) as a localized percentage ("21 %", "21%"). */
export function formatTaxRate(rateBps: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), { style: "percent", maximumFractionDigits: 2 }).format(
    rateBps / 10000,
  );
}
