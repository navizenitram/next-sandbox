import type { Metadata } from "next";
import Link from "next/link";
import { fromPrebuilt } from "@/domain/configuration/configuration";
import { priceConfiguration } from "@/domain/pricing/pricing";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { formatMoney } from "@/i18n/format";
import { market } from "@/i18n/market";
import { catalogueRepository } from "@/server/container";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.configurator.metaTitle };
}

export default async function TypePickerPage() {
  const [locale, dict, catalogue] = await Promise.all([
    getLocale(),
    getDictionary(),
    catalogueRepository.getCatalogue(),
  ]);
  const t = dict.configurator;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{t.pickTitle}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">{t.pickSubtitle}</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {catalogue.bikeTypes.map((type) => {
          const prebuilt = fromPrebuilt(catalogue, type.id);
          const price = prebuilt && priceConfiguration(catalogue, prebuilt, market.currency).grossTotal;
          return (
            <li key={type.id}>
              <Link
                href={`/${locale}/configurator/${type.id}`}
                className="group flex h-full flex-col rounded-2xl border border-border p-6 transition hover:border-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent"
              >
                <h2 className="text-xl font-semibold">{type.name[locale]}</h2>
                <p className="mt-2 text-muted-foreground">{type.description[locale]}</p>
                <div className="mt-6 flex items-end justify-between gap-4 pt-2">
                  {price && (
                    <p className="text-sm text-muted-foreground">
                      {t.basePrice}
                      <span className="block text-lg font-semibold text-foreground">{formatMoney(price, locale)}</span>
                    </p>
                  )}
                  <span className="font-semibold text-accent">
                    {t.customise} <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
