import { MlFilterChipsOption } from "@/ui/atomic/molecules";

export interface OrCatalogFiltersPreference {
  id: string;
  name: string;
}

export interface OrCatalogFiltersProps<F extends string = string> {
  /** Filtros de lista (Todo · En oferta · Nuevos): uno a la vez. */
  filterOptions: MlFilterChipsOption<F>[];
  filter: F;
  onFilterChange: (value: F) => void;
  /** Preferencias (tags). Mientras cargan, `isLoadingPreferences`. */
  preferences: OrCatalogFiltersPreference[];
  selectedPreferences: string[];
  onPreferencesChange: (ids: string[]) => void;
  isLoadingPreferences?: boolean;
  /** `column`: columna lateral de escritorio (filtros apilados). `panel`: dentro del panel móvil (en fila). */
  layout?: "column" | "panel";
  /** Nivel de los títulos "Filtros" y "Preferencias". Por defecto 2. */
  headingLevel?: 2 | 3;
  /** Prefijo de ids (dos instancias en la página: columna y panel). */
  idPrefix: string;
  className?: string;
}
