import { cn } from "@heroui/react";

import { AtAvatar, AtChip } from "@/ui/atomic/atoms";
import { MlSectionNav } from "@/ui/atomic/molecules";

import { OrProfileCardProps } from "./or-profile-card.types";

/**
 * Tarjeta lateral de "Mi perfil" (Figma `3651:1921`): avatar con iniciales, nombre, correo, etiqueta de rol y
 * sede, y la navegación entre secciones. El avatar es decorativo: el nombre se lee al lado.
 */
export function OrProfileCard({
  name,
  email,
  avatarSrc,
  roleLabel,
  nav,
  className,
}: OrProfileCardProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-card bg-content1 p-4", className)}>
      <div className="flex flex-col gap-3 border-b border-divider pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <AtAvatar name={name} src={avatarSrc} isDecorative className="size-12 text-base" />
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-semibold leading-5 text-foreground">{name}</p>
            <p className="truncate text-[11px] leading-4 text-subtle">{email}</p>
          </div>
        </div>
        {roleLabel && (
          <AtChip
            startContent={<span aria-hidden="true" className="ml-1 size-1.5 rounded-full bg-primary" />}
            classNames={{ base: "h-6 max-w-full", content: "truncate text-[11px] font-semibold" }}
          >
            {roleLabel}
          </AtChip>
        )}
      </div>
      <MlSectionNav {...nav} />
    </div>
  );
}
