export interface OrAvatarUploadModalProps {
  isOpen: boolean;
  /** Cancelar, Esc o clic fuera. No se llama mientras se prepara o se sube la foto. */
  onClose: () => void;
  /**
   * Recorte listo para subir: cuadrado de 512 × 512 en JPEG (o PNG si el original es PNG con transparencia).
   * Quien usa el modal sube el archivo y lo cierra al terminar.
   */
  onSave: (file: File) => void;
  /** La subida está en curso: "Guardar foto" en loading y el modal no se puede cerrar. */
  isSaving?: boolean;
  /** Error del servidor al subir; se anuncia en el paso de recorte y deja reintentar. */
  saveError?: string | null;
  /** Se cambió de imagen o de paso: quien usa el modal puede limpiar `saveError`. */
  onEdit?: () => void;
}
