"use client";

import { useRef } from "react";
import Link from "next/link";

import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ChevronLeft } from "lucide-react";

import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { useDepartments } from "@/domain/hooks/departments";
import { useOrder } from "@/domain/hooks/orders";
import {
  ORDER_STATUS_GROUP_LABELS,
  ORDER_STATUS_GROUP_STEPS,
  ORDER_STATUS_GROUP_TONES,
  orderStatusGroupStepIndex,
} from "@/domain/models";
import { useAuthStore } from "@/domain/stores";
import { OrderStatusGroup } from "@/domain/types";
import { formatCaracasDateSlash, formatPrice, isApiError } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  AtStatusChip,
  MlEmptyState,
  MlNoticeBanner,
  MlOrderTimeline,
  OrConfirmModal,
  OrOrderSummary,
} from "@/ui/atomic";

import { filasResumen } from "../../../_data/resumen-pedido";
import { RUTA_PEDIDOS } from "../../../_navegacion";
import { pedidoARepetir, sePuedeRepetir, useRepetirPedido } from "../../_components/use-repetir-pedido";
import { nombreUsuarioPedido } from "../../_data/nombre-usuario";
import { diaMesPura, fechaPura, hora, horaPared } from "../../_data/textos-pago";

import { ProductosARepetir } from "./productos-a-repetir";
import { useNombresCatalogo } from "./use-nombres-catalogo";
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

/**
 * Chip de "Estado del pedido" (Figma 3632:1686 / 3567:1374). Sin historial de transiciones no hay fecha de entrega
 * real: "Entregado" va sin hora; Programado y En tránsito dicen para cuándo está programado.
 */
function textoEstadoPedido(grupo: OrderStatusGroup, deliveryDate: string | null): string {
  if (grupo === "scheduled" || grupo === "in_transit") {
    const fecha = fechaPuraONull(deliveryDate);
    return fecha ? `Programado para el ${diaMesPura(deliveryDate)}` : ORDER_STATUS_GROUP_LABELS[grupo];
  }
  return ORDER_STATUS_GROUP_LABELS[grupo];
}

/** Ayudas de los pasos del seguimiento: solo las derivables sin historial (el en curso de Programado y "Pendiente"). */
function ayudasSeguimiento(
  grupo: OrderStatusGroup,
  completados: number,
  deliveryDate: string | null,
  deliveryTime: string | null,
): (string | undefined)[] {
  return ORDER_STATUS_GROUP_STEPS.map((paso, index) => {
    if (index > completados) return "Pendiente";
    if (index < completados || paso !== "scheduled") return undefined;
    if (grupo === "in_transit") return "En camino";
    const fecha = fechaPuraONull(deliveryDate);
    if (!fecha) return undefined;
    const horaEntrega = horaPared(deliveryTime);
    return `Para el ${diaMesPura(deliveryDate)}${horaEntrega ? ` a las ${horaEntrega}` : ""}`;
  });
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

export function DetallePedido({ orderId }: { orderId: string }) {
  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;
  const user = useAuthStore((state) => state.user);

  const addressesQuery = useCompanyAddresses();
  const departmentsQuery = useDepartments();
  const catalogNamesQuery = useNombresCatalogo();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const repetir = useRepetirPedido(errorRef);
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
  // El paso del grupo actual va "en curso" (no cumplido); Entregado deja los tres cumplidos.
  const pasosCumplidos = order.statusGroup === "delivered" ? ORDER_STATUS_GROUP_STEPS.length : pasoActual;
  const ayudas = ayudasSeguimiento(
    order.statusGroup,
    pasosCumplidos,
    order.deliveryDate,
    order.deliveryTime,
  );
  const departamento = departmentsQuery.data?.find((d) => d.id === order.departmentId)?.name ?? null;
  const usuario = nombreUsuarioPedido(order.userId ?? order.createdById, user);
  const sedeAddress = addressesQuery.data?.find((a) => a.id === order.deliveryAddressId);
  const direccion = [sedeAddress?.label || sedeAddress?.line1, order.addressDetail].filter(Boolean).join(" · ") || null;
  const contacto = [order.receiverName, order.receiverPhone].filter(Boolean).join(" · ") || null;
  const nombres = catalogNamesQuery.data;

  const items = order.items ?? [];
  const unidades = items.reduce((total, item) => total + item.quantity, 0);
  const tieneImportes = order.subtotal !== null && order.total !== null;

  const detalle = [
    { label: "Fecha de creación", value: `${formatCaracasDateSlash(order.createdAt)}, ${hora(order.createdAt)}` },
    { label: "Fecha de entrega", value: fechaPuraONull(order.deliveryDate) },
    { label: "Hora de entrega", value: horaPared(order.deliveryTime) },
    { label: "Dirección de entrega", value: direccion },
    { label: "Contacto en recepción", value: contacto },
    { label: "Usuario que realizó el pedido", value: departamento ? `${usuario} · ${departamento}` : usuario },
    { label: "Método de pago", value: pago.metodoPago },
    { label: "Notas", value: order.notes },
  ].filter((fila) => fila.value);

  const puedeRepetir = sePuedeRepetir(order);
  const repetirEnCabecera = puedeRepetir && pago.muestraRepetirEnCabecera;
  const repetirEnTotal = puedeRepetir && pago.muestraRepetirEnTotal;
  const abrirConfirmacion = () => repetir.abrir(pedidoARepetir(order));
  const accion = pago.accionCabecera;
  // Con una acción principal (Pagar factura), "Repetir pedido" va a su izquierda con borde; si no, a la derecha y sólido.
  const accionPrincipal = accion?.variant === "primary";
  const botonRepetir = repetirEnCabecera && (
    <AtButton
      size="md"
      variant={accionPrincipal ? "bordered" : "solid"}
      className={cn(CLASE_BOTON_CABECERA, accionPrincipal && CLASE_BOTON_BORDE)}
      onPress={abrirConfirmacion}
      isLoading={repetir.isPending}
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
              Creado el {formatCaracasDateSlash(order.createdAt)} por {usuario}
              {departamento ? ` · ${departamento}` : ""}
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
        {repetir.error && (
          <p ref={errorRef} role="alert" tabIndex={-1} className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700 outline-none">
            {repetir.error.message}
          </p>
        )}
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
                    {textoEstadoPedido(order.statusGroup, order.deliveryDate)}
                  </AtStatusChip>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="pedido-productos-titulo" className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="pedido-productos-titulo" className={CLASE_TITULO_BLOQUE}>
                Productos del pedido
              </h2>
              <p className="text-xs text-muted">
                {items.length} {items.length === 1 ? "producto" : "productos"} · {unidades} {unidades === 1 ? "unidad" : "unidades"}
              </p>
            </div>
            <Table
              aria-label="Productos del pedido"
              shadow="none"
              radius="none"
              removeWrapper
              // Figma: cabecera sin fondo (10 px), filas de 63 px separadas por una línea `track` (no sobre la primera)
              // e importes a la derecha.
              classNames={{
                th: cn(
                  "h-8 bg-transparent px-0 text-[10px] font-semibold text-foreground first:rounded-none last:rounded-none",
                  "[&:not(:first-child)]:pl-4 [&:not(:first-child)]:text-right",
                ),
                td: cn(
                  "h-[63px] border-track px-0 text-[13px] [&:not(:first-child)]:pl-4 [&:not(:first-child)]:text-right",
                  "[tr:not([data-first=true])>&]:border-t",
                ),
              }}
            >
              <TableHeader>
                <TableColumn>PRODUCTO</TableColumn>
                <TableColumn>PRECIO UNIT.</TableColumn>
                <TableColumn>CANTIDAD</TableColumn>
                <TableColumn>TOTAL</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Sin productos.">
                {items.map((item) => {
                  const key = item.comboId ? `combo:${item.comboId}` : `product:${item.productId}`;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-foreground">{nombres?.get(key) ?? "Producto"}</TableCell>
                      <TableCell>{item.unitPrice !== null ? formatPrice(item.unitPrice) : "—"}</TableCell>
                      <TableCell className="font-semibold text-foreground">{item.quantity}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {item.subtotal !== null ? formatPrice(item.subtotal) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
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
              <AtButton size="lg" className="h-[52px] w-full text-sm" onPress={abrirConfirmacion} isLoading={repetir.isPending}>
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
                completedCount={pasosCumplidos}
              />
            ) : (
              <p className="text-sm leading-5 text-foreground">
                Este pedido está <strong className="font-semibold">{estadoLabel.toLowerCase()}</strong>.
              </p>
            )}
          </section>
        </div>
      </div>

      <OrConfirmModal {...repetir.modalProps} size="lg">
        <ProductosARepetir
          productos={items.map((item) => ({
            id: item.id,
            nombre: nombres?.get(item.comboId ? `combo:${item.comboId}` : `product:${item.productId}`) ?? "Producto",
            cantidad: item.quantity,
            precioUnitario: item.unitPrice,
          }))}
        />
      </OrConfirmModal>
      {pago.modales}
    </div>
  );
}
