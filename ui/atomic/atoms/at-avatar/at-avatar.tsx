"use client";

import { Avatar, cn } from "@heroui/react";

import { AtAvatarProps, AtAvatarSize } from "./at-avatar.types";

const SIZE_CLASS: Record<AtAvatarSize, string> = {
  md: "size-10 text-sm",
};

/**
 * Iniciales: primera letra de las dos primeras palabras que tengan letras (separadas por espacio, guion, `_` o `.`,
 * como HeroUI: "José-Luis" → "JL"). HeroUI toma el primer carácter de cada palabra, así que "Ana Demo (Admin)"
 * daba "AD(".
 */
function getInitials(name: string): string {
  return name
    .split(/[\s\-_.]+/)
    .map((word) => word.match(/\p{L}/u)?.[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Foto de perfil redonda (Figma `Avatar`, 40 px) con el borde opcional del Figma: 1 px `divider` por dentro,
 * pintado encima de la foto (un `ring` inset quedaría debajo de la imagen). Sin foto, iniciales sobre
 * `brand-soft`. No es interactivo: si algún día abre un menú, se envuelve en un botón.
 */
export function AtAvatar({ name, src, size = "md", isDecorative = false, className }: AtAvatarProps) {
  // Sin nombre no hay nada que anunciar (HeroUI pondría "avatar" como texto alternativo).
  const isHidden = isDecorative || !name.trim();
  // Sin letras ("123", un emoji) no hay iniciales: sin `name`, HeroUI pinta su icono de respaldo y no un círculo vacío.
  const initials = getInitials(name);

  return (
    <Avatar
      src={src}
      name={initials ? name : undefined}
      alt={isHidden ? "" : name}
      aria-hidden={isHidden || undefined}
      showFallback
      getInitials={getInitials}
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
