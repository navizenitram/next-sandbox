import { prebuiltFor, type Catalogue } from "@/domain/catalogue/catalogue";

/** A bike being configured: at most one component per category. */
export type Configuration = Readonly<{
  bikeTypeId: string;
  /** categoryId → componentId */
  selections: Readonly<Record<string, string>>;
}>;

export type ComponentError = "unknown-component" | "wrong-category" | "off-type" | "out-of-stock";

export type SelectError = ComponentError | "unknown-category" | "mandatory-category";

export type SelectResult =
  | { ok: true; configuration: Configuration }
  | { ok: false; error: SelectError };

export type ConfigurationError =
  | { code: "unknown-type" }
  | { code: ComponentError | "unknown-category" | "missing-mandatory"; categoryId: string };

export type ValidationResult = { ok: boolean; errors: ConfigurationError[] };

/** The configuration of a type's pre-built bike, if it has one. */
export function fromPrebuilt(catalogue: Catalogue, bikeTypeId: string): Configuration | undefined {
  const prebuilt = prebuiltFor(catalogue, bikeTypeId);
  if (!prebuilt) return undefined;
  const selections: Record<string, string> = {};
  for (const componentId of prebuilt.componentIds) {
    const component = catalogue.components.find((candidate) => candidate.id === componentId);
    if (component) selections[component.categoryId] = component.id;
  }
  return { bikeTypeId, selections };
}

/** Puts a component in a category, or clears the category when `componentId` is null. */
export function select(
  catalogue: Catalogue,
  configuration: Configuration,
  categoryId: string,
  componentId: string | null,
): SelectResult {
  const category = catalogue.categories.find((candidate) => candidate.id === categoryId);
  if (!category) return { ok: false, error: "unknown-category" };

  if (componentId === null) {
    if (category.mandatory) return { ok: false, error: "mandatory-category" };
    const selections = { ...configuration.selections };
    delete selections[categoryId];
    return { ok: true, configuration: { ...configuration, selections } };
  }

  const error = checkComponent(catalogue, configuration.bikeTypeId, categoryId, componentId);
  if (error) return { ok: false, error };
  return {
    ok: true,
    configuration: { ...configuration, selections: { ...configuration.selections, [categoryId]: componentId } },
  };
}

/** Checks a whole configuration: known type, every mandatory category filled, every component allowed. */
export function validate(catalogue: Catalogue, configuration: Configuration): ValidationResult {
  const { bikeTypeId, selections } = configuration;
  if (!catalogue.bikeTypes.some((type) => type.id === bikeTypeId)) {
    return { ok: false, errors: [{ code: "unknown-type" }] };
  }

  const errors: ConfigurationError[] = [];
  for (const category of catalogue.categories) {
    const componentId = selections[category.id];
    if (componentId === undefined) {
      if (category.mandatory) errors.push({ code: "missing-mandatory", categoryId: category.id });
      continue;
    }
    const error = checkComponent(catalogue, bikeTypeId, category.id, componentId);
    if (error) errors.push({ code: error, categoryId: category.id });
  }
  for (const categoryId of Object.keys(selections)) {
    if (!catalogue.categories.some((category) => category.id === categoryId)) {
      errors.push({ code: "unknown-category", categoryId });
    }
  }
  return { ok: errors.length === 0, errors };
}

function checkComponent(
  catalogue: Catalogue,
  bikeTypeId: string,
  categoryId: string,
  componentId: string,
): ComponentError | undefined {
  const component = catalogue.components.find((candidate) => candidate.id === componentId);
  if (!component) return "unknown-component";
  if (component.categoryId !== categoryId) return "wrong-category";
  const fitsType = catalogue.typeComponents.some(
    (link) => link.bikeTypeId === bikeTypeId && link.componentId === componentId,
  );
  if (!fitsType) return "off-type";
  if (component.stock <= 0) return "out-of-stock";
  return undefined;
}
