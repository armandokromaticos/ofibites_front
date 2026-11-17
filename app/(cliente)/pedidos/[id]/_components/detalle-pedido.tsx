"use client";

import Link from "next/link";

import { cn } from "@heroui/react";
import { ChevronLeft } from "lucide-react";

import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { EscenarioQaPedido, useOrder } from "@/domain/hooks/orders";
import {
  ORDER_STATUS_GROUP_LABELS,
  ORDER_STATUS_GROUP_STEPS,
  ORDER_STATUS_GROUP_TONES,
  orderStatusGroupStepIndex,
} from "@/domain/models";
import { formatCaracasDateSlash, formatPrice, isApiError } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  AtStatusChip,
  MlEmptyState,
  MlNoticeBanner,
  MlOrderTimeline,
  OrOrderSummary,
} from "@/ui/atomic";

import { filasResumen } from "../../../_data/resumen-pedido";
import { RUTA_PEDIDOS, rutaRepetirPedido } from "../../../_navegacion";
import { personasTexto } from "../../_data/lineas-pedido";
import { sePuedeRepetir } from "../../_data/repetir";
import { ayudasSeguimiento, cuandoCancelado, pasosCumplidos, textoEstadoPedido } from "../../_data/seguimiento";
import { fechaPura, hora, horaPared } from "../../_data/textos-pago";

import { ProductosPedido } from "./productos-pedido";
import { usePagoPedido } from "./use-pago-pedido";

const TITULO_ID = "pedido-detalle-titulo";
const CLASE_TITULO_BLOQUE = "font-display text-xl font-bold leading-7 text-foreground";
/** Botones de la cabecera (Figma 3632:1686): 47 px y texto de 14 px, sin tocar las tallas globales de `AtButton`. */
const CLASE_BOTON_CABECERA = "h-[47px] px-6 text-sm";
const CLASE_BOTON_BORDE = "border-1 border-primary bg-content1 text-primary";

/** Fecha pura de la API ("26/09/2026"), o `null` si no hay. */
function fechaPuraONull(value: string | null): string | null {
  const fecha = fechaPura(value);
  return fecha === "—" ? null : fecha;
}

function Esqueleto() {
  return (
    <div role="status" aria-label="Cargando el pedido" className="flex flex-col gap-4">
      <AtSkeleton className="h-[120px] rounded-card" />
      <AtSkeleton className="h-[96px] rounded-card" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <AtSkeleton className="h-[360px] rounded-card" />
        <AtSkeleton className="h-[320px] rounded-card" />
      </div>
    </div>
  );
}

interface DetallePedidoProps {
  orderId: string;
  /** Pedido de ejemplo del Figma (`?qa=`, solo desarrollo). */
  qa?: EscenarioQaPedido;
}

/**
 * Detalle del pedido (Figma 3632:1686 aprobado, 3634:1842 por confirmar, 3628:1608 rechazado, 3724:3013/3729:3090 a
 * crédito) sobre `GET /orders/:id` con los campos de T-38: comensales, cajas y complementos, "IVA (N%)", seguimiento
 * desde `statusHistory` y usuario y departamento del back. El pago y la factura salen de `usePagoPedido` (T-06d).
 * "Repetir pedido" lleva al editor `/pedidos/<id>/repetir`.
 */
export function DetallePedido({ orderId, qa }: DetallePedidoProps) {
  const orderQuery = useOrder(orderId, { qa });
  const order = orderQuery.data;
  const addressesQuery = useCompanyAddresses();
  const pago = usePagoPedido(order);

  if (!order) {
    if (orderQuery.isError) {
      const status = isApiError(orderQuery.error) ? orderQuery.error.statusCode : null;
      const noEsta = status === 404 || status === 400;
      return (
        <div className="mx-auto w-full max-w-[1296px] rounded-card bg-content1">
          <MlEmptyState
            tone={noEsta || status === 403 ? "neutral" : "error"}
            headingLevel={2}
            title={
              noEsta ? "No encontramos este pedido" : status === 403 ? "No tienes acceso a este pedido" : "No pudimos cargar tu pedido"
            }
            description={
              noEsta || status === 403
                ? "Puede ser de otra empresa o haberse borrado."
                : "Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
            }
            actionLabel={noEsta || status === 403 ? "Volver a pedidos" : "Reintentar"}
            actionHref={noEsta || status === 403 ? RUTA_PEDIDOS : undefined}
            onAction={noEsta || status === 403 ? undefined : () => void orderQuery.refetch()}
            isActionLoading={orderQuery.isFetching}
          />
        </div>
      );
    }
    return (
      <div className="mx-auto w-full max-w-[1296px]">
        <Esqueleto />
      </div>
    );
  }

  const numero = order.orderNumber ?? order.id.slice(-8).toUpperCase();
  const estadoLabel = ORDER_STATUS_GROUP_LABELS[order.statusGroup];
  const pasoActual = orderStatusGroupStepIndex(order.statusGroup);
  const cumplidos = pasosCumplidos(order);
  const ayudas = ayudasSeguimiento(order);
  const usuario = order.user?.name ?? null;
  const departamento = order.department?.name ?? null;
  const quien = [usuario, departamento].filter(Boolean).join(" · ") || null;
  const sede = addressesQuery.data?.find((a) => a.id === order.deliveryAddressId);
  // Figma: "Torre Principal · Av. Francisco de Miranda, piso 8, Caracas".
  const calle = [sede?.line1, order.addressDetail, sede?.city].filter(Boolean).join(", ");
  const direccion = [sede?.label, calle].filter(Boolean).join(" · ") || null;
  const contacto = [order.receiverName, order.receiverPhone].filter(Boolean).join(" · ") || null;

  const items = order.items ?? [];
  const tieneImportes = order.subtotal !== null && order.total !== null;

  const detalle = [
    { label: "Fecha de creación", value: `${formatCaracasDateSlash(order.createdAt)}, ${hora(order.createdAt)}` },
    { label: "Fecha de entrega", value: fechaPuraONull(order.deliveryDate) },
    { label: "Hora de entrega", value: horaPared(order.deliveryTime) },
    { label: "Nº de comensales", value: order.diners ? personasTexto(order.diners) : null },
    { label: "Dirección de entrega", value: direccion },
    { label: "Contacto en recepción", value: contacto },
    { label: "Usuario que realizó el pedido", value: quien },
    { label: "Método de pago", value: pago.metodoPago },
    { label: "Notas", value: order.notes },
  ].filter((fila) => fila.value);

  const puedeRepetir = sePuedeRepetir(order);
  const repetirEnCabecera = puedeRepetir && pago.muestraRepetirEnCabecera;
  const repetirEnTotal = puedeRepetir && pago.muestraRepetirEnTotal;
  const hrefRepetir = rutaRepetirPedido(order.id);
  const accion = pago.accionCabecera;
  // Con una acción principal (Pagar factura), "Repetir pedido" va a su izquierda con borde; si no, a la derecha y sólido.
  const accionPrincipal = accion?.variant === "primary";
  const botonRepetir = repetirEnCabecera && (
    <AtButton
      as={Link}
      href={hrefRepetir}
      size="md"
      variant={accionPrincipal ? "bordered" : "solid"}
      className={cn(CLASE_BOTON_CABECERA, accionPrincipal && CLASE_BOTON_BORDE)}
    >
      Repetir pedido
    </AtButton>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-4 sm:gap-5">
      {pago.aviso}
      {pago.banner && <MlNoticeBanner {...pago.banner} />}
      <Link
        href={RUTA_PEDIDOS}
        className="inline-flex items-center gap-1 self-start rounded-sm text-[13px] font-semibold text-brand outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Volver a pedidos
      </Link>

      <section className="flex flex-col gap-4 rounded-card bg-content1 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Figma 3632:1686: título y chips en una fila; debajo, quién y cuándo en `brand` de 14 px. */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 id={TITULO_ID} className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
                Pedido #{numero}
              </h1>
              <AtStatusChip tone={ORDER_STATUS_GROUP_TONES[order.statusGroup]}>
                {estadoLabel}
              </AtStatusChip>
              {pago.chip && <AtStatusChip tone={pago.chip.tone}>{pago.chip.label}</AtStatusChip>}
            </div>
            <p className="text-sm leading-5 text-brand">
              Creado el {formatCaracasDateSlash(order.createdAt)}
              {quien ? ` por ${quien}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {accionPrincipal && botonRepetir}
            {accion && (
              <AtButton
                size="md"
                variant={accion.variant === "bordered" ? "bordered" : "solid"}
                className={cn(
                  CLASE_BOTON_CABECERA,
                  accion.variant === "bordered" && CLASE_BOTON_BORDE,
                  accion.variant === "accent" && "bg-secondary-600 text-white",
                )}
                onPress={accion.onPress}
              >
                {accion.label}
              </AtButton>
            )}
            {!accionPrincipal && botonRepetir}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <section aria-labelledby="pedido-info-titulo" className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6">
            <h2 id="pedido-info-titulo" className={CLASE_TITULO_BLOQUE}>
              Información del pedido
            </h2>
            {/* Figma 3632:1686: dos columnas (24 px), filas a 18 px, etiqueta de 11 px a 5 px del valor de 14 px y, al
                final, "Estado del pedido" con el chip a la derecha de la etiqueta. */}
            <dl className="grid gap-x-6 gap-y-[18px] sm:grid-cols-2">
              {detalle.map((fila) => (
                <div key={fila.label} className="flex min-w-0 flex-col gap-[5px]">
                  <dt className="text-[11px] font-semibold leading-4 text-muted">{fila.label}</dt>
                  <dd className="break-words text-sm leading-5 text-foreground">{fila.value}</dd>
                </div>
              ))}
              <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 sm:col-span-2">
                <dt className="text-[11px] font-semibold leading-4 text-muted">Estado del pedido</dt>
                <dd>
                  <AtStatusChip tone={ORDER_STATUS_GROUP_TONES[order.statusGroup]}>
                    {textoEstadoPedido(order)}
                  </AtStatusChip>
                </dd>
              </div>
            </dl>
          </section>

          <ProductosPedido items={items} diners={order.diners} />
        </div>

        {/* Figma 3632:1686: columna derecha con el total (sin repetir las líneas, que ya están en la tabla) y el
            seguimiento debajo, en vertical. */}
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:sticky lg:top-0">
          <OrOrderSummary
            variant="order"
            title="Total del pedido"
            titleId="pedido-resumen-titulo"
            rows={
              tieneImportes
                ? filasResumen(
                    {
                      subtotal: order.subtotal ?? 0,
                      discount: order.discount,
                      shipping: order.shipping ?? 0,
                      tax: order.tax ?? 0,
                      taxRate: order.taxRate,
                    },
                    "Envío",
                    "Subtotal",
                    true,
                  )
                : []
            }
            totalLabel={order.total !== null ? formatPrice(order.total) : "—"}
          >
            {/* Orden (Figma): nota de estado → línea de crédito → botón principal → Repetir → enlaces. */}
            {pago.resumen}
            {repetirEnTotal && (
              <AtButton as={Link} href={hrefRepetir} size="lg" className="h-[52px] w-full text-sm">
                Repetir este pedido
              </AtButton>
            )}
            {pago.enlaces}
          </OrOrderSummary>

          <section
            aria-labelledby="pedido-seguimiento-titulo"
            className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6"
          >
            <h2 id="pedido-seguimiento-titulo" className={CLASE_TITULO_BLOQUE}>
              Seguimiento
            </h2>
            {pasoActual >= 0 ? (
              <MlOrderTimeline
                labelledBy="pedido-seguimiento-titulo"
                orientation="vertical"
                steps={ORDER_STATUS_GROUP_STEPS.map((grupo, index) => ({
                  label: ORDER_STATUS_GROUP_LABELS[grupo],
                  hint: ayudas[index],
                }))}
                completedCount={cumplidos}
              />
            ) : (
              <p className="text-sm leading-5 text-foreground">
                Este pedido está <strong className="font-semibold">{estadoLabel.toLowerCase()}</strong>
                {cuandoCancelado(order)}.
              </p>
            )}
          </section>
        </div>
      </div>
      {pago.modales}
    </div>
  );
}
