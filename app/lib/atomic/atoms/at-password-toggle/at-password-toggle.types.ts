import { ButtonProps } from "@heroui/react";

export type AtPasswordToggleProps = Omit<ButtonProps, "isIconOnly" | "aria-label" | "children"> & {
  /** Nombre accesible fijo (p. ej. "Mostrar contraseña"); el estado lo da `aria-pressed`. */
  "aria-label": string;
  isVisible: boolean;
};
