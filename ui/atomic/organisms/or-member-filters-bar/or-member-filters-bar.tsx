"use client";

import { cn, Select, SelectItem } from "@heroui/react";

import { SELECT_POPOVER_PROPS } from "@/ui/atomic/atoms";
import { MlSearchBar } from "@/ui/atomic/molecules";

import { OrMemberFiltersBarOption, OrMemberFiltersBarProps } from "./or-member-filters-bar.types";

// Igual que `OrOrderFiltersBar` (Figma 3562:1385 / 3463:2171): píldora de 40 px con "Estado: Todos" dentro (texto
// `primary` de 13 px), borde `track` en reposo y fondo `brand-tint` con borde `brand` cuando el filtro está activo.
const SELECT_CLASSNAMES = {
  base: "w-full sm:w-auto",
  trigger: "h-10 min-h-10 gap-2 border-small px-4 pe-9 shadow-none",
  value: "text-[13px] font-normal text-primary",
  selectorIcon: "end-3 text-placeholder",
  innerWrapper: "w-auto",
};
const TRIGGER_IDLE = "bg-content1 border-track data-[hover=true]:border-border-input";
const TRIGGER_ACTIVE = "bg-brand-tint border-brand data-[hover=true]:border-brand";

function FilterSelect({
  label,
  options,
  value,
  onChange,
  isActive,
}: {
  label: string;
  options: OrMemberFiltersBarOption[];
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
}) {
  return (
    <Select
      aria-label={label}
      variant="bordered"
      radius="full"
      size="sm"
      selectedKeys={[value]}
      disallowEmptySelection
      onChange={(event) => {
        if (event.target.value) onChange(event.target.value);
      }}
      // La etiqueta va dentro del valor ("Ordenar por: Nombre"); el nombre accesible lo da `aria-label`.
      renderValue={(items) => `${label}: ${items[0]?.textValue ?? ""}`}
      classNames={{
        ...SELECT_CLASSNAMES,
        trigger: cn(SELECT_CLASSNAMES.trigger, isActive ? TRIGGER_ACTIVE : TRIGGER_IDLE),
      }}
      popoverProps={SELECT_POPOVER_PROPS}
    >
      {options.map((option) => (
        <SelectItem key={option.value} textValue={option.label}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}

/**
 * Filtros de "Administración de usuarios" (Figma `3463:2171`): buscador (nombre o correo), "Estado: Todos" y
 * "Ordenar por: Nombre". Todo se aplica en cliente sobre la lista completa de `GET .../members`.
 */
export function OrMemberFiltersBar({
  search,
  onSearchChange,
  statusOptions,
  statusValue,
  onStatusChange,
  sortOptions,
  sortValue,
  onSortChange,
  className,
}: OrMemberFiltersBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <MlSearchBar
        variant="catalog"
        label="Buscar usuario o correo"
        placeholder="Buscar usuario o correo"
        value={search}
        onValueChange={onSearchChange}
        // Dentro de la card blanca de la tabla: buscador crema de 40 px y sin borde, como el de pedidos.
        className="sm:min-w-[260px] sm:flex-1 [&_[data-slot=input-wrapper]]:h-10 [&_[data-slot=input-wrapper]]:min-h-10 [&_[data-slot=input-wrapper]]:bg-background [&_[data-slot=input-wrapper]]:border-transparent"
      />
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <FilterSelect
          label="Estado"
          options={statusOptions}
          value={statusValue}
          onChange={onStatusChange}
          isActive={statusValue !== "all"}
        />
        {/* El orden no es un filtro: no se resalta al cambiarlo. */}
        <FilterSelect
          label="Ordenar por"
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
          isActive={false}
        />
      </div>
    </div>
  );
}
