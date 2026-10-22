export interface OrMemberFiltersBarOption {
  value: string;
  label: string;
}

export interface OrMemberFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: OrMemberFiltersBarOption[];
  statusValue: string;
  onStatusChange: (value: string) => void;
  sortOptions: OrMemberFiltersBarOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  className?: string;
}
