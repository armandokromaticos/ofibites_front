"use client";

import { CartSummary } from "@/domain/types";
import { formatPrice } from "@/shared/utils";
import { AtProgress } from "@/ui/atomic";

/**
 * Barra de envío sin costo del resumen (Figma 3339:13048). El avance es una proporción visual de la base del
 * servidor (`subtotal − discount`) sobre `freeShippingThreshold`; "Te faltan $X" es una resta solo para mostrar: el
 * envío que se cobra es siempre `summary.shipping`.
 */
export function EnvioGratis({ summary }: { summary: CartSummary }) {
  const umbral = summary.freeShippingThreshold;
  if (!(umbral > 0)) return null;
  const base = summary.subtotal - summary.discount;
  // El servidor decide el envío: sin costo si `shipping` es 0 con productos en el carrito.
  const alcanzado = summary.shipping === 0 && summary.subtotal > 0;
  const avance = Math.min(100, Math.max(0, (base / umbral) * 100));
  const faltan = Math.round((umbral - base) * 100) / 100;

  return (
    <div className="flex flex-col gap-2.5">
      <AtProgress
        aria-label="Avance hacia el envío sin costo"
        value={avance}
        classNames={{
          track: "h-1.5 bg-surface-sand",
          indicator: "bg-brand motion-reduce:transition-none",
        }}
      />
      <p aria-live="polite" className="text-[13px] leading-5 text-foreground">
        {alcanzado ? (
          <>
            <strong className="font-semibold text-secondary-600">Envío sin costo aplicado.</strong> Alcanzaste los{" "}
            {formatPrice(umbral)} en pedidos dentro de Caracas.
          </>
        ) : (
          <>
            Te faltan <strong className="font-semibold text-secondary-600">{formatPrice(faltan)}</strong> para el envío
            sin costo.
          </>
        )}
      </p>
    </div>
  );
}
