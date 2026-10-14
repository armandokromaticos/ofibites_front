import { ProductSize } from "@/domain/types";

export interface MlSizeRowProps {
  size?: ProductSize;
  onSave: (values: { name: string; price: number; stock?: number | null }) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}
