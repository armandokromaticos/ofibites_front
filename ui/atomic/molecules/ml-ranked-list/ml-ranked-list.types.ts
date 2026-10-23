export interface MlRankedListItem {
  key: string;
  label: string;
  /** Ya formateado ("31×"). */
  quantityLabel: string;
}

export interface MlRankedListProps {
  items: MlRankedListItem[];
  className?: string;
}
