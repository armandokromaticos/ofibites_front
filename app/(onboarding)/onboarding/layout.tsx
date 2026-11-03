"use client";

import { ReactNode } from "react";

import { useRequireSession } from "@/domain/hooks/auth";
import { CLIENT_ROLES } from "@/domain/models/auth.model";
import { TmAuthLayout } from "@/ui/atomic";

/**
 * Onboarding de la empresa (T-34): grupo propio, sin el `TmAppLayout` del cliente. Guarda de sesión `CLIENT`
 * (sin sesión → `/login`); a quién le toca el onboarding lo decide la página (solo `COMPANY_ADMIN` pendiente).
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const status = useRequireSession({ roles: CLIENT_ROLES });

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
    </TmAuthLayout>
  );
}
