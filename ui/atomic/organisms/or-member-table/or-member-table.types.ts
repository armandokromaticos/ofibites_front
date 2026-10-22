export interface OrMemberTableRow {
  id: string;
  name: string;
  email: string | null;
  roleLabel: string;
  departmentLabel: string;
  statusLabel: string;
  statusColor: "success" | "danger" | "warning";
  lastSeenLabel: string;
  editHref: string;
  /** Pendiente: nunca inició sesión. */
  canResendInvite: boolean;
  /** No pendiente (tiene cuenta activa). */
  canResetPassword: boolean;
  isActive: boolean;
}

export interface OrMemberTableProps {
  rows: OrMemberTableRow[];
  isLoading?: boolean;
  onResendInvite: (row: OrMemberTableRow) => void;
  onResetPassword: (row: OrMemberTableRow) => void;
  onToggleActive: (row: OrMemberTableRow) => void;
  /** Id del miembro con una acción del menú en curso: deshabilita su fila de "···". */
  busyMemberId?: string | null;
  className?: string;
}
