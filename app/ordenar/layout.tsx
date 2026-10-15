"use client";

import { ReactNode } from "react";

import { useRequireSession } from "@/domain/hooks/auth";
import { CLIENT_ROLES } from "@/domain/models/auth.model";

/** Guarda de `/ordenar`: solo `CLIENT` (igual que `/dashboard`). Sin sesión → `/login`; otro rol → `/`. */
export default function OrdenarLayout({ children }: { children: ReactNode }) {
  const status = useRequireSession({ roles: CLIENT_ROLES });

  if (status !== "allowed") {
    // Mientras se lee la sesión o se redirige: fondo de la app y nada protegido.
    return (
      <div className="h-dvh bg-background" aria-busy="true">
        <span className="sr-only">Comprobando tu sesión…</span>
      </div>
    );
  }

  return children;
}
