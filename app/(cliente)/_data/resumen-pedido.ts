import { CartLineModel } from "@/domain/models";
import { CartSummary } from "@/domain/types";
import { formatPrice } from "@/shared/utils";
import { OrOrderSummaryLine, OrOrderSummaryRow } from "@/ui/atomic";

import { IMAGEN_PRODUCTO_POR_DEFECTO } from "./imagenes";

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** "3 productos · 4 unidades". */
export function conteoPedido(lineas: number, unidades: number): string {
  return `${plural(lineas, "producto", "productos")} · ${plural(unidades, "unidad", "unidades")}`;
}

/** "IVA (16%)" con la tasa que manda el servidor (fracción). */
export function etiquetaIva(taxRate: number | null | undefined): string {
  return Number.isFinite(taxRate) ? `IVA (${Math.round((taxRate as number) * 100)}%)` : "IVA";
}

interface ImportesPedido {
  subtotal: number;
  discount?: number | null;
  shipping: number;
  tax: number;
  taxRate?: number | null;
}

/** Filas del resumen (subtotal, descuento si hay, envío e IVA) con los importes del servidor. */
export function filasResumen(
  importes: ImportesPedido,
  etiquetaEnvio = "Envío estimado",
  etiquetaSubtotal = "Subtotal",
): OrOrderSummaryRow[] {
  const filas: OrOrderSummaryRow[] = [
    { label: etiquetaSubtotal, value: formatPrice(importes.subtotal) },
  ];
  if (importes.discount) filas.push({ label: "Descuento", value: `− ${formatPrice(importes.discount)}` });
  filas.push(
    importes.shipping === 0
      ? { label: etiquetaEnvio, value: "Sin costo", isHighlighted: true }
      : { label: etiquetaEnvio, value: formatPrice(importes.shipping) },
    { label: etiquetaIva(importes.taxRate), value: formatPrice(importes.tax) },
  );
  return filas;
}

/** Filas del resumen del carrito (`CartResponse.summary`). */
export function filasResumenCarrito(
  summary: CartSummary,
  etiquetaSubtotal?: string,
): OrOrderSummaryRow[] {
  return filasResumen(summary, "Envío estimado", etiquetaSubtotal);
}

/** Líneas del carrito para el resumen lateral ("Cantidad: 2" y subtotal del servidor). */
export function lineasResumen(lines: CartLineModel[]): OrOrderSummaryLine[] {
  return lines.map((line) => ({
    id: line.id,
    name: line.name,
    imageSrc: line.imageSrc ?? IMAGEN_PRODUCTO_POR_DEFECTO,
    detail: line.servingsLabel ? `Cantidad: ${line.quantity} · ${line.servingsLabel}` : `Cantidad: ${line.quantity}`,
    subtotalLabel: formatPrice(line.subtotal),
    notice: line.isAvailable ? null : "Ya no está disponible",
  }));
}
