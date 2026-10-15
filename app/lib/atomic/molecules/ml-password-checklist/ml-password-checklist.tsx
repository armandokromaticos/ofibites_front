import { cn } from "@heroui/react";
import { Check, X } from "lucide-react";

import { MlPasswordChecklistProps } from "./ml-password-checklist.types";

/**
 * Checklist de requisitos de la contraseña (Figma 3236:12333): dos columnas, Inter 12 semibold.
 * Cumplido: check en `brand`. Pendiente: aspa en `secondary-600` (en el Figma, `accent`, que en
 * 12 px no llega a AA). Sin contraseña, neutro en `muted`. El estado no depende solo del color:
 * cambia el icono y hay un prefijo para lectores de pantalla.
 */
export function MlPasswordChecklist({
  rules,
  showStatus = true,
  id,
  className,
}: MlPasswordChecklistProps) {
  return (
    <ul
      id={id}
      aria-label="Requisitos de la contraseña"
      className={cn("grid w-full grid-cols-1 gap-x-3 gap-y-[7px] sm:grid-cols-2", className)}
    >
      {rules.map((rule) => {
        const state = !showStatus ? "idle" : rule.met ? "met" : "missing";
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-xs font-semibold leading-4",
              state === "met" && "text-brand",
              state === "missing" && "text-secondary-600",
              state === "idle" && "text-muted",
            )}
          >
            {state === "met" && <Check aria-hidden="true" className="size-3 shrink-0" strokeWidth={3} />}
            {state === "missing" && <X aria-hidden="true" className="size-3 shrink-0" strokeWidth={3} />}
            {state === "idle" && (
              <span aria-hidden="true" className="mx-[3px] size-1.5 shrink-0 rounded-full bg-current" />
            )}
            <span>
              {state !== "idle" && <span className="sr-only">{state === "met" ? "Cumple: " : "Falta: "}</span>}
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
