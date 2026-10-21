import type { Catalogue } from "@/domain/catalogue/catalogue";
import type { Quote } from "@/domain/pricing/pricing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMoney, formatTaxRate } from "@/i18n/format";

type Props = {
  quote: Quote;
  catalogue: Catalogue;
  locale: Locale;
  t: Dictionary["configurator"]["summary"];
};

export function PriceSummary({ quote, catalogue, locale, t }: Props) {
  const nameOf = (componentId: string) =>
    catalogue.components.find((component) => component.id === componentId)?.name[locale];
  const categoryOf = (categoryId: string) =>
    catalogue.categories.find((category) => category.id === categoryId)?.name[locale];

  return (
    <section aria-labelledby="summary-heading" className="rounded-2xl border border-border bg-muted/50 p-5">
      <h2 id="summary-heading" className="text-lg font-semibold">
        {t.title}
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        {quote.lines.map((line) => (
          <div key={line.categoryId} className="flex justify-between gap-4">
            <dt>
              <span className="block text-xs text-muted-foreground">{categoryOf(line.categoryId)}</span>
              {nameOf(line.componentId)}
            </dt>
            <dd className="shrink-0 tabular-nums">{formatMoney(line.gross, locale)}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>{t.subtotal}</dt>
          <dd className="tabular-nums">{formatMoney(quote.netTotal, locale)}</dd>
        </div>
        {quote.taxBreakdown.map((group) => (
          <div key={group.rateBps} className="flex justify-between gap-4">
            <dt>
              {t.tax} {formatTaxRate(group.rateBps, locale)}
            </dt>
            <dd className="tabular-nums">{formatMoney(group.tax, locale)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
        <span className="font-semibold">{t.total}</span>
        <span aria-live="polite" className="text-2xl font-bold tabular-nums">
          {formatMoney(quote.grossTotal, locale)}
        </span>
      </div>
    </section>
  );
}
