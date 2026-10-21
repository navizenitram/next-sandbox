import { money } from "@/domain/shared/money";
import type { BikeComponent, Catalogue } from "./catalogue";

const visual = { colour: "#000000", variant: "default" };

function component(
  id: string,
  categoryId: string,
  netCents: number,
  overrides: Partial<BikeComponent> = {},
): BikeComponent {
  return {
    id,
    categoryId,
    name: { es: id, en: id },
    netPrice: money(netCents, "EUR"),
    taxRateBps: 2100,
    stock: 5,
    visual,
    ...overrides,
  };
}

/** Small catalogue for domain tests: 2 types, 3 categories (pedals optional). */
export const fixtureCatalogue: Catalogue = {
  bikeTypes: [
    { id: "road", name: { es: "Carretera", en: "Road" }, description: { es: "", en: "" } },
    { id: "mtb", name: { es: "Montaña", en: "Mountain" }, description: { es: "", en: "" } },
  ],
  categories: [
    { id: "frame", name: { es: "Cuadro", en: "Frame" }, mandatory: true },
    { id: "wheels", name: { es: "Ruedas", en: "Wheels" }, mandatory: true },
    { id: "pedals", name: { es: "Pedales", en: "Pedals" }, mandatory: false },
  ],
  components: [
    component("road-frame", "frame", 100000),
    component("road-frame-sold-out", "frame", 120000, { stock: 0 }),
    component("mtb-frame", "frame", 90000),
    component("shared-wheels", "wheels", 40000),
    component("road-wheels", "wheels", 60000, { taxRateBps: 1000 }),
    component("flat-pedals", "pedals", 2500),
  ],
  typeComponents: [
    { bikeTypeId: "road", componentId: "road-frame" },
    { bikeTypeId: "road", componentId: "road-frame-sold-out" },
    { bikeTypeId: "road", componentId: "shared-wheels" },
    { bikeTypeId: "road", componentId: "road-wheels" },
    { bikeTypeId: "mtb", componentId: "mtb-frame" },
    { bikeTypeId: "mtb", componentId: "shared-wheels" },
    { bikeTypeId: "mtb", componentId: "flat-pedals" },
  ],
  bikes: [
    { id: "road-prebuilt", bikeTypeId: "road", name: { es: "Ruta", en: "Route" } },
    { id: "mtb-prebuilt", bikeTypeId: "mtb", name: { es: "Sendero", en: "Trail" } },
  ],
  prebuiltComponents: [
    { bikeId: "road-prebuilt", componentId: "road-frame" },
    { bikeId: "road-prebuilt", componentId: "shared-wheels" },
    { bikeId: "mtb-prebuilt", componentId: "mtb-frame" },
    { bikeId: "mtb-prebuilt", componentId: "shared-wheels" },
    { bikeId: "mtb-prebuilt", componentId: "flat-pedals" },
  ],
};
