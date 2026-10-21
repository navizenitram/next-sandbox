import "server-only";
import { randomUUID } from "node:crypto";
import { staticCatalogueRepository } from "@/adapters/catalogue/static-catalogue";
import { inMemoryOrderRepository } from "@/adapters/orders/in-memory-order-repository";
import type { CatalogueRepository } from "@/domain/catalogue/catalogue-repository";
import type { PlaceOrderDeps } from "@/domain/orders/place-order";
import { market } from "@/i18n/market";

// Composition root: the only place that picks adapters for the ports.

export const catalogueRepository: CatalogueRepository = staticCatalogueRepository;

export const placeOrderDeps: PlaceOrderDeps = {
  catalogue: catalogueRepository,
  orders: inMemoryOrderRepository,
  generateId: () => `BK-${randomUUID().slice(0, 8).toUpperCase()}`,
  now: () => new Date(),
  currency: market.currency,
};
