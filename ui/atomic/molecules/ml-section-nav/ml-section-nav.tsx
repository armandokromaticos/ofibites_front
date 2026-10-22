"use client";

import { MouseEvent } from "react";

import { cn } from "@heroui/react";

import { AtChip } from "@/ui/atomic/atoms";

import { MlSectionNavProps } from "./ml-section-nav.types";

const ITEM_BASE =
  "relative flex min-h-10 w-full items-center justify-between gap-2 rounded-full px-[27px] py-2.5 text-[13px] leading-5";

/**
 * Navegación vertical entre secciones de una página (Figma "Mi perfil" `3651:1921`): la activa con fondo
 * `brand-soft` claro, barra `primary` a la izquierda y texto semibold. Son enlaces (`aria-current="page"` en la
 * activa) para que cada sección tenga URL propia. Una sección sin `href` no es enlace: se lee "Pronto" y lleva
 * `aria-disabled`, sin recibir el foco (no hay nada que activar).
 */
export function MlSectionNav({ items, activeKey, onSelect, className, ...props }: MlSectionNavProps) {
  const handleClick = (key: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect(key, event);
  };

  return (
    <nav aria-label={props["aria-label"]} className={className}>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          if (!item.href) {
            return (
              <li key={item.key}>
                <span aria-disabled="true" className={cn(ITEM_BASE, "font-medium text-muted")}>
                  <span className="truncate">{item.label}</span>{" "}
                  <AtChip classNames={{ base: "shrink-0" }}>Pronto</AtChip>
                </span>
              </li>
            );
          }
          return (
            <li key={item.key}>
              <a
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={handleClick(item.key)}
                className={cn(
                  ITEM_BASE,
                  "transition-colors duration-(--duration-instant) ease-out",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  isActive
                    ? "bg-brand-soft/40 font-semibold text-foreground before:absolute before:left-[14px] before:h-4 before:w-0.5 before:rounded-full before:bg-primary before:content-['']"
                    : "font-medium text-foreground hover:bg-background",
                )}
              >
                <span className="truncate">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
