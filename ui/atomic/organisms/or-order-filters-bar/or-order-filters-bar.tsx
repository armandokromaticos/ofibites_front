"use client";

import { cn, Select, SelectItem } from "@heroui/react";

import { SELECT_POPOVER_PROPS } from "@/ui/atomic/atoms";
import { MlSearchBar } from "@/ui/atomic/molecules";

import { OrOrderFiltersBarOption, OrOrderFiltersBarProps } from "./or-order-filters-bar.types";

// Figma 3562:1385: píldora de 40 px con "Estado: Todos" dentro (texto `primary` de 13 px), borde `track` en reposo
// y fondo `brand-tint` con borde `brand` cuando el filtro no está en su valor por defecto (3564:1251).
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
  isLoading,
  isActive,
}: {
  label: string;
  options: OrOrderFiltersBarOption[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
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
      isLoading={isLoading}
      onChange={(event) => {
        if (event.target.value) onChange(event.target.value);
      }}
      // La etiqueta va dentro del valor ("Fecha: Últimos 30 días"); el nombre accesible lo da `aria-label`.
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
 * Filtros de "Pedidos realizados" (Figma 3562:1180): buscador libre + 4 dropdowns (Estado, Fecha, Sede,
 * Usuario). Todo se aplica en cliente sobre la página de pedidos ya cargada (ver DECISIONES T-28b): el back
 * aún no filtra ni pagina `GET /orders`.
 */
export function OrOrderFiltersBar({
  search,
  onSearchChange,
  statusOptions,
  statusValue,
  onStatusChange,
  dateOptions,
  dateValue,
  defaultDateValue,
  onDateChange,
  branchOptions,
  branchValue,
  onBranchChange,
  isLoadingBranches,
  userOptions,
  userValue,
  onUserChange,
  className,
}: OrOrderFiltersBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 xl:flex-row xl:items-center", className)}>
      <MlSearchBar
        variant="catalog"
        label="Buscar pedido por número, usuario o producto"
        placeholder="Buscar pedido por número, usuario o producto"
        value={search}
        onValueChange={onSearchChange}
        // Dentro de la card blanca de la tabla: buscador crema de 40 px y sin borde (Figma 3562:1382); el foco
        // sigue con su anillo.
        className="xl:min-w-[260px] xl:flex-1 [&_[data-slot=input-wrapper]]:h-10 [&_[data-slot=input-wrapper]]:min-h-10 [&_[data-slot=input-wrapper]]:bg-background [&_[data-slot=input-wrapper]]:border-transparent"
      />
      <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap">
        <FilterSelect
          label="Estado"
          options={statusOptions}
          value={statusValue}
          onChange={onStatusChange}
          isActive={statusValue !== "all"}
        />
        <FilterSelect
          label="Fecha"
          options={dateOptions}
          value={dateValue}
          onChange={onDateChange}
          isActive={defaultDateValue !== undefined && dateValue !== defaultDateValue}
        />
        <FilterSelect
          label="Sede"
          options={branchOptions}
          value={branchValue}
          onChange={onBranchChange}
          isLoading={isLoadingBranches}
          isActive={branchValue !== "all"}
        />
        <FilterSelect
          label="Usuario"
          options={userOptions}
          value={userValue}
          onChange={onUserChange}
          isActive={userValue !== "all"}
        />
      </div>
    </div>
  );
}
