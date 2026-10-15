"use client";

import { Button, cn } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";

import { AtPasswordToggleProps } from "./at-password-toggle.types";

/**
 * Botón de mostrar/ocultar contraseña dentro de `AtInput` (`endContent`): 40 × 40, radio 12, sin
 * borde ni fondo, icono `muted` de 20 y hover `surface-sand`. Es el aspecto que tenía en el login
 * como `AtIconButton` con clases sobrescritas. Lleva `aria-pressed` según `isVisible`.
 */
export function AtPasswordToggle({ isVisible, className, ...props }: AtPasswordToggleProps) {
  return (
    <Button
      isIconOnly
      variant="bordered"
      aria-pressed={isVisible}
      className={cn(
        "size-10 min-w-10 rounded-control border-0 bg-transparent text-muted",
        "data-[hover=true]:bg-surface-sand data-[hover=true]:opacity-100 [&_svg]:size-5",
        className,
      )}
      {...props}
    >
      {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
    </Button>
  );
}
