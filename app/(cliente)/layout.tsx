"use client";

import { ReactNode } from "react";

import { useRequireSession } from "@/domain/hooks/auth";
import { CLIENT_ROLES } from "@/domain/models/auth.model";

import { AppCliente } from "./_components/app-cliente";

/**
 * Layout de la app del cliente (`/dashboard`, `/ordenar`): guarda solo `CLIENT` (sin sesión → `/login`; otro
 * rol → `/`) y el esqueleto (`TmAppLayout`), persistente entre sus rutas.
 */
export default function ClienteLayout({ children }: { children: ReactNode }) {
  const status = useRequireSession({ roles: CLIENT_ROLES });

  if (status !== "allowed") {
    // Mientras se lee la sesión o se redirige: fondo de la app y nada protegido.
    return (
      <div className="h-dvh bg-background" aria-busy="true">
        <span className="sr-only">Comprobando tu sesión…</span>
      </div>
    );
  }

  return <AppCliente>{children}</AppCliente>;
}
