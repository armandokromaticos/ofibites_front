import { ModifierGroup } from "@/domain/types";

export interface MlModifierGroupCardProps {
  group: ModifierGroup;
  onEdit: (group: ModifierGroup) => void;
  onRemove?: (group: ModifierGroup) => void;
}
