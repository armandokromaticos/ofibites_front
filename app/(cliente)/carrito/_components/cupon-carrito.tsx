"use client";

import { useState } from "react";

import { useApplyCoupon, useRemoveCoupon } from "@/domain/hooks/cart";
import { CartCoupon } from "@/domain/types";
import { formatPrice, getApiErrorMessage } from "@/shared/utils";
import { MlCouponField } from "@/ui/atomic";

/**
 * Código promocional del resumen del carrito. El back valida el código y calcula el descuento (`summary.discount`);
 * aquí solo se envía y se muestra su respuesta. Los 400 traen el motivo en español ("Ese código no es válido. Revísalo e
 * inténtalo de nuevo.", "Ese código ya venció."). Con el cupón vigente, "Código aplicado: {descuento}." con el
 * `summary.discount` del servidor (T-39).
 */
export function CuponCarrito({ coupon, discount }: { coupon: CartCoupon | null; discount: number }) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();

  return (
    <MlCouponField
      value={codigo}
      onChange={(value) => {
        setCodigo(value);
        setError(null);
      }}
      onApply={(code) => {
        setError(null);
        apply.mutate(code, {
          onSuccess: () => setCodigo(""),
          onError: (err) =>
            setError(
              getApiErrorMessage(
                err,
                "No pudimos aplicar el código. Inténtalo de nuevo.",
              ),
            ),
        });
      }}
      isApplying={apply.isPending}
      error={error}
      applied={coupon}
      appliedMessage={coupon?.isValid && discount > 0 ? `Código aplicado: ${formatPrice(discount)}.` : undefined}
      onRemove={() => {
        setError(null);
        remove.mutate(undefined, {
          onError: (err) =>
            setError(
              getApiErrorMessage(
                err,
                "No pudimos quitar el código. Inténtalo de nuevo.",
              ),
            ),
        });
      }}
      isRemoving={remove.isPending}
    />
  );
}
