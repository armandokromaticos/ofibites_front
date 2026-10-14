import { UserDetail } from "@/domain/types";

export interface OrUserTableProps {
  users: UserDetail[];
  onEdit: (user: UserDetail) => void;
  onDelete?: (user: UserDetail) => void;
  isLoading?: boolean;
}
