import type { CatalogueRepository } from "@/domain/catalogue/catalogue-repository";
import { catalogueData } from "./catalogue-data";

/** Catalogue adapter backed by static data in code. */
export const staticCatalogueRepository: CatalogueRepository = {
  getCatalogue: async () => catalogueData,
};
