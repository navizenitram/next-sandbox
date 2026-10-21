import type { Catalogue } from "./catalogue";

/** Port: where the catalogue comes from (static data today, a database later). */
export interface CatalogueRepository {
  getCatalogue(): Promise<Catalogue>;
}
