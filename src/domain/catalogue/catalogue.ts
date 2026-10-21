import type { Money } from "@/domain/shared/money";

/** Text in every supported language. */
export type LocalizedText = Readonly<{ es: string; en: string }>;

export type BikeType = Readonly<{
  id: string;
  name: LocalizedText;
  description: LocalizedText;
}>;

export type ComponentCategory = Readonly<{
  id: string;
  name: LocalizedText;
  /** A mandatory category must have exactly one component; an optional one may have none. */
  mandatory: boolean;
}>;

/** How a component is drawn in the bike preview. */
export type ComponentVisual = Readonly<{ colour: string; variant: string }>;

export type BikeComponent = Readonly<{
  id: string;
  categoryId: string;
  name: LocalizedText;
  netPrice: Money;
  /** Tax rate in basis points: 2100 = 21%. */
  taxRateBps: number;
  /** 0 means unavailable. */
  stock: number;
  visual: ComponentVisual;
}>;

/** A pre-built bike. */
export type Bike = Readonly<{ id: string; bikeTypeId: string; name: LocalizedText }>;

export type TypeComponent = Readonly<{ bikeTypeId: string; componentId: string }>;

export type PrebuiltComponent = Readonly<{ bikeId: string; componentId: string }>;

/** The whole catalogue; categories are listed in display order. */
export type Catalogue = Readonly<{
  bikeTypes: readonly BikeType[];
  categories: readonly ComponentCategory[];
  components: readonly BikeComponent[];
  typeComponents: readonly TypeComponent[];
  bikes: readonly Bike[];
  prebuiltComponents: readonly PrebuiltComponent[];
}>;

export type CategoryGroup = Readonly<{
  category: ComponentCategory;
  components: readonly BikeComponent[];
}>;

/** Components that fit a bike type, grouped by category in category order. Empty categories are left out. */
export function componentsByCategory(catalogue: Catalogue, bikeTypeId: string): CategoryGroup[] {
  const fitting = new Set(
    catalogue.typeComponents
      .filter((link) => link.bikeTypeId === bikeTypeId)
      .map((link) => link.componentId),
  );
  return catalogue.categories
    .map((category) => ({
      category,
      components: catalogue.components.filter(
        (component) => component.categoryId === category.id && fitting.has(component.id),
      ),
    }))
    .filter((group) => group.components.length > 0);
}

/** The pre-built bike of a type and its component ids, if there is one. */
export function prebuiltFor(
  catalogue: Catalogue,
  bikeTypeId: string,
): { bike: Bike; componentIds: string[] } | undefined {
  const bike = catalogue.bikes.find((candidate) => candidate.bikeTypeId === bikeTypeId);
  if (!bike) return undefined;
  const componentIds = catalogue.prebuiltComponents
    .filter((link) => link.bikeId === bike.id)
    .map((link) => link.componentId);
  return { bike, componentIds };
}

/** The part of the catalogue one bike type needs. Categories are all kept so mandatory rules still apply. */
export function catalogueForType(catalogue: Catalogue, bikeTypeId: string): Catalogue {
  const typeComponents = catalogue.typeComponents.filter((link) => link.bikeTypeId === bikeTypeId);
  const componentIds = new Set(typeComponents.map((link) => link.componentId));
  const bikes = catalogue.bikes.filter((bike) => bike.bikeTypeId === bikeTypeId);
  const bikeIds = new Set(bikes.map((bike) => bike.id));
  return {
    bikeTypes: catalogue.bikeTypes.filter((type) => type.id === bikeTypeId),
    categories: catalogue.categories,
    components: catalogue.components.filter((component) => componentIds.has(component.id)),
    typeComponents,
    bikes,
    prebuiltComponents: catalogue.prebuiltComponents.filter((link) => bikeIds.has(link.bikeId)),
  };
}
