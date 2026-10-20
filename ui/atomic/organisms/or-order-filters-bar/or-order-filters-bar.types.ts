export interface OrOrderFiltersBarOption {
  value: string;
  label: string;
}

export interface OrOrderFiltersBarProps {
  /** "Buscar pedido por número, usuario o producto" (Figma). Filtra en cliente sobre la página cargada. */
  search: string;
  onSearchChange: (value: string) => void;

  /** "Todos" + los grupos de estado (sin "Cancelado" como opción de filtro). */
  statusOptions: OrOrderFiltersBarOption[];
  statusValue: string;
  onStatusChange: (value: string) => void;

  dateOptions: OrOrderFiltersBarOption[];
  dateValue: string;
  onDateChange: (value: string) => void;

  branchOptions: OrOrderFiltersBarOption[];
  branchValue: string;
  onBranchChange: (value: string) => void;
  isLoadingBranches?: boolean;

  userOptions: OrOrderFiltersBarOption[];
  userValue: string;
  onUserChange: (value: string) => void;

  className?: string;
}
