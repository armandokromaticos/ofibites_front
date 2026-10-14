"use client";

import { Badge, Button, cn } from "@heroui/react";

import { AtIconButtonProps } from "./at-icon-button.types";

export function AtIconButton({
  badgeContent,
  className,
  children,
  ...props
}: AtIconButtonProps) {
  const button = (
    <Button
      isIconOnly
      variant="bordered"
      className={cn(
        "size-10 min-w-10 rounded-control border-1 border-border-subtle bg-content1 text-foreground-strong",
        "data-[hover=true]:bg-background data-[hover=true]:opacity-100",
        "[&_svg]:size-5",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );

  const hasBadge = badgeContent !== undefined && badgeContent !== null
    && badgeContent !== "" && badgeContent !== 0;

  if (!hasBadge) return button;

  // El número ya va en el aria-label del botón: el badge es solo visual.
  return (
    <Badge
      content={badgeContent}
      color="primary"
      size="sm"
      placement="top-right"
      shape="rectangle"
      classNames={{ badge: "text-[11px] font-semibold border-content1" }}
      aria-hidden="true"
    >
      {button}
    </Badge>
  );
}
