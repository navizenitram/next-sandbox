import { describe, expect, it } from "vitest";
import type { Order } from "@/domain/orders/order";
import { money } from "@/domain/shared/money";
import { createInMemoryOrderRepository, inMemoryOrderRepository } from "./in-memory-order-repository";

const eur = (cents: number) => money(cents, "EUR");

const order: Order = {
  id: "BK-0001",
  status: "lead",
  createdAt: new Date("2026-10-21T10:00:00Z"),
  customer: {
    name: "Ana García",
    email: "ana@example.com",
    phone: "+34 600 000 000",
    address: { street: "Calle Mayor 1", postalCode: "28013", city: "Madrid", province: "Madrid" },
    notes: "",
  },
  configuration: { bikeTypeId: "road", selections: {} },
  quote: { lines: [], netTotal: eur(0), taxBreakdown: [], taxTotal: eur(0), grossTotal: eur(0) },
};

describe("in-memory order repository", () => {
  it("finds a saved order by id", async () => {
    const orders = createInMemoryOrderRepository();
    await orders.save(order);

    expect(await orders.findById("BK-0001")).toEqual(order);
  });

  it("returns undefined for an unknown id", async () => {
    expect(await createInMemoryOrderRepository().findById("nope")).toBeUndefined();
  });

  it("keeps separate instances isolated", async () => {
    const first = createInMemoryOrderRepository();
    await first.save(order);

    expect(await createInMemoryOrderRepository().findById("BK-0001")).toBeUndefined();
  });

  it("shares one app-wide instance", async () => {
    const { inMemoryOrderRepository: again } = await import("./in-memory-order-repository");
    expect(again).toBe(inMemoryOrderRepository);
  });
});
