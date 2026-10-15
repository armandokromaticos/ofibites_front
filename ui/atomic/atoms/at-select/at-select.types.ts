import { SelectProps } from "@heroui/react";

/**
 * Props de HeroUI `Select` con el estilo de `AtInput` (píldora h57, fondo `background`,
 * borde `border-input`, Inter Semibold 16). Por defecto `variant="bordered"` y `radius="full"`.
 * Sin label visible, pasa `aria-label`.
 */
export type AtSelectProps<T extends object = object> = SelectProps<T>;
