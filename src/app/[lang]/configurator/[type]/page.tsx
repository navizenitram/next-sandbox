import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogueForType, prebuiltFor } from "@/domain/catalogue/catalogue";
import { fromPrebuilt } from "@/domain/configuration/configuration";
import { Configurator } from "@/features/configurator/configurator";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { catalogueRepository } from "@/server/container";
import { submitOrder } from "./actions";

export async function generateStaticParams() {
  const catalogue = await catalogueRepository.getCatalogue();
  return catalogue.bikeTypes.map((type) => ({ type: type.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/configurator/[type]">): Promise<Metadata> {
  const [{ type }, locale, catalogue] = await Promise.all([params, getLocale(), catalogueRepository.getCatalogue()]);
  const bikeType = catalogue.bikeTypes.find((candidate) => candidate.id === type);
  return { title: bikeType?.name[locale] };
}

export default async function ConfigurePage({ params }: PageProps<"/[lang]/configurator/[type]">) {
  const [{ type }, locale, dict, catalogue] = await Promise.all([
    params,
    getLocale(),
    getDictionary(),
    catalogueRepository.getCatalogue(),
  ]);
  const bikeType = catalogue.bikeTypes.find((candidate) => candidate.id === type);
  const initial = fromPrebuilt(catalogue, type);
  if (!bikeType || !initial) notFound();
  const t = dict.configurator;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">
      <Link href={`/${locale}/configurator`} className="text-sm text-muted-foreground hover:text-foreground">
        <span aria-hidden="true">←</span> {t.changeType}
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{bikeType.name[locale]}</h1>
      <p className="mt-2 text-muted-foreground">
        {bikeType.description[locale]} {t.baseModel}: {prebuiltFor(catalogue, type)?.bike.name[locale]}.
      </p>
      <Configurator
        locale={locale}
        catalogue={catalogueForType(catalogue, type)}
        initial={initial}
        t={t}
        orderAction={submitOrder}
        orderT={dict.orderForm}
      />
    </main>
  );
}
