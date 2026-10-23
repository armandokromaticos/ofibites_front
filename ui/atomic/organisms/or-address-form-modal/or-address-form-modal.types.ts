export interface OrAddressFormModalValues {
  label: string;
  line1: string;
  city: string;
  state: string;
  reference: string;
  contactName: string;
  contactPhone: string;
  /** Switch "Marcar como sede principal". `isPrimary` de T-31a (back, PENDIENTE). */
  isPrimary: boolean;
}

export type OrAddressFormModalField = keyof OrAddressFormModalValues;

export type OrAddressFormModalErrors = Partial<Record<Exclude<OrAddressFormModalField, "isPrimary">, string>>;

export interface OrAddressFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  values: OrAddressFormModalValues;
  errors?: OrAddressFormModalErrors;
  onChange: <F extends OrAddressFormModalField>(field: F, value: OrAddressFormModalValues[F]) => void;
  /** Error del servidor (p. ej. 403), en una alerta sobre los campos. */
  formError?: string | null;
  isSubmitting?: boolean;
  /** Solo se llama con los campos válidos: la validación de requeridos/longitud vive en quien usa el modal. */
  onSubmit: () => void;
  onClose: () => void;
  /** Solo `mode="edit"`: abre la confirmación de borrado (Figma `3658:2360`, botón "Eliminar sede"). */
  onDeleteClick?: () => void;
}
