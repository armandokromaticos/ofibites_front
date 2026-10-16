"use client";

import { ReactNode, useEffect } from "react";

import { AtSkeleton, MlEmptyState } from "@/ui/atomic";

import { EstadoCarritoCheckout } from "./use-carrito-checkout";

export const TITULO_CHECKOUT_ID = "checkout-titulo";

/** Título de marca de los dos pasos ("Finaliza tu pedido", Figma 3462:2094) y en qué paso se está. */
export function CabeceraCheckout({ paso, nombrePaso }: { paso: 1 | 2; nombrePaso: string }) {
  // Al entrar en un paso, el foco va al título (lector de pantalla: "Finaliza tu pedido", paso N de 2).
  useEffect(() => {
    document.getElementById(TITULO_CHECKOUT_ID)?.focus({ preventScroll: true });
  }, [paso]);

  return (
    <div className="flex flex-col gap-1.5">
      <h2
        id={TITULO_CHECKOUT_ID}
        tabIndex={-1}
        className="text-balance font-display text-[28px] font-bold leading-9 tracking-[-0.03em] text-foreground outline-none"
      >
        Finaliza tu pedido
      </h2>
      <p className="text-sm leading-5 text-muted">
        Paso {paso} de 2 · {nombrePaso}
      </p>
    </div>
  );
}

/** Rejilla de los pasos: contenido a la izquierda y resumen fijo a la derecha desde `lg` (Figma: 1fr + 380). */
export function RejillaCheckout({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      {children}
    </div>
  );
}

/** Esqueleto de un paso mientras llega el carrito. */
export function EsqueletoCheckout() {
  return (
    <div role="status" aria-label="Cargando tu pedido">
      <RejillaCheckout>
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex flex-col gap-4 rounded-card bg-content1 p-6">
              <AtSkeleton className="h-6 w-1/3 rounded-full" />
              <AtSkeleton className="h-[57px] w-full rounded-full" />
            </div>
          ))}
        </div>
        <AtSkeleton className="h-[420px] rounded-card" />
      </RejillaCheckout>
    </div>
  );
}

/** Estados del carrito que impiden pintar el paso: cargando, sin acceso y error. `null` si está listo (o vacío). */
export function EstadoCheckout({ estado, onRetry, isRetrying }: {
  estado: EstadoCarritoCheckout;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  if (estado === "cargando" || estado === "vacio") return <EsqueletoCheckout />;
  if (estado === "sin-acceso") {
    return (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          title="No puedes hacer pedidos en esta empresa"
          description="Tu usuario no tiene carrito en la empresa activa. Si crees que es un error, habla con el administrador de tu empresa."
        />
      </div>
    );
  }
  if (estado === "error") {
    return (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          title="No pudimos cargar tu pedido"
          description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
          actionLabel="Reintentar"
          onAction={onRetry}
          isActionLoading={isRetrying}
        />
      </div>
    );
  }
  return null;
}
