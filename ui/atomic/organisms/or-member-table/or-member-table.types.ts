import { ReactNode } from "react";

import { AtStatusChipTone } from "@/ui/atomic/atoms";

export interface OrMemberTableRow {
  id: string;
  name: string;
  email: string | null;
  roleLabel: string;
  departmentLabel: string;
  statusLabel: string;
  statusTone: AtStatusChipTone;
  lastSeenLabel: string;
  editHref: string;
  /** Pendiente: nunca inició sesión. */
  canResendInvite: boolean;
  /** No pendiente (tiene cuenta activa). */
  canResetPassword: boolean;
  isActive: boolean;
  /**
   * Fila del usuario autenticado: no se ofrece "Desactivar usuario" (el back responde 403 "No puedes
   * desactivar tu propia cuenta."). La opción queda deshabilitada con el motivo y el nombre lleva "(tú)".
   */
  isSelf?: boolean;
}

export interface OrMemberTableProps {
  rows: OrMemberTableRow[];
  isLoading?: boolean;
  onResendInvite: (row: OrMemberTableRow) => void;
  onResetPassword: (row: OrMemberTableRow) => void;
  onToggleActive: (row: OrMemberTableRow) => void;
  /** Id del miembro con una acción del menú en curso: deshabilita su fila de "···". */
  busyMemberId?: string | null;
  /** Dentro de la tabla cuando no hay filas (p. ej. el vacío de "sin resultados"). */
  emptyContent?: ReactNode;
  /** Encima de la cabecera, dentro de la card (barra de filtros). */
  topContent?: ReactNode;
  /** Al pie, dentro de la card (contador y paginación). */
  bottomContent?: ReactNode;
  className?: string;
}
