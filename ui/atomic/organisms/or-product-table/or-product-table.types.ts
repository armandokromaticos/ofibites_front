import { Product } from "@/domain/types";

export interface OrProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isLoading?: boolean;
}
