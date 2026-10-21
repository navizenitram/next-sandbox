import type { CatalogueRepository } from "@/domain/catalogue/catalogue-repository";
import { validate, type Configuration, type ConfigurationError } from "@/domain/configuration/configuration";
import { priceConfiguration } from "@/domain/pricing/pricing";
import type { Currency } from "@/domain/shared/money";
import type { Customer, Order } from "./order";
import type { OrderRepository } from "./order-repository";

export type PlaceOrderInput = Readonly<{ customer: Customer; configuration: Configuration }>;

export type PlaceOrderDeps = Readonly<{
  catalogue: CatalogueRepository;
  orders: OrderRepository;
  generateId: () => string;
  now: () => Date;
  currency: Currency;
}>;

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; errors: ConfigurationError[] };

/** Re-validates and re-prices the configuration on the server, then saves the order as a lead. */
export async function placeOrder(input: PlaceOrderInput, deps: PlaceOrderDeps): Promise<PlaceOrderResult> {
  const catalogue = await deps.catalogue.getCatalogue();
  const validation = validate(catalogue, input.configuration);
  if (!validation.ok) return { ok: false, errors: validation.errors };

  const order: Order = {
    id: deps.generateId(),
    status: "lead",
    createdAt: deps.now(),
    customer: input.customer,
    configuration: input.configuration,
    quote: priceConfiguration(catalogue, input.configuration, deps.currency),
  };
  await deps.orders.save(order);
  return { ok: true, order };
}
