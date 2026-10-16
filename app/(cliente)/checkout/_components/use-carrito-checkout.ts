"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCart, useCartLines } from "@/domain/hooks/cart";
import { useAuthStore } from "@/domain/stores";
import { isApiError } from "@/shared/utils";

import { RUTA_CARRITO } from "../../_navegacion";

export type EstadoCarritoCheckout = "cargando" | "sin-acceso" | "error" | "vacio" | "listo";

/**
 * Carrito para los pasos del checkout, pedido de nuevo al entrar (cotiza con el estado actual del servidor). Sin
 * carrito o vacío, vuelve a `/carrito`; `mantener` lo evita mientras se confirma (el carrito se vacía al crear el
 * pedido, justo antes de ir a "Pedido confirmado").
 */
export function useCarritoCheckout({ mantener = false }: { mantener?: boolean } = {}) {
  const router = useRouter();
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const cartQuery = useCart({ fresh: true });
  const cart = cartQuery.data;
  const lines = useCartLines(cart);
  const summary = cart?.summary;

  let estado: EstadoCarritoCheckout;
  const isForbidden =
    cartQuery.isError && isApiError(cartQuery.error) && cartQuery.error.statusCode === 403;
  if (!companyId || isForbidden) {
    estado = "sin-acceso";
  } else if (!cart && cartQuery.isError) estado = "error";
  else if (!cart) estado = "cargando";
  // Con el carrito pero sin `summary` (un back sin T-26a) no se puede cotizar.
  else if (!summary) estado = "error";
  else if (lines.length === 0) estado = "vacio";
  else estado = "listo";

  useEffect(() => {
    if (estado === "vacio" && !mantener) router.replace(RUTA_CARRITO);
  }, [estado, mantener, router]);

  return { estado, cart, lines, summary, cartQuery };
}
