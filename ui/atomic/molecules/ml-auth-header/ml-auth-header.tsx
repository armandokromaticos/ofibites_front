import { cn } from "@heroui/react";

import { MlAuthHeaderProps } from "./ml-auth-header.types";

/** Título y subtítulo de las pantallas de acceso (Figma 3236:11719 y 3244:12471). */
export function MlAuthHeader({
  title,
  subtitle,
  icon,
  titleRef,
  align = "center",
  animateTitle = false,
  className,
}: MlAuthHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {icon}
      <h1
        ref={titleRef}
        tabIndex={titleRef ? -1 : undefined}
        className={cn(
          "font-display text-[34px] font-black leading-[1.15] tracking-[-0.04em] text-brand outline-none sm:text-[41px] sm:leading-[46px]",
          // Login v2: título de display desde lg (el de v1 y el resto de pantallas no cambia).
          align === "start" && "text-balance lg:text-[60px] lg:leading-[1.02] lg:tracking-[-0.035em]",
          animateTitle && "ofi-title-weight",
        )}
      >
        {title}
      </h1>
      {subtitle && <p className="text-base font-semibold leading-[21px] text-foreground">{subtitle}</p>}
    </div>
  );
}
