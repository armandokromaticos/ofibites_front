import { CompanyAddressType } from "@/domain/types";

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
  /** T-34: chips "¿Qué tipo de sede es?" (Oficina/Depósito/Otro); `null` = sin indicar. */
  type: CompanyAddressType | null;
}

export type OrAddressFormModalField = keyof OrAddressFormModalValues;

/** Campos de texto (los que validan y muestran error). */
export type OrAddressFormModalTextField = Exclude<OrAddressFormModalField, "isPrimary" | "type">;

export type OrAddressFormModalErrors = Partial<Record<OrAddressFormModalTextField, string>>;

export interface OrAddressFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  values: OrAddressFormModalValues;
  errors?: OrAddressFormModalErrors;
  onChange: <F extends OrAddressFormModalField>(field: F, value: OrAddressFormModalValues[F]) => void;
  /** Título del modal. Por defecto "Añadir sede" / "Editar sede" (Mi perfil); el onboarding usa "Agregar sede". */
  title?: string;
  /** Botón de guardar en `create`. Por defecto "Guardar dirección"; el onboarding usa "Guardar sede". */
  createSubmitLabel?: string;
  /** Texto bajo el título. Por defecto, el de Mi perfil según el modo. */
  description?: string;
  /** Error del servidor (p. ej. 403), en una alerta sobre los campos. */
  formError?: string | null;
  isSubmitting?: boolean;
  /** Solo se llama con los campos válidos: la validación de requeridos/longitud vive en quien usa el modal. */
  onSubmit: () => void;
  onClose: () => void;
  /** Solo `mode="edit"`: abre la confirmación de borrado (Figma `3658:2360`, botón "Eliminar sede"). */
  onDeleteClick?: () => void;
}
