"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useRequireSession } from "@/domain/hooks/auth";
import { CLIENT_ROLES, needsOnboarding, RUTA_ONBOARDING } from "@/domain/models/auth.model";
import { useAuthStore } from "@/domain/stores";

import { AppCliente } from "./_components/app-cliente";

/**
 * Layout de la app del cliente (`/dashboard`, `/ordenar`): guarda solo `CLIENT` (sin sesión → `/login`; otro
 * rol → `/`) y el esqueleto (`TmAppLayout`), persistente entre sus rutas. T-34: el `COMPANY_ADMIN` de una empresa
 * sin onboarding va a `/onboarding` (obligatorio) desde cualquier ruta del grupo.
 */
export default function ClienteLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useRequireSession({ roles: CLIENT_ROLES });
  const debeConfigurar = useAuthStore((state) =>
    needsOnboarding(state.memberships, state.activeCompanyId),
  );
  const redirigeAOnboarding = status === "allowed" && debeConfigurar;

  useEffect(() => {
    if (redirigeAOnboarding) router.replace(RUTA_ONBOARDING);
  }, [redirigeAOnboarding, router]);

  if (status !== "allowed" || redirigeAOnboarding) {
    // Mientras se lee la sesión o se redirige: fondo de la app y nada protegido.
    return (
      <div className="h-dvh bg-background" aria-busy="true">
        <span className="sr-only">Comprobando tu sesión…</span>
      </div>
    );
  }

  return <AppCliente>{children}</AppCliente>;
}
