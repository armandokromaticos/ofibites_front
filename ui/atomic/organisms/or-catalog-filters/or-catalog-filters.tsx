"use client";

import { cn } from "@heroui/react";

import { AtCheckbox, AtSkeleton } from "@/ui/atomic/atoms";
import { MlFilterChips } from "@/ui/atomic/molecules";

import { OrCatalogFiltersProps } from "./or-catalog-filters.types";

/**
 * Filtros del catálogo (Ordenar, Figma 3067:17606): "Filtros" con píldoras (activa en `nav-active`) y
 * "Preferencias" con casillas (un ítem debe tener todas las marcadas). Los cambios se aplican al momento.
 */
export function OrCatalogFilters<F extends string>({
  filterOptions,
  filter,
  onFilterChange,
  preferences,
  selectedPreferences,
  onPreferencesChange,
  isLoadingPreferences = false,
  layout = "column",
  headingLevel = 2,
  idPrefix,
  className,
}: OrCatalogFiltersProps<F>) {
  const Heading = `h${headingLevel}` as const;
  const isColumn = layout === "column";
  const filtersId = `${idPrefix}-filtros`;
  const preferencesId = `${idPrefix}-preferencias`;

  const togglePreference = (id: string, isSelected: boolean) => {
    onPreferencesChange(
      isSelected
        ? [...selectedPreferences, id]
        : selectedPreferences.filter((selected) => selected !== id),
    );
  };

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <section aria-labelledby={filtersId} className="flex flex-col gap-4">
        <Heading id={filtersId} className="text-base font-semibold text-foreground">
          Filtros
        </Heading>
        <MlFilterChips
          label="Filtrar productos"
          appearance="pills"
          orientation={isColumn ? "vertical" : "horizontal"}
          options={filterOptions}
          value={filter}
          onChange={onFilterChange}
          className={isColumn ? undefined : "flex-wrap overflow-visible"}
        />
      </section>

      <section aria-labelledby={preferencesId} className="flex flex-col gap-4">
        <Heading id={preferencesId} className="text-base font-semibold text-foreground">
          Preferencias
        </Heading>
        {isLoadingPreferences ? (
          <div aria-hidden="true" className="flex flex-col gap-4">
            {[56, 80, 72, 60].map((width) => (
              <AtSkeleton key={width} className="h-5 rounded-full" style={{ width }} />
            ))}
          </div>
        ) : preferences.length === 0 ? (
          <p className="text-sm text-muted">Sin preferencias disponibles.</p>
        ) : (
          <ul aria-labelledby={preferencesId} className={cn("flex gap-4", isColumn ? "flex-col" : "flex-wrap gap-x-6")}>
            {preferences.map((preference) => (
              <li key={preference.id}>
                <AtCheckbox
                  isSelected={selectedPreferences.includes(preference.id)}
                  onValueChange={(isSelected) => togglePreference(preference.id, isSelected)}
                  classNames={{
                    base: "items-center gap-2",
                    wrapper: "mt-0 bg-content1",
                    label: "text-sm font-normal text-foreground",
                  }}
                >
                  {preference.name}
                </AtCheckbox>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
