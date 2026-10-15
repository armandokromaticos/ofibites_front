import { ButtonProps } from "@heroui/react";

/** Escala del Figma: xs h26/11px · sm h32/12px · md h37/12px · lg h60/16px. */
export type AtButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * Props de HeroUI `Button` con la escala de tamaños del Figma.
 * Por defecto: `color="primary"`, `radius="full"`, `size="md"`, Inter semibold.
 *
 * Botón ghost del Figma ("Ver detalle"): `variant="light"` + `className="text-ghost-foreground"`
 * (sin `color`, o `color="default"`).
 */
export type AtButtonProps = Omit<ButtonProps, "size"> & {
  size?: AtButtonSize;
};
