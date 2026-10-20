"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { ChevronLeft } from "lucide-react";

import { useRepeatOrder } from "@/domain/hooks/cart";
import { useCompanyAddresses } from "@/domain/hooks/company-addresses";
import { useDepartments } from "@/domain/hooks/departments";
import { useOrder } from "@/domain/hooks/orders";
import {
  ORDER_STATUS_GROUP_COLORS,
  ORDER_STATUS_GROUP_LABELS,
  ORDER_STATUS_GROUP_STEPS,
  orderStatusGroupStepIndex,
} from "@/domain/models";
import { useAuthStore, useCartNoticeStore } from "@/domain/stores";
import {
  dateOnlyFromApi,
  formatCaracasDateSlash,
  formatDateOnlyLong,
  formatPrice,
  formatWallTime,
  isApiError,
  isWallTime,
} from "@/shared/utils";
import {
  AtButton,
  AtChip,
  AtSkeleton,
  MlEmptyState,
  MlOrderTimeline,
  OrConfirmModal,
  OrOrderSummary,
} from "@/ui/atomic";

import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../../_data/imagenes";
import { avisoPedidoRepetido, mensajeErrorRepetir } from "../../../_data/repetir-pedido";
import { filasResumen } from "../../../_data/resumen-pedido";
import { RUTA_CARRITO, RUTA_ORDENAR, RUTA_PEDIDOS } from "../../../_navegacion";
import { nombreUsuarioPedido } from "../../_data/nombre-usuario";

import { useNombresCatalogo } from "./use-nombres-catalogo";

const TITULO_ID = "pedido-detalle-titulo";
const CLASE_TITULO_BLOQUE = "font-display text-xl font-bold leading-7 text-foreground";

/** "Jueves 26 de septiembre · 9:00 a.m." (fecha `@db.Date` y hora de pared, sin convertir zona). */
function entregaDe(deliveryDate: string | null, deliveryTime: string | null): string | null {
  const fecha = dateOnlyFromApi(deliveryDate);
  if (!fecha) return null;
  const hora = deliveryTime && isWallTime(deliveryTime) ? formatWallTime(deliveryTime) : null;
  return [formatDateOnlyLong(fecha), hora].filter(Boolean).join(" · ");
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
  const router = useRouter();
  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;
  const user = useAuthStore((state) => state.user);
  const setCartNotice = useCartNoticeStore((state) => state.setNotice);

  const addressesQuery = useCompanyAddresses();
  const departmentsQuery = useDepartments();
  const catalogNamesQuery = useNombresCatalogo();
  const repeat = useRepeatOrder();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [repeatError, setRepeatError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

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
  const entrega = entregaDe(order.deliveryDate, order.deliveryTime);
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
    { label: "Fecha de creación", value: formatCaracasDateSlash(order.createdAt) },
    { label: "Fecha de entrega", value: entrega },
    { label: "Dirección de entrega", value: direccion },
    { label: "Contacto en recepción", value: contacto },
    { label: "Usuario que realizó el pedido", value: departamento ? `${usuario} · ${departamento}` : usuario },
    { label: "Notas", value: order.notes },
  ].filter((fila) => fila.value);

  const resumenLineas = items.map((item) => {
    const key = item.comboId ? `combo:${item.comboId}` : `product:${item.productId}`;
    return {
      id: item.id,
      name: nombres?.get(key) ?? "Producto",
      imageSrc: IMAGEN_PRODUCTO_POR_DEFECTO,
      detail: `Cantidad: ${item.quantity}`,
      subtotalLabel: item.subtotal !== null ? formatPrice(item.subtotal) : "—",
    };
  });

  const abrirConfirmacion = () => {
    setRepeatError(null);
    setIsConfirmOpen(true);
  };

  const confirmarRepetir = () => {
    repeat
      .mutateAsync(order.id)
      .then((resultado) => {
        setIsConfirmOpen(false);
        setCartNotice(avisoPedidoRepetido(resultado, order.orderNumber ?? undefined));
        router.push(RUTA_CARRITO);
      })
      .catch((error: unknown) => {
        setIsConfirmOpen(false);
        setRepeatError(mensajeErrorRepetir(error));
        requestAnimationFrame(() => errorRef.current?.focus());
      });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-4 sm:gap-5">
      <Link
        href={RUTA_PEDIDOS}
        className="inline-flex items-center gap-1 self-start rounded-sm text-[13px] font-semibold text-foreground outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Volver a pedidos
      </Link>

      <section className="flex flex-col gap-4 rounded-card bg-content1 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 id={TITULO_ID} className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
              Pedido #{numero}
            </h1>
            <AtChip size="sm" variant="flat" color={ORDER_STATUS_GROUP_COLORS[order.statusGroup]} className="self-start">
              {estadoLabel}
            </AtChip>
            <p className="text-[13px] leading-5 text-muted">
              Creado el {formatCaracasDateSlash(order.createdAt)} por {usuario}
              {departamento ? ` · ${departamento}` : ""}
            </p>
          </div>
          <AtButton size="md" onPress={abrirConfirmacion} isLoading={repeat.isPending}>
            Repetir pedido
          </AtButton>
        </div>
        {repeatError && (
          <p ref={errorRef} role="alert" tabIndex={-1} className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700 outline-none">
            {repeatError}
          </p>
        )}
      </section>

      <section aria-label="Seguimiento" className="rounded-card bg-content1 px-5 py-5 sm:px-6">
        {pasoActual >= 0 ? (
          <MlOrderTimeline
            label="Seguimiento"
            steps={ORDER_STATUS_GROUP_STEPS.map((grupo) => ({
              label: ORDER_STATUS_GROUP_LABELS[grupo],
            }))}
            completedCount={pasoActual + 1}
          />
        ) : (
          <p className="text-sm leading-5 text-foreground">
            Este pedido está <strong className="font-semibold">{estadoLabel.toLowerCase()}</strong>.
          </p>
        )}
      </section>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <section aria-labelledby="pedido-info-titulo" className="flex flex-col gap-4 rounded-card bg-content1 p-5 sm:p-6">
            <h2 id="pedido-info-titulo" className={CLASE_TITULO_BLOQUE}>
              Información del pedido
            </h2>
            <dl className="flex flex-col gap-2.5 text-[13px] leading-5">
              {detalle.map((fila) => (
                <div key={fila.label} className="grid gap-0.5 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-muted">{fila.label}</dt>
                  <dd className="font-semibold text-foreground sm:text-right">{fila.value}</dd>
                </div>
              ))}
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
            <Table aria-label="Productos del pedido" shadow="none" radius="none" removeWrapper>
              <TableHeader>
                <TableColumn>PRODUCTO</TableColumn>
                <TableColumn>PRECIO</TableColumn>
                <TableColumn>CANTIDAD</TableColumn>
                <TableColumn>TOTAL</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Sin productos.">
                {items.map((item) => {
                  const key = item.comboId ? `combo:${item.comboId}` : `product:${item.productId}`;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{nombres?.get(key) ?? "Producto"}</TableCell>
                      <TableCell>{item.unitPrice !== null ? formatPrice(item.unitPrice) : "—"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
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

        <OrOrderSummary
          title="Total del pedido"
          titleId="pedido-resumen-titulo"
          countLabel={items.length > 0 ? `${items.length} productos · ${unidades} unidades` : undefined}
          lines={resumenLineas}
          rows={
            tieneImportes
              ? filasResumen({
                  subtotal: order.subtotal ?? 0,
                  discount: order.discount,
                  shipping: order.shipping ?? 0,
                  tax: order.tax ?? 0,
                })
              : []
          }
          totalLabel={order.total !== null ? formatPrice(order.total) : "—"}
          className="lg:sticky lg:top-0"
        >
          <AtButton size="lg" className="h-[52px] w-full text-sm" onPress={abrirConfirmacion} isLoading={repeat.isPending}>
            Repetir este pedido
          </AtButton>
          <AtButton as={Link} href={RUTA_ORDENAR} size="lg" variant="bordered" color="default" className="h-[52px] w-full border-1 border-border-input text-sm text-ghost-foreground">
            Hacer otro pedido
          </AtButton>
        </OrOrderSummary>
      </div>

      <OrConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmarRepetir}
        title={`Repetir el pedido #${numero}`}
        description={`Vamos a cargar ${items.length === 1 ? "este producto" : `estos ${items.length} productos`} en tu carrito. Ahí eliges la fecha de entrega y ajustas cantidades antes de confirmar.`}
        confirmLabel="Cargar en el carrito"
        isConfirming={repeat.isPending}
      />
    </div>
  );
}
