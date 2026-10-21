"use client";

import { useState } from "react";
import { componentsByCategory, type Catalogue } from "@/domain/catalogue/catalogue";
import { select, type Configuration, type SelectError } from "@/domain/configuration/configuration";
import { priceConfiguration } from "@/domain/pricing/pricing";
import { BikePreview } from "@/features/bike-preview/bike-preview";
import { toBikeVisual } from "@/features/bike-preview/bike-visual";
import { OrderForm } from "@/features/order-form/order-form";
import type { OrderFormState } from "@/features/order-form/order-form-state";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { market } from "@/i18n/market";
import { OptionGroup } from "./option-group";
import { PriceSummary } from "./price-summary";

type Props = {
  locale: Locale;
  /** The slice of the catalogue for this bike type. */
  catalogue: Catalogue;
  initial: Configuration;
  t: Dictionary["configurator"];
  orderAction: (state: OrderFormState, formData: FormData) => Promise<OrderFormState>;
  orderT: Dictionary["orderForm"];
};

export function Configurator({ locale, catalogue, initial, t, orderAction, orderT }: Props) {
  const [configuration, setConfiguration] = useState(initial);
  const [error, setError] = useState<SelectError | null>(null);
  const groups = componentsByCategory(catalogue, configuration.bikeTypeId);
  const quote = priceConfiguration(catalogue, configuration, market.currency);

  function choose(categoryId: string, componentId: string | null) {
    const result = select(catalogue, configuration, categoryId, componentId);
    if (result.ok) {
      setConfiguration(result.configuration);
      setError(null);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-labelledby="options-heading" className="space-y-6 lg:col-start-1 lg:row-start-1">
        <h2 id="options-heading" className="sr-only">
          {t.optionsTitle}
        </h2>
        {error && (
          <p role="alert" className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            {t.errors[error]}
          </p>
        )}
        {groups.map((group) => (
          <OptionGroup
            key={group.category.id}
            group={group}
            selectedId={configuration.selections[group.category.id] ?? null}
            onChoose={choose}
            locale={locale}
            t={t}
          />
        ))}
      </section>
      {/* On mobile the preview moves above the options; on desktop both stick in the side column. */}
      <div className="contents lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:space-y-4 lg:self-start">
        <div className="order-first rounded-2xl bg-muted p-4 lg:order-none">
          <BikePreview visual={toBikeVisual(configuration, catalogue)} label={t.previewLabel} />
        </div>
        <PriceSummary quote={quote} catalogue={catalogue} locale={locale} t={t.summary} />
      </div>
      <div className="lg:col-start-1 lg:row-start-2">
        <OrderForm
          action={orderAction}
          configuration={configuration}
          catalogue={catalogue}
          locale={locale}
          t={orderT}
          configurationErrors={t.errors}
        />
      </div>
    </div>
  );
}
