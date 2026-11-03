"use client";

import { ReactNode } from "react";

import { useLogout, useRequireSession } from "@/domain/hooks/auth";
import { CLIENT_ROLES } from "@/domain/models/auth.model";
import { TmAuthLayout } from "@/ui/atomic";

/**
 * Onboarding de la empresa (T-34): grupo propio, sin el `TmAppLayout` del cliente. Guarda de sesión `CLIENT`
 * (sin sesión → `/login`); a quién le toca el onboarding lo decide la página (solo `COMPANY_ADMIN` pendiente).
 * Abajo, «Cerrar sesión» discreto: el onboarding es obligatorio y sin él no habría salida (cuenta equivocada, o el
 * admin de una empresa que también es comprador de otra).
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const status = useRequireSession({ roles: CLIENT_ROLES });
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (status !== "allowed") {
    return (
      <div className="h-dvh bg-background" aria-busy="true">
        <span className="sr-only">Comprobando tu sesión…</span>
      </div>
    );
  }

  return (
    <TmAuthLayout variant="centered" backgroundSrc="/images/auth/onboarding-bg.png" contentClassName="justify-start lg:pt-[72px]">
      {children}
      <p className="text-center text-[13px] font-semibold text-placeholder">
        <button
          type="button"
          onClick={() => {
            if (!isLoggingOut) logout();
          }}
          aria-disabled={isLoggingOut || undefined}
          className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-disabled:opacity-60"
        >
          {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
      </p>
    </TmAuthLayout>
  );
}
