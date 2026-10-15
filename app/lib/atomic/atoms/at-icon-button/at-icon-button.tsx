"use client";

import { useEffect, useRef } from "react";

import { Badge, Button, cn } from "@heroui/react";

import { AtIconButtonProps } from "./at-icon-button.types";

function hasContent(content: AtIconButtonProps["badgeContent"]): boolean {
  return content !== undefined && content !== null && content !== "" && content !== 0;
}

export function AtIconButton({
  badgeContent,
  badgePing = false,
  className,
  children,
  ...props
}: AtIconButtonProps) {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const previousContent = useRef(badgeContent);
  const hasBadge = hasContent(badgeContent);

  // "Bump" al cambiar el contador (no al montar ni al aparecer: eso ya lo hace la escala de entrada).
  useEffect(() => {
    const previous = previousContent.current;
    previousContent.current = badgeContent;
    const badge = badgeRef.current;
    const isCountChange = previous !== badgeContent && hasContent(previous) && hasContent(badgeContent);
    if (!badge || !isCountChange) return;
    badge.classList.remove("ofi-bump");
    // Forzar reflow para reiniciar la animación si el contador cambia dos veces seguidas.
    badge.getBoundingClientRect();
    badge.classList.add("ofi-bump");
  }, [badgeContent]);

  const button = (
    <Button
      isIconOnly
      variant="bordered"
      className={cn(
        "size-10 min-w-10 rounded-control border-1 border-border-subtle bg-content1 text-foreground-strong",
        "data-[hover=true]:bg-background data-[hover=true]:opacity-100 data-[hover=true]:shadow-lift",
        // Se encoge al pulsar. HeroUI no transiciona la sombra. La subida de 2 px va en el wrapper del
        // Badge (abajo) para que botón y contador suban juntos.
        "transition-[scale,box-shadow,background-color,border-color]! duration-(--duration-fast)! ease-out!",
        "data-[pressed=true]:scale-95",
        "motion-reduce:data-[pressed=true]:scale-100",
        "[&_svg]:size-5",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );

  // El Badge se monta siempre (invisible sin contador) para que aparezca con escala y no de golpe.
  // El número ya va en el aria-label del botón: el badge es solo visual.
  return (
    <Badge
      ref={badgeRef}
      content={hasBadge ? badgeContent : ""}
      isInvisible={!hasBadge}
      color="primary"
      size="sm"
      placement="top-right"
      shape="rectangle"
      classNames={{
        base: cn(
          "transition-[translate] duration-(--duration-fast) ease-out",
          "motion-safe:has-[[data-hover=true]:not([data-pressed=true])]:-translate-y-0.5",
        ),
        badge: cn(
          "text-[11px] font-semibold border-content1",
          "transition-[scale,opacity]! duration-(--duration-base)! ease-spring!",
          "motion-reduce:transition-[opacity]!",
          hasBadge && badgePing && "ofi-ping after:border-primary",
        ),
      }}
      aria-hidden="true"
    >
      {button}
    </Badge>
  );
}
