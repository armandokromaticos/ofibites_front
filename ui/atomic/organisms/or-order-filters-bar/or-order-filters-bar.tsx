"use client";

import { cn, Select, SelectItem } from "@heroui/react";

import { MlSearchBar } from "@/ui/atomic/molecules";

import { OrOrderFiltersBarOption, OrOrderFiltersBarProps } from "./or-order-filters-bar.types";

const SELECT_CLASSNAMES = {
  base: "w-full sm:w-auto sm:min-w-[160px]",
  label: "text-[13px] font-normal text-muted",
  trigger: "h-10 min-h-10 bg-content1 border-small border-divider data-[hover=true]:border-border-input",
  value: "text-[13px] font-medium text-foreground",
  selectorIcon: "text-muted",
};

function FilterSelect({
  label,
  options,
  value,
  onChange,
  isLoading,
}: {
  label: string;
  options: OrOrderFiltersBarOption[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}) {
  return (
    <Select
      aria-label={label}
      label={label}
      labelPlacement="outside-left"
      variant="bordered"
      radius="full"
      size="sm"
      selectedKeys={[value]}
      disallowEmptySelection
      isLoading={isLoading}
      onChange={(event) => {
        if (event.target.value) onChange(event.target.value);
      }}
      classNames={SELECT_CLASSNAMES}
    >
      {options.map((option) => (
        <SelectItem key={option.value}>{option.label}</SelectItem>
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
    <div className={cn("flex flex-col gap-4", className)}>
      <MlSearchBar
        variant="catalog"
        label="Buscar pedido por número, usuario o producto"
        placeholder="Buscar pedido por número, usuario o producto"
        value={search}
        onValueChange={onSearchChange}
      />
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect label="Estado" options={statusOptions} value={statusValue} onChange={onStatusChange} />
        <FilterSelect label="Fecha" options={dateOptions} value={dateValue} onChange={onDateChange} />
        <FilterSelect
          label="Sede"
          options={branchOptions}
          value={branchValue}
          onChange={onBranchChange}
          isLoading={isLoadingBranches}
        />
        <FilterSelect label="Usuario" options={userOptions} value={userValue} onChange={onUserChange} />
      </div>
    </div>
  );
}
