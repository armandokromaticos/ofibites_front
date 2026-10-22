"use client";

import { cn, Select, SelectItem } from "@heroui/react";

import { MlSearchBar } from "@/ui/atomic/molecules";

import { OrMemberFiltersBarOption, OrMemberFiltersBarProps } from "./or-member-filters-bar.types";

const SELECT_CLASSNAMES = {
  base: "w-full sm:w-auto sm:min-w-[170px]",
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
}: {
  label: string;
  options: OrMemberFiltersBarOption[];
  value: string;
  onChange: (value: string) => void;
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
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3", className)}>
      <MlSearchBar
        variant="catalog"
        label="Buscar usuario o correo"
        placeholder="Buscar usuario o correo"
        value={search}
        onValueChange={onSearchChange}
        className="sm:flex-1"
      />
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect label="Estado" options={statusOptions} value={statusValue} onChange={onStatusChange} />
        <FilterSelect label="Ordenar por" options={sortOptions} value={sortValue} onChange={onSortChange} />
      </div>
    </div>
  );
}
