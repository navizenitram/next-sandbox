import type { BikeComponent, Catalogue } from "@/domain/catalogue/catalogue";
import type { Configuration } from "@/domain/configuration/configuration";
import { add, sum, taxAt, type Currency, type Money } from "@/domain/shared/money";

export type PriceLine = Readonly<{
  categoryId: string;
  componentId: string;
  net: Money;
  taxRateBps: number;
  tax: Money;
  gross: Money;
}>;

export type TaxGroup = Readonly<{ rateBps: number; base: Money; tax: Money }>;

export type Quote = Readonly<{
  lines: readonly PriceLine[];
  netTotal: Money;
  /** One group per tax rate, lowest rate first. */
  taxBreakdown: readonly TaxGroup[];
  taxTotal: Money;
  grossTotal: Money;
}>;

/**
 * Prices a configuration: one line per selected component (in category order),
 * tax rounded half up per line, totals as sums of the lines.
 */
export function priceConfiguration(catalogue: Catalogue, configuration: Configuration, currency: Currency): Quote {
  const lines: PriceLine[] = [];
  for (const [categoryId, componentId] of Object.entries(configuration.selections)) {
    const component = catalogue.components.find((candidate) => candidate.id === componentId);
    if (!component) throw new Error(`Unknown component: ${componentId}`);
    lines.push({
      categoryId,
      componentId,
      net: component.netPrice,
      taxRateBps: component.taxRateBps,
      tax: taxAt(component.netPrice, component.taxRateBps),
      gross: grossPriceOf(component),
    });
  }
  const order = catalogue.categories.map((category) => category.id);
  lines.sort((a, b) => order.indexOf(a.categoryId) - order.indexOf(b.categoryId));

  const rates = [...new Set(lines.map((line) => line.taxRateBps))].sort((a, b) => a - b);
  const taxBreakdown = rates.map((rateBps) => {
    const atRate = lines.filter((line) => line.taxRateBps === rateBps);
    return {
      rateBps,
      base: sum(atRate.map((line) => line.net), currency),
      tax: sum(atRate.map((line) => line.tax), currency),
    };
  });

  return {
    lines,
    netTotal: sum(lines.map((line) => line.net), currency),
    taxBreakdown,
    taxTotal: sum(lines.map((line) => line.tax), currency),
    grossTotal: sum(lines.map((line) => line.gross), currency),
  };
}

/** A component's price including tax, rounded half up. */
export function grossPriceOf(component: BikeComponent): Money {
  return add(component.netPrice, taxAt(component.netPrice, component.taxRateBps));
}
