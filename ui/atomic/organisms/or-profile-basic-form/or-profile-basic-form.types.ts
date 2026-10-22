export interface OrProfileBasicFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
}

export type OrProfileBasicFormField = keyof OrProfileBasicFormValues;

export interface OrProfileBasicFormProps {
  /** Valores actuales (controlados por la página, que sabe si hay cambios y los descarta). */
  values: OrProfileBasicFormValues;
  onChange: (field: OrProfileBasicFormField, value: string) => void;
  /** Nombre completo guardado: iniciales de la foto de perfil. */
  name: string;
  avatarSrc?: string;
  /** Abre el modal de subir/recortar foto (T-30d). Sin foto: "Subir foto"; con foto: "Cambiar foto". */
  onUploadPhoto?: () => void;
  /** Quita la foto actual (`DELETE /auth/me/avatar`). Solo se muestra el botón si hay `avatarSrc`. */
  onRemovePhoto?: () => void;
  isRemovingPhoto?: boolean;
  /** Error al quitar la foto, en una alerta propia bajo el bloque de foto. */
  removePhotoError?: string | null;
  /** Datos que define la empresa (solo lectura). */
  email: string;
  departmentName: string | null;
  branchName: string | null;
  /** `false` si no hay membresía activa: el cargo vive en ella y no se muestra. Por defecto `true`. */
  showPosition?: boolean;
  /** "Última actualización: 12/09/2026". */
  updatedLabel?: string;
  /** Hay cambios sin guardar: activa "Guardar cambios" y "Descartar". */
  isDirty: boolean;
  isSubmitting?: boolean;
  /** Error del servidor, en una alerta sobre los campos. */
  formError?: string | null;
  /** Solo se llama con los campos válidos (nombre obligatorio y longitudes del contrato). */
  onSubmit: () => void;
  onDiscard: () => void;
  className?: string;
}
