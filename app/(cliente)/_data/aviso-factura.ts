import { CartResponse } from "@/domain/types";
import { formatPrice } from "@/shared/utils";
import { MlNoticeBannerProps } from "@/ui/atomic";

import { rutaPagarFactura, rutaPedido } from "../_navegacion";

/**
 * Avisos de facturas y crédito del carrito y del checkout (T-06d, Figma `3390:2636`). Salen de `invoiceAlert` y
 * `creditLine` del carrito (los calcula el servidor):
 * - `OVERDUE`: bloquea el checkout. "Pagar factura ahora" lleva al pedido con el formulario abierto y vuelta al carrito.
 * - `DUE_SOON` (vence en 0–3 días): solo avisa (sin pantalla en el Figma: mismo banner, otro tono).
 * - `exceedsAvailable`: el total supera el crédito disponible; bloquea (el checkout daría `CREDIT_LIMIT_EXCEEDED`).
 * Sin permiso de pago, el aviso pide que pague un administrador y no ofrece el botón.
 */
export interface AvisosFactura {
  avisos: (MlNoticeBannerProps & { key: string })[];
  /** "Continuar al checkout" y "Confirmar pedido" quedan bloqueados. */
  bloquea: boolean;
  /** Frase corta para el `aria-describedby` del botón bloqueado. */
  motivo: string | null;
}

function cuandoVence(dias: number): string {
  if (dias <= 0) return "vence hoy";
  if (dias === 1) return "vence mañana";
  return `vence en ${dias} días`;
}

export function avisosFactura(
  cart: Pick<CartResponse, "invoiceAlert" | "creditLine" | "summary"> | null | undefined,
  puedePagar: boolean,
  volver: string,
): AvisosFactura {
  const avisos: AvisosFactura["avisos"] = [];
  let motivo: string | null = null;
  const alerta = cart?.invoiceAlert ?? null;
  const credito = cart?.creditLine ?? null;

  if (alerta) {
    const factura = alerta.invoice;
    const enRevision = factura.paymentStatus === "IN_REVIEW";
    const cual = `#${factura.invoiceNumber}, ${formatPrice(factura.balance)}`;
    const pagar =
      puedePagar && !enRevision
        ? [
            {
              label: alerta.level === "OVERDUE" ? "Pagar factura ahora" : "Pagar factura",
              href: rutaPagarFactura(factura.orderId, volver),
              variant: alerta.level === "OVERDUE" ? ("accent" as const) : ("bordered" as const),
              ariaLabel: `Pagar la factura ${factura.invoiceNumber}`,
            },
          ]
        : enRevision
          ? [{ label: "Ver pedido", href: rutaPedido(factura.orderId), variant: "bordered" as const }]
          : [];
    const quien = enRevision
      ? "Ya enviaste el comprobante: se desbloquea en cuanto Finanzas lo confirme."
      : puedePagar
        ? null
        : "Pídele a un administrador de tu empresa que la pague.";

    if (alerta.level === "OVERDUE") {
      motivo = "Tu empresa tiene una factura vencida: págala para continuar.";
      avisos.push({
        key: "vencida",
        tone: "danger",
        title:
          alerta.count > 1
            ? `Tienes ${alerta.count} facturas vencidas (la más antigua: ${cual}).`
            : `Tienes una factura vencida (${cual}).`,
        children: [
          "No podemos programar pedidos nuevos hasta regularizarla.",
          puedePagar && !enRevision ? "Paga ahora y vuelves directo a este carrito: no pierdes nada de lo que armaste." : null,
          quien,
        ]
          .filter(Boolean)
          .join(" "),
        actions: pagar,
      });
    } else {
      avisos.push({
        key: "por-vencer",
        tone: "warning",
        title:
          alerta.count > 1
            ? `Tienes ${alerta.count} facturas por vencer (la más próxima ${cual}, ${cuandoVence(factura.daysUntilDue)}).`
            : `Tu factura ${cual} ${cuandoVence(factura.daysUntilDue)}.`,
        children: [
          "Puedes seguir pidiendo. Si vence sin pagar, no podrás confirmar pedidos nuevos hasta saldarla.",
          quien,
        ]
          .filter(Boolean)
          .join(" "),
        actions: pagar,
      });
    }
  }

  if (credito?.exceedsAvailable && !alerta?.blocksCheckout) {
    motivo = "El pedido supera el crédito disponible de tu empresa.";
    avisos.push({
      key: "credito",
      tone: "danger",
      title: "El pedido supera el crédito disponible de tu empresa",
      children: [
        credito.available !== null ? `Disponible: ${formatPrice(credito.available)}.` : null,
        cart ? `Total del carrito: ${formatPrice(cart.summary.total)}.` : null,
        "Paga facturas pendientes o reduce el pedido para continuar.",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  return { avisos, bloquea: Boolean(alerta?.blocksCheckout || credito?.exceedsAvailable), motivo };
}
