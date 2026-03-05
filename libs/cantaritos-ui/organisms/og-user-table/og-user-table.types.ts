import { UserDetail } from "@/domain/types";

export interface OgUserTableProps {
  users: UserDetail[];
  onEdit: (user: UserDetail) => void;
  onDelete?: (user: UserDetail) => void;
  isLoading?: boolean;
}
