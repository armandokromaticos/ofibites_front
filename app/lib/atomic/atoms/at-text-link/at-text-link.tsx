import Link from "next/link";

import { cn } from "@heroui/react";

import { AtTextLinkProps } from "./at-text-link.types";

/**
 * Estilo de los enlaces de texto de las pantallas de acceso ("Olvidé la contraseña", "Volver al
 * inicio de sesión"): subrayado, hereda color y tamaño del contenedor y foco visible.
 */
export const AT_TEXT_LINK_CLASSES =
  "rounded-sm underline underline-offset-4 hover:text-primary " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function AtTextLink({ className, ...props }: AtTextLinkProps) {
  return <Link className={cn(AT_TEXT_LINK_CLASSES, className)} {...props} />;
}
