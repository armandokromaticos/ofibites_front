import { CompanyRole } from "@/domain/types";

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
  statusColor: "success" | "danger" | "warning";
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
  formError?: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  /** Solo `mode="edit"`: "Desactivar usuario" / "Reactivar usuario" a la izquierda del pie. */
  onDeactivateClick?: () => void;
  deactivateLabel?: string;
  className?: string;
}
