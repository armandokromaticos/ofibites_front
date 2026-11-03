"use client";

import Link from "next/link";

import { AtButton } from "@/ui/atomic";

/**
 * «Listo» (Figma `3371:1935`). «Comenzar recorrido» abre el tour de T-33 en el dashboard (`?tour=1`); «Ir directo al
 * dashboard» lo salta. La empresa ya está marcada como completada en la sesión: la guarda de `(cliente)` no
 * devuelve aquí.
 */
export function PasoListo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <AtButton as={Link} href="/dashboard?tour=1" size="lg" className="px-14">
        Comenzar recorrido
      </AtButton>
      <Link
        href="/dashboard"
        className="rounded-sm text-[15px] font-semibold text-placeholder underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Ir directo al dashboard
      </Link>
    </div>
  );
}
