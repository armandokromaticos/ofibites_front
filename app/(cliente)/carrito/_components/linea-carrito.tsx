"use client";

import { Ref, useEffect, useRef, useState } from "react";

import { useRemoveCartItem, useUpdateCartItem } from "@/domain/hooks/cart";
import { CartLineModel } from "@/domain/models";
import { formatPrice, isApiError } from "@/shared/utils";
import { OrCartLineItem } from "@/ui/atomic";

import { mensajeErrorCarrito } from "../../_data/errores-carrito";
import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../_data/imagenes";
import { rutaProducto } from "../../_navegacion";

/** Espera tras el último clic del stepper antes de enviar la cantidad (varios clics = un solo `PATCH`). */
const ESPERA_CANTIDAD_MS = 450;

/** Línea que hoy no se podría añadir (producto, tamaño o extras desactivados): el carrito aún la cotiza. */
const AVISO_NO_DISPONIBLE = "Ya no está disponible así: quítalo del carrito o elige otra opción en el catálogo.";

interface LineaCarritoProps {
  line: CartLineModel;
  /** Error de una acción de la línea, en español (la página lo anuncia); `null` lo limpia. */
  onError: (message: string | null) => void;
  /** La línea se quitó: la página mueve el foco (su botón desaparece). */
  onRemoved: () => void;
  /** La línea ya no existía (404): la página vuelve a pedir el carrito. */
  onStale: () => void;
  /** Ref del botón "Eliminar", para que la página mueva el foco entre líneas. */
  removeButtonRef?: Ref<HTMLButtonElement>;
}

/**
 * Línea del carrito conectada: la cantidad se ve al instante y se envía con `PATCH /cart/items/:id` cuando el
 * usuario deja de pulsar. Los `PATCH` de la línea van en fila (`scope` de `useUpdateCartItem`) y la cantidad
 * local solo se suelta cuando responde el último pedido; el subtotal mostrado es siempre el del servidor.
 */
export function LineaCarrito({ line, onError, onStale, onRemoved, removeButtonRef }: LineaCarritoProps) {
  const update = useUpdateCartItem(line.id);
  const remove = useRemoveCartItem(line.id);
  const [pendingQuantity, setPendingQuantity] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Número del último `PATCH` pedido: solo su respuesta suelta la cantidad local.
  const lastRequest = useRef(0);
  // Cantidad aún no enviada (en la espera del stepper) y si la línea se está quitando.
  const unsent = useRef<number | null>(null);
  const isRemovingRef = useRef(false);
  const send = useRef<(quantity: number) => void>(() => undefined);

  const enviarCantidad = (quantity: number) => {
    unsent.current = null;
    // Volvió a la cantidad del servidor sin nada en vuelo: no hace falta `PATCH`.
    if (quantity === line.quantity && !update.isPending) {
      setPendingQuantity(null);
      return;
    }
    const request = ++lastRequest.current;
    onError(null);
    update
      .mutateAsync(quantity)
      .catch((error: unknown) => {
        // Una respuesta vieja, o la línea ya se está quitando (su 404 no es un error para el usuario).
        if (request !== lastRequest.current || isRemovingRef.current) return;
        onError(mensajeErrorCarrito(error, "actualizar"));
        if (isApiError(error) && error.statusCode === 404) onStale();
      })
      .finally(() => {
        if (request === lastRequest.current) setPendingQuantity(null);
      });
  };

  useEffect(() => {
    send.current = enviarCantidad;
  });

  // Al salir de la página con una cantidad en espera, se envía ya (salvo que la línea se esté quitando).
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (unsent.current !== null && !isRemovingRef.current) send.current(unsent.current);
    },
    [],
  );

  const cambiarCantidad = (quantity: number) => {
    setPendingQuantity(quantity);
    unsent.current = quantity;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      send.current(quantity);
    }, ESPERA_CANTIDAD_MS);
  };

  const quitar = () => {
    // Sin `PATCH` pendiente hacia una línea que se va a borrar.
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    unsent.current = null;
    setPendingQuantity(null);
    isRemovingRef.current = true;
    onError(null);
    // Promesa y no callbacks de `mutate`: al guardar la respuesta la línea se desmonta y React Query ya no
    // llamaría a los callbacks de un observador desmontado.
    remove
      .mutateAsync(line.id)
      .then(onRemoved)
      .catch((error: unknown) => {
        isRemovingRef.current = false;
        onError(mensajeErrorCarrito(error, "quitar"));
        if (isApiError(error) && error.statusCode === 404) onStale();
      });
  };

  const description = line.servingsLabel ? `Para ${line.servingsLabel}` : line.kind === "combo" ? "Combo" : null;

  return (
    <OrCartLineItem
      name={line.name}
      imageSrc={line.imageSrc ?? IMAGEN_PRODUCTO_POR_DEFECTO}
      // Una línea no disponible tiene la ficha desactivada (404): sin enlace.
      href={line.isAvailable ? rutaProducto(line.catalogId, line.kind) : undefined}
      description={description}
      unitPriceLabel={line.hasModifiers ? undefined : formatPrice(line.unitPrice)}
      subtotalLabel={formatPrice(line.subtotal)}
      quantity={pendingQuantity ?? line.quantity}
      onQuantityChange={cambiarCantidad}
      isUpdating={pendingQuantity !== null || update.isPending}
      notice={line.isAvailable ? null : AVISO_NO_DISPONIBLE}
      isQuantityDisabled={!line.isAvailable}
      isRemoving={remove.isPending}
      removeButtonRef={removeButtonRef}
      onRemove={quitar}
    />
  );
}
