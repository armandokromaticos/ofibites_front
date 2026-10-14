import { cn } from "@heroui/react";

import { MlFormAlertProps } from "./ml-form-alert.types";

/**
 * Alerta de error de formulario (Figma 3388:2250, "Alert / error"): fondo blanco, borde `accent`,
 * radio 16 y punto `accent`. Lleva `role="alert"` para anunciarse al aparecer.
 * El título va en `secondary-600` y no en `accent`: el accent sobre blanco da 4,0:1 y no llega a AA en 13 px.
 */
export function MlFormAlert({ title, children, id, className }: MlFormAlertProps) {
  return (
    <div
      id={id}
      role="alert"
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border border-accent bg-content1 px-4 py-3.5",
        "text-[13px] font-semibold leading-[18px] text-primary",
        className,
      )}
    >
      <span aria-hidden="true" className="mt-[5px] size-2 shrink-0 rounded-full bg-accent" />
      <p>
        {title && <span className="text-secondary-600">{title}</span>}
        {title && children ? " " : null}
        {children}
      </p>
    </div>
  );
}
