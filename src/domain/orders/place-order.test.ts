import { describe, expect, it } from "vitest";
import { createInMemoryOrderRepository } from "@/adapters/orders/in-memory-order-repository";
import type { CatalogueRepository } from "@/domain/catalogue/catalogue-repository";
import { fixtureCatalogue } from "@/domain/catalogue/catalogue.fixture";
import { priceConfiguration } from "@/domain/pricing/pricing";
import type { Customer } from "./order";
import { placeOrder, type PlaceOrderDeps } from "./place-order";

const customer: Customer = {
  name: "Ana García",
  email: "ana@example.com",
  phone: "+34 600 000 000",
  address: { street: "Calle Mayor 1", postalCode: "28013", city: "Madrid", province: "Madrid" },
  notes: "",
};

const now = new Date("2026-10-21T10:00:00Z");

function deps(): PlaceOrderDeps {
  const catalogue: CatalogueRepository = { getCatalogue: async () => fixtureCatalogue };
  return {
    catalogue,
    orders: createInMemoryOrderRepository(),
    generateId: () => "BK-0001",
    now: () => now,
    currency: "EUR",
  };
}

const configuration = { bikeTypeId: "road", selections: { frame: "road-frame", wheels: "road-wheels" } };

describe("placeOrder", () => {
  it("saves a valid configuration as a lead, priced on the server", async () => {
    const d = deps();
    const result = await placeOrder({ customer, configuration }, d);

    const expected = {
      id: "BK-0001",
      status: "lead",
      createdAt: now,
      customer,
      configuration,
      quote: priceConfiguration(fixtureCatalogue, configuration, "EUR"),
    };
    expect(result).toEqual({ ok: true, order: expected });
    expect(await d.orders.findById("BK-0001")).toEqual(expected);
  });

  it("rejects an invalid configuration and saves nothing", async () => {
    const d = deps();
    const result = await placeOrder(
      { customer, configuration: { bikeTypeId: "road", selections: { frame: "road-frame-sold-out" } } },
      d,
    );

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: "out-of-stock", categoryId: "frame" },
        { code: "missing-mandatory", categoryId: "wheels" },
      ],
    });
    expect(await d.orders.findById("BK-0001")).toBeUndefined();
  });
});
