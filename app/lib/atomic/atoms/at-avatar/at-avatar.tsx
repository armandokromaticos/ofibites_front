"use client";

import { Avatar, cn } from "@heroui/react";

import { AtAvatarProps, AtAvatarSize } from "./at-avatar.types";

const SIZE_CLASS: Record<AtAvatarSize, string> = {
  md: "size-10 text-sm",
};

/**
 * Foto de perfil redonda (Figma `Avatar`, 40 px) con el borde opcional del Figma: 1 px `divider` por dentro,
 * pintado encima de la foto (un `ring` inset quedaría debajo de la imagen). Sin foto, iniciales sobre
 * `brand-soft`. No es interactivo: si algún día abre un menú, se envuelve en un botón.
 */
export function AtAvatar({ name, src, size = "md", isDecorative = false, className }: AtAvatarProps) {
  // Sin nombre no hay nada que anunciar (HeroUI pondría "avatar" como texto alternativo).
  const isHidden = isDecorative || !name.trim();

  return (
    <Avatar
      src={src}
      name={name}
      alt={isHidden ? "" : name}
      aria-hidden={isHidden || undefined}
      showFallback
      // Sin foto, HeroUI pinta las iniciales en un <span role="img" aria-label={alt}> con la clase del slot
      // `name`: el nombre accesible del fallback sale de `alt`, no de `classNames`. Si se sustituye el slot
      // `name` o se pasa `fallback`, hay que conservar ese `aria-label`.
      classNames={{
        base: cn(
          "shrink-0 bg-brand-soft text-brand",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border after:border-divider",
          SIZE_CLASS[size],
          className,
        ),
        name: "font-semibold",
      }}
    />
  );
}
