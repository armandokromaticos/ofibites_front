import { cn } from "@heroui/react";

import { AtMenuIconProps } from "./at-menu-icon.types";

/** Cada línea gira y se desplaza sobre su propio centro; con movimiento reducido cambia al instante. */
const LINE = cn(
  "origin-center [transform-box:fill-box]",
  "motion-safe:transition-[translate,rotate,opacity] motion-safe:duration-(--duration-fast) motion-safe:ease-in-out",
);

/**
 * Icono del menú del diseño: cuatro barras de 20×20, la 2.ª y la 4.ª al 40 % y la última corta. Con `isOpen`
 * se transforma en una X centrada (la 1.ª baja 8,9 px y la 3.ª sube 3 px antes de girar). Color: `currentColor`.
 */
export function AtMenuIcon({ isOpen = false, className }: AtMenuIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.222}
      strokeLinecap="round"
      className={cn("size-5", className)}
    >
      <path d="M1.111 1.111h17.778" className={cn(LINE, isOpen && "translate-y-[8.889px] rotate-45")} />
      <path d="M1.111 7.037h17.778" className={cn(LINE, isOpen ? "opacity-0" : "opacity-40")} />
      <path d="M1.111 12.963h17.778" className={cn(LINE, isOpen && "-translate-y-[2.963px] -rotate-45")} />
      <path d="M1.111 18.889H10" className={cn(LINE, isOpen ? "opacity-0" : "opacity-40")} />
    </svg>
  );
}
