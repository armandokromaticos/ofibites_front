import { CompanyRole } from "@/domain/types";
import { AtStatusChipTone } from "@/ui/atomic/atoms";

export interface OrMemberFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  /** `""` = sin departamento. */
  departmentId: string;
  /** `""` = sin sede. */
  branchId: string;
  role: CompanyRole | "";
}

export type OrMemberFormField = keyof OrMemberFormValues;

export type OrMemberFormErrors = Partial<Record<OrMemberFormField, string>>;

export interface OrMemberFormOption {
  id: string;
  name: string;
}

/** Cabecera de "Editar usuario" (Figma `3511:9089`): no existe en "Añadir usuario". */
export interface OrMemberFormHeader {
  name: string;
  email: string | null;
  /** "Activo" / "Inactivo" / "Pendiente", ya traducido (ver `domain/models` → `MEMBER_STATUS_LABELS`). */
  statusLabel: string;
  statusTone: AtStatusChipTone;
  lastSeenLabel: string;
  createdLabel?: string | null;
}

export interface OrMemberFormProps {
  mode: "create" | "edit";
  values: OrMemberFormValues;
  errors?: OrMemberFormErrors;
  onChange: <F extends OrMemberFormField>(field: F, value: OrMemberFormValues[F]) => void;
  departmentOptions: OrMemberFormOption[];
  branchOptions: OrMemberFormOption[];
  roleOptions: { value: CompanyRole; label: string }[];
  isLoadingDepartments?: boolean;
  isLoadingBranches?: boolean;
  /** Solo `mode="edit"`. */
  header?: OrMemberFormHeader;
  /** Solo `mode="edit"`: switch "Estado". */
  isActive?: boolean;
  onActiveChange?: (isActive: boolean) => void;
  /**
   * Solo `mode="edit"`: motivo por el que no se puede desactivar (p. ej. "No puedes desactivar tu propia
   * cuenta."). Si viene y el usuario está activo, el switch "Estado" queda deshabilitado con el motivo
   * visible (y enlazado con `aria-describedby`) y no se pinta el botón "Desactivar usuario".
   */
  deactivateBlockedReason?: string | null;
  formError?: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  /** Texto del botón secundario. Por defecto "Cancelar" (el onboarding usa "Continuar más tarde"). */
  cancelLabel?: string;
  /**
   * Título de la sección. Por defecto "Datos de la persona". `null` lo quita (el modal de invitar del onboarding
   * ya lleva su propio título).
   */
  title?: string | null;
  /** Oculta "Departamento" (invitar desde el onboarding, T-34). */
  hideDepartment?: boolean;
  /** Oculta "Sede a la que pertenece" (onboarding, T-34: «Sede asignada» se omite, decisión 2026-11-03). */
  hideBranch?: boolean;
  /** Solo `mode="edit"`: "Desactivar usuario" / "Reactivar usuario" a la izquierda del pie. */
  onDeactivateClick?: () => void;
  deactivateLabel?: string;
  className?: string;
}
