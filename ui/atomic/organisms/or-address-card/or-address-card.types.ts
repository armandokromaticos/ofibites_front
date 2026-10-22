export interface OrAddressCardProps {
  /** Nombre corto de la sede ("Torre Principal"). */
  label: string;
  /** Badge "Sede principal" (Figma `3657:2154`). `undefined`/`false` mientras T-31a (back) no la implemente. */
  isPrimary?: boolean;
  /** Dirección completa ya formateada ("Av. ..., piso 8. Caracas, Distrito Capital."). */
  addressLine: string;
  /** "Referencia: ... · Recibe: ... · <teléfono>"; `null`/`undefined` si no hay nada que mostrar. */
  referenceContactLine?: string | null;
  /** Solo COMPANY_ADMIN: muestra "Editar"/"Eliminar". El resto ve la lista de solo lectura. */
  canManage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}
