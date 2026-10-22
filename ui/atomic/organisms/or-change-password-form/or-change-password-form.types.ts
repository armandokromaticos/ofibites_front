export interface OrChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

/** Errores del servidor asociados a un campo (p. ej. "La contraseña actual no es correcta"). */
export interface OrChangePasswordServerErrors {
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Pide enfocar un campo (p. ej. tras un error del servidor, que no se anuncia solo). Cada petición nueva lleva
 * un `id` distinto; `select` selecciona el texto (volver a escribir la actual).
 */
export interface OrChangePasswordFocusRequest {
  id: number;
  field: keyof OrChangePasswordServerErrors;
  select?: boolean;
}

export interface OrChangePasswordFormProps {
  /**
   * Solo se llama con la actual escrita, una nueva que cumple la política, distinta de la actual y confirmada.
   * Para vaciar el formulario tras un cambio correcto, vuelve a montarlo (`key`).
   */
  onSubmit: (values: OrChangePasswordFormValues) => void;
  isSubmitting?: boolean;
  /** Error del servidor sin campo (red, 429...), en el aviso de arriba. */
  formError?: string | null;
  serverErrors?: OrChangePasswordServerErrors;
  focusRequest?: OrChangePasswordFocusRequest | null;
  /** Al editar cualquier campo: para limpiar los errores del servidor. */
  onEdit?: () => void;
  /** "Última vez que la cambiaste: 03/07/2026". Sin valor no se pinta. */
  lastChangedLabel?: string;
  className?: string;
}
