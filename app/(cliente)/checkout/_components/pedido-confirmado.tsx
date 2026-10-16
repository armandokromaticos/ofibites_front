"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { useOrder } from "@/domain/hooks/orders";
import { isOrderStatus, ORDER_PROGRESS_STEPS, ORDER_STATUS_LABELS, orderProgressIndex } from "@/domain/models";
import { useCheckoutDraftStore } from "@/domain/stores";
import { Order } from "@/domain/types";
import {
  dateOnlyFromApi,
  formatDateOnlyLong,
  formatPrice,
  formatWallTime,
  isApiError,
  isWallTime,
} from "@/shared/utils";
import { AtButton, AtChip, AtSkeleton, MlEmptyState, MlOrderTimeline, OrOrderSummary } from "@/ui/atomic";

import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../_data/imagenes";
import { conteoPedido, filasResumen } from "../../_data/resumen-pedido";
import { RUTA_ORDENAR } from "../../_navegacion";

import { CLASE_TITULO_BLOQUE } from "./campos";

const PEDIDOS_PRONTO_ID = "pedido-confirmado-pedidos-pronto";
const TITULO_ID = "pedido-confirmado-titulo";

/** "Jueves 26 de septiembre · 9:00 a.m." (fecha `@db.Date` y hora de pared, sin convertir zona). */
function entregaDe(order: Order): string | null {
  const fecha = dateOnlyFromApi(order.deliveryDate);
  if (!fecha) return null;
  const time = order.deliveryTime;
  const hora = time && isWallTime(time) ? formatWallTime(time) : null;
  return [formatDateOnlyLong(fecha), hora].filter(Boolean).join(" · ");
}

/** Ayuda bajo el paso en curso de la línea de estados. */
function pistasPasos(entrega: string | null): (string | undefined)[] {
  return [
    undefined,
    "Ofibites revisa tu pedido y lo confirma",
    entrega ? `Agendado para el ${entrega.toLowerCase()}` : undefined,
    "Te avisamos cuando salga",
    undefined,
  ];
}

function Esqueleto() {
  return (
    <div role="status" aria-label="Cargando tu pedido" className="flex flex-col gap-4">
      <AtSkeleton className="h-[220px] rounded-card" />
      <AtSkeleton className="h-[96px] rounded-card" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <AtSkeleton className="h-[320px] rounded-card" />
        <AtSkeleton className="h-[420px] rounded-card" />
      </div>
    </div>
  );
}

/**
 * "Pedido confirmado" (Figma 3465:3585, sin pagos en la fase 1): número `OF-AAAA-NNNN`, línea de estados con los
 * estados reales del back, qué sigue, detalle de la entrega y resumen con los importes guardados en el pedido. Las
 * líneas con nombre salen de lo que se vio al confirmar (en esta pestaña): la respuesta del pedido no las trae.
 */
export function PedidoConfirmado({ orderId }: { orderId: string }) {
  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;
  const snapshot = useCheckoutDraftStore((state) =>
    state.confirmed?.orderId === orderId ? state.confirmed : null,
  );
  const addressesQuery = useCompanyAddresses();
  const orderLoaded = Boolean(order);

  // Con el pedido en pantalla, el foco va al título "¡Pedido confirmado!".
  useEffect(() => {
    if (orderLoaded) document.getElementById(TITULO_ID)?.focus({ preventScroll: true });
  }, [orderLoaded]);

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
              noEsta
                ? "No encontramos este pedido"
                : status === 403
                  ? "No tienes acceso a este pedido"
                  : "No pudimos cargar tu pedido"
            }
            description={
              noEsta || status === 403
                ? "Puede ser de otra empresa o haberse borrado. Si acabas de confirmarlo, revisa la campana de notificaciones."
                : "Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
            }
            actionLabel={noEsta || status === 403 ? "Hacer otro pedido" : "Reintentar"}
            actionHref={noEsta || status === 403 ? RUTA_ORDENAR : undefined}
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

  const entrega = entregaDe(order);
  const progreso = orderProgressIndex(order.status);
  const pistas = pistasPasos(entrega);
  const sede =
    snapshot?.addressLabel ??
    addressesQuery.data?.find((address) => address.id === order.deliveryAddressId)?.label ??
    null;
  const direccion = [sede, order.addressDetail].filter(Boolean).join(" · ") || null;
  const recibe = [order.receiverName, order.receiverPhone].filter(Boolean).join(" · ") || null;
  // Todos los pedidos tienen número tras la migración de T-26a; por si acaso, el respaldo de siempre.
  const numero = order.orderNumber ?? order.id.slice(-8).toUpperCase();
  const estado = isOrderStatus(order.status) ? ORDER_STATUS_LABELS[order.status] : order.status;

  const items = order.items ?? [];
  const unidades = items.reduce((total, item) => total + item.quantity, 0);
  const lineas = (snapshot?.lines ?? []).map((line) => ({
    id: line.id,
    name: line.name,
    imageSrc: line.imageSrc ?? IMAGEN_PRODUCTO_POR_DEFECTO,
    detail: `Cantidad: ${line.quantity}`,
    subtotalLabel: formatPrice(line.subtotal),
  }));
  const tieneImportes = order.subtotal !== null && order.total !== null;

  const detalle = [
    { label: "Número de pedido", value: numero },
    { label: "Entrega", value: entrega },
    { label: "Dirección", value: direccion },
    { label: "Punto de referencia", value: order.addressReference },
    { label: "Recibe", value: recibe },
    { label: "Notas", value: order.notes },
    { label: "Estado", value: estado },
  ].filter((fila) => fila.value);

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-4 sm:gap-5">
      <section
        aria-labelledby={TITULO_ID}
        className="flex flex-col items-center gap-3 rounded-card bg-content1 px-6 py-10 text-center sm:py-12"
      >
        <Image src="/images/decor/flat-2.png" alt="" width={84} height={53} className="ofi-photo-in mb-1" />
        <h2
          id={TITULO_ID}
          tabIndex={-1}
          className="text-balance font-display text-[28px] font-bold leading-9 tracking-[-0.03em] text-foreground outline-none"
        >
          ¡Pedido confirmado!
        </h2>
        <p className="max-w-[52ch] text-pretty text-sm leading-[22px] text-foreground">
          Tu pedido <strong className="font-semibold text-secondary-600">N.º {numero}</strong> quedó
          registrado. Te avisamos en la campana de notificaciones cada vez que cambie de estado.
        </p>
      </section>

      <section aria-label="Estado del pedido" className="rounded-card bg-content1 px-5 py-5 sm:px-6">
        {progreso >= 0 ? (
          <MlOrderTimeline
            steps={ORDER_PROGRESS_STEPS.map((paso, index) => ({
              label: paso.label,
              hint: pistas[index],
            }))}
            completedCount={progreso + 1}
          />
        ) : (
          <p className="text-sm leading-5 text-foreground">
            Este pedido está <strong className="font-semibold">{estado.toLowerCase()}</strong>.
          </p>
        )}
      </section>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          {progreso >= 0 && progreso < 2 && (
            <section aria-labelledby="pedido-sigue-titulo" className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6">
              <h3 id="pedido-sigue-titulo" className={CLASE_TITULO_BLOQUE}>
                Qué sigue
              </h3>
              <ol className="flex flex-col gap-3.5">
                {[
                  "Ofibites revisa tu pedido y lo confirma. Te avisamos por la campana de notificaciones.",
                  entrega
                    ? `Con la confirmación, el pedido queda agendado para el ${entrega.toLowerCase().replace(" · ", " a las ")}${entrega.endsWith(".") ? "" : "."}`
                    : "Con la confirmación, el pedido queda agendado para la fecha que elegiste.",
                  "El día de la entrega te avisamos cuando el pedido salga en camino.",
                ].map((texto, index) => (
                  <li key={texto} className="flex items-start gap-3 text-[13px] leading-5 text-foreground">
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-sand text-xs font-bold text-brand"
                    >
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{texto}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="pedido-detalle-titulo" className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6">
            <h3 id="pedido-detalle-titulo" className={CLASE_TITULO_BLOQUE}>
              Detalle del pedido
            </h3>
            <dl className="flex flex-col gap-2.5 text-[13px] leading-5">
              {detalle.map((fila) => (
                <div key={fila.label} className="grid gap-0.5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-muted">{fila.label}</dt>
                  <dd className="font-semibold text-foreground sm:text-right">{fila.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <OrOrderSummary
          titleId="pedido-resumen"
          countLabel={items.length > 0 ? conteoPedido(items.length, unidades) : undefined}
          lines={lineas}
          rows={
            tieneImportes
              ? filasResumen(
                  {
                    subtotal: order.subtotal ?? 0,
                    discount: order.discount,
                    shipping: order.shipping ?? 0,
                    tax: order.tax ?? 0,
                    taxRate: snapshot?.taxRate,
                  },
                  "Envío",
                )
              : []
          }
          totalLabel={order.total !== null ? formatPrice(order.total) : "—"}
          className="lg:sticky lg:top-0"
        >
          <AtButton as={Link} href={RUTA_ORDENAR} size="lg" className="h-[52px] w-full text-sm">
            Hacer otro pedido
          </AtButton>
          <AtButton
            size="lg"
            variant="bordered"
            color="default"
            className="h-[52px] w-full cursor-not-allowed border-1 border-border-input text-sm text-ghost-foreground"
            aria-disabled="true"
            aria-describedby={PEDIDOS_PRONTO_ID}
            onPress={() => undefined}
            endContent={<AtChip size="sm">Pronto</AtChip>}
          >
            Ver mis pedidos
          </AtButton>
          <p id={PEDIDOS_PRONTO_ID} className="text-center text-[11px] leading-4 text-muted">
            La lista de pedidos estará disponible muy pronto.
          </p>
        </OrOrderSummary>
      </div>
    </div>
  );
}
