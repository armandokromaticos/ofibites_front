import { cn } from "@heroui/react";

import { MlAuthHeaderProps } from "./ml-auth-header.types";

/** Título y subtítulo centrados de las pantallas de acceso (Figma 3236:11719 y 3244:12471). */
export function MlAuthHeader({ title, subtitle, icon, titleRef, className }: MlAuthHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center gap-5 text-center", className)}>
      {icon}
      <h1
        ref={titleRef}
        tabIndex={titleRef ? -1 : undefined}
        className="font-display text-[34px] font-black leading-[1.15] tracking-[-0.04em] text-brand outline-none sm:text-[41px] sm:leading-[46px]"
      >
        {title}
      </h1>
      {subtitle && <p className="text-base font-semibold leading-[21px] text-foreground">{subtitle}</p>}
    </div>
  );
}
