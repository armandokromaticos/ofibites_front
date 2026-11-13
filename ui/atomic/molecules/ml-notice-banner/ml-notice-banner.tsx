"use client";

import { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@heroui/react";
import { AlertCircle, Check, CircleDollarSign, Clock } from "lucide-react";

import { AtButton } from "@/ui/atomic/atoms";

import { MlNoticeBannerAction, MlNoticeBannerProps, MlNoticeBannerTone } from "./ml-notice-banner.types";

interface EstiloTono {
  caja: string;
  icono: string;
  titulo: string;
  defecto: ReactNode;
}

const TONOS: Record<MlNoticeBannerTone, EstiloTono> = {
  success: {
    caja: "border-brand bg-brand-tint",
    icono: "bg-brand text-white",
    titulo: "text-foreground",
    defecto: <Check strokeWidth={3} />,
  },
  warning: {
    caja: "border-strength-medium bg-surface-cream",
    icono: "bg-strength-medium text-white",
    titulo: "text-foreground",
    defecto: <Clock strokeWidth={2.5} />,
  },
  danger: {
    caja: "border-accent bg-secondary-50",
    icono: "bg-accent text-white",
    titulo: "text-secondary-700",
    defecto: <AlertCircle strokeWidth={2.5} />,
  },
  credit: {
    caja: "border-brand bg-surface-sand/45",
    icono: "bg-transparent text-strength-medium-foreground",
    titulo: "text-foreground",
    defecto: <CircleDollarSign strokeWidth={2} />,
  },
};

const CLASES_ACCION: Record<NonNullable<MlNoticeBannerAction["variant"]>, string> = {
  primary: "",
  bordered: "border-1 border-primary bg-content1 text-primary",
  "danger-bordered": "border-1 border-accent bg-content1 text-secondary-700",
  // `secondary-600` con texto blanco da 5,3:1 (el `accent` del Figma, 4,0:1, no llega a AA en 13 px).
  accent: "bg-secondary-600 text-white",
};

function Accion({ action }: { action: MlNoticeBannerAction }) {
  const variant = action.variant ?? "bordered";
  const comun = {
    size: "md" as const,
    variant: variant === "bordered" || variant === "danger-bordered" ? ("bordered" as const) : ("solid" as const),
    className: cn("h-10 shrink-0 px-5 text-[13px]", CLASES_ACCION[variant]),
    "aria-label": action.ariaLabel,
    isLoading: action.isLoading,
  };
  if (action.href) {
    return (
      <AtButton as={Link} href={action.href} {...comun}>
        {action.label}
      </AtButton>
    );
  }
  return (
    <AtButton {...comun} onPress={action.onPress}>
      {action.label}
    </AtButton>
  );
}

/**
 * Aviso de cabecera del detalle del pedido y del carrito (Figma `3632:1686` pago confirmado, `3634:1842` por confirmar,
 * `3628:1608` rechazado, `3724:3013`/`3726:3051` crédito y `3390:2636` carrito bloqueado): borde de 1 px del tono, icono
 * en círculo, título y detalle, y hasta dos acciones. En móvil las acciones bajan bajo el texto.
 */
export function MlNoticeBanner({
  tone,
  title,
  children,
  icon,
  actions = [],
  titleColor = "tone",
  role,
  id,
  containerRef,
  className,
}: MlNoticeBannerProps) {
  const estilo = TONOS[tone];
  return (
    <div
      ref={containerRef}
      id={id}
      role={role}
      tabIndex={containerRef ? -1 : undefined}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border px-4 py-4 outline-none sm:flex-row sm:items-center sm:gap-5 sm:px-5",
        estilo.caja,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span
          aria-hidden="true"
          className={cn("flex size-7 shrink-0 items-center justify-center rounded-full [&>svg]:size-4", estilo.icono)}
        >
          {icon ?? estilo.defecto}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className={cn("text-sm font-semibold leading-5", titleColor === "foreground" ? "text-foreground" : estilo.titulo)}>{title}</p>
          {children && <div className="text-xs leading-[18px] text-foreground">{children}</div>}
        </div>
      </div>
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2.5 pl-[42px] sm:pl-0">
          {actions.map((action) => (
            <Accion key={action.label} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
