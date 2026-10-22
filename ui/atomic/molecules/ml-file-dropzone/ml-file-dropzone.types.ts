import { Ref } from "react";

export interface MlFileDropzoneProps {
  /** "Arrastra la imagen aquí" (o "Arrastra otra imagen" tras un archivo no válido). */
  title: string;
  /** Texto del botón que abre el selector de archivos: también es el nombre accesible del input. */
  browseLabel: string;
  /** `accept` del input (`"image/jpeg,image/png,.jpg,.jpeg,.png"`). Solo filtra el selector: valida igual. */
  accept?: string;
  /** Un archivo, venga del selector o soltado en la zona. Con varios soltados, el primero. */
  onFileSelect: (file: File) => void;
  /** Archivo rechazado: borde y fondo de error. */
  isInvalid?: boolean;
  isDisabled?: boolean;
  /** `id` del input (si no, uno generado). */
  id?: string;
  /** Ids de la ayuda y del error que describen el input (`aria-describedby`). */
  describedBy?: string;
  /** Ref del input, para devolverle el foco (p. ej. al volver de otro paso). */
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
}
