"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { ClipboardList, CloudOff, Plus } from "lucide-react";

import { useBranches } from "@/domain/hooks/branches";
import { useDepartments } from "@/domain/hooks/departments";
import { useCanReportPayments, useDownloadInvoice } from "@/domain/hooks/invoices";
import { EstadoQaPedidos, useOrders } from "@/domain/hooks/orders";
import { isInvoicePayable, ORDER_STATUS_GROUP_FILTERS, ORDER_STATUS_GROUP_LABELS } from "@/domain/models";
import { useAuthStore } from "@/domain/stores";
import { OrderStatusGroup } from "@/domain/types";
import { getApiErrorMessage } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  MlEmptyState,
  MlPagination,
  OrConfirmModal,
  OrOrderFiltersBar,
  OrOrderTable,
  OrOrderTableAction,
} from "@/ui/atomic";

import { RUTA_ORDENAR, rutaPagarFactura } from "../../_navegacion";

import { construirFilaPedido, FilaPedido, filtrarPedidos, ordenarPedidos } from "./filtrar-pedidos";
import { RangoFechaPedidos, useFiltrosPedidos } from "./use-filtros-pedidos";
import { useRepetirPedido } from "./use-repetir-pedido";

// 10 por página: el Figma muestra 6, pero no fija el tamaño del lote (a diferencia de Ordenar, que sigue el
// `pageSize` del contrato); todo se pagina en cliente sobre el resultado completo de `GET /orders`.
const PAGE_SIZE = 10;

const ACCION_REPETIR = "repetir";
const ACCION_PAGAR = "pagar-factura";
const ACCION_DESCARGAR = "descargar-factura";

/**
 * Menú "···" del Figma `3562:1180` (después de "Ver pedido", que pone la tabla): "Repetir pedido" si tiene líneas;
 * "Pagar factura" si la factura admite pago (`PENDING`, `REJECTED`, `OVERDUE`) y el usuario puede reportar pagos;
 * "Descargar factura" si hay factura (también anulada: sale con el sello "ANULADA").
 */
function accionesFila(fila: FilaPedido, puedePagar: boolean): OrOrderTableAction[] {
  const acciones: OrOrderTableAction[] = [];
  if (fila.repetir) acciones.push({ key: ACCION_REPETIR, label: "Repetir pedido" });
  if (fila.invoice && puedePagar && isInvoicePayable(fila.invoice)) {
    acciones.push({ key: ACCION_PAGAR, label: "Pagar factura", href: rutaPagarFactura(fila.id) });
  }
  if (fila.invoice) acciones.push({ key: ACCION_DESCARGAR, label: "Descargar factura" });
  return acciones;
}

const DATE_OPTIONS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
  { value: "todo", label: "Todo el tiempo" },
];

function Esqueleto() {
  return (
    <div className="flex flex-col gap-5">
      {/* Misma disposición que `OrOrderFiltersBar`: buscador y filtros en una fila desde xl. */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <AtSkeleton className="h-12 w-full rounded-full xl:min-w-[260px] xl:flex-1" />
        <div className="flex flex-wrap gap-3 xl:flex-nowrap">
          {[0, 1, 2, 3].map((index) => (
            <AtSkeleton key={index} className="h-10 w-[210px] shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <AtSkeleton className="h-[360px] rounded-card" />
    </div>
  );
}

interface PedidosClienteProps {
  estadoQa?: EstadoQaPedidos;
}

/**
 * "Pedidos realizados" (Figma `3562:1180`): filtros (estado, fecha, sede, usuario y buscador libre), tabla y
 * los estados vacíos de `3564:1218`/`3564:1442`. Sobre `GET /orders` real (ya con `statusGroup`): el back
 * todavía no filtra ni pagina, así que todo pasa en cliente (ver DECISIONES 2026-10-20 · T-28b).
 */
export function PedidosCliente({ estadoQa }: PedidosClienteProps) {
  const user = useAuthStore((state) => state.user);
  const { filtros, actualizar } = useFiltrosPedidos();
  const ordersQuery = useOrders({ qaState: estadoQa });
  const branchesQuery = useBranches();
  const departmentsQuery = useDepartments();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const repetir = useRepetirPedido(errorRef);
  const puedePagar = useCanReportPayments();
  const descargar = useDownloadInvoice();
  const [descargandoId, setDescargandoId] = useState<string | null>(null);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  const descargarFactura = (fila: FilaPedido) => {
    if (!fila.invoice || descargandoId) return;
    setErrorDescarga(null);
    setDescargandoId(fila.id);
    descargar
      .mutateAsync(fila.invoice)
      .catch((err: unknown) => {
        setErrorDescarga(
          getApiErrorMessage(err, `No pudimos descargar la factura del pedido #${fila.orderNumber}. Inténtalo de nuevo.`),
        );
        requestAnimationFrame(() => errorRef.current?.focus());
      })
      .finally(() => setDescargandoId(null));
  };

  // En su propio `useMemo`: así la referencia no cambia en cada render mientras los datos no cambien, y los
  // `useMemo` que dependen de ellos no se recalculan de más (react-hooks/exhaustive-deps).
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);
  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data]);

  const filas = useMemo(
    () => ordenarPedidos(orders.map((order) => construirFilaPedido(order, departments, user))),
    [orders, departments, user],
  );
  const filasFiltradas = useMemo(() => filtrarPedidos(filas, filtros), [filas, filtros]);

  const totalPages = Math.max(1, Math.ceil(filasFiltradas.length / PAGE_SIZE));
  const pagina = Math.min(filtros.pagina, totalPages);
  // Menú "···": "Ver pedido" lo pone la tabla; aquí, las acciones que dependen del pedido y del permiso de pago.
  const filasPagina = filasFiltradas
    .slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)
    .map((fila) => ({ ...fila, actions: accionesFila(fila, puedePagar) }));
  const errorAccion = repetir.error?.message ?? errorDescarga;

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Todos" },
      ...ORDER_STATUS_GROUP_FILTERS.map((grupo) => ({
        value: grupo,
        label: ORDER_STATUS_GROUP_LABELS[grupo],
      })),
    ],
    [],
  );

  const branchOptions = useMemo(
    () => [{ value: "all", label: "Todas" }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))],
    [branches],
  );

  // Las opciones salen de los pedidos ya cargados (sin descargar el equipo completo de la empresa): el nombre
  // de cada uno es el mismo respaldo documentado en `_data/nombre-usuario.ts`.
  const userOptions = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const fila of filas) {
      if (!vistos.has(fila.filterUserId)) vistos.set(fila.filterUserId, fila.userLabel);
    }
    return [
      { value: "all", label: "Todos" },
      ...[...vistos.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    ];
  }, [filas]);

  const hayFiltrosActivos = Boolean(filtros.grupo || filtros.sede || filtros.usuario || filtros.q) || filtros.fecha !== "30";

  const limpiarFiltros = () =>
    actualizar({ grupo: undefined, sede: undefined, usuario: undefined, q: "", fecha: "30", pagina: 1 });

  let content: ReactNode;

  if (ordersQuery.isPending) {
    content = <Esqueleto />;
  } else if (ordersQuery.isError) {
    content = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          headingLevel={2}
          icon={<CloudOff />}
          title="No pudimos cargar tus pedidos"
          description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => ordersQuery.refetch()}
          isActionLoading={ordersQuery.isFetching}
        />
      </div>
    );
  } else if (orders.length === 0) {
    content = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          headingLevel={2}
          icon={<ClipboardList />}
          title="Todavía no has hecho ningún pedido"
          description="Cuando hagas el primero, aquí vas a ver su estado de entrega y vas a poder repetirlo en dos clics."
          actionLabel="Hacer mi primer pedido"
          actionHref={RUTA_ORDENAR}
        />
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-5">
        {errorAccion && filasFiltradas.length > 0 && (
          <p
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="rounded-control bg-danger-50 px-3 py-2 text-sm text-danger-700 outline-none"
          >
            {errorAccion}
          </p>
        )}
        {/* Figma 3562:1180: filtros, tabla y paginación en una sola card. Sin resultados (3564:1218), la
            tabla conserva la cabecera y el vacío va dentro, con el tomate y "Limpiar filtros" como botón
            secundario. */}
        <OrOrderTable
          rows={filasFiltradas.length === 0 ? [] : filasPagina}
          busyOrderId={repetir.pedidoEnCurso ?? descargandoId}
          onRowAction={(row, key) => {
            const fila = filasPagina.find((item) => item.id === row.id);
            if (!fila) return;
            if (key === ACCION_REPETIR && fila.repetir) {
              setErrorDescarga(null);
              repetir.abrir(fila.repetir);
            }
            if (key === ACCION_DESCARGAR) descargarFactura(fila);
          }}
          topContent={
            <div className="px-5 py-[18px]">
              <OrOrderFiltersBar
                search={filtros.q}
                onSearchChange={(q) => actualizar({ q, pagina: 1 })}
                statusOptions={statusOptions}
                statusValue={filtros.grupo ?? "all"}
                onStatusChange={(value) =>
                  actualizar({ grupo: value === "all" ? undefined : (value as OrderStatusGroup), pagina: 1 })
                }
                dateOptions={DATE_OPTIONS}
                dateValue={filtros.fecha}
                defaultDateValue="30"
                onDateChange={(value) => actualizar({ fecha: value as RangoFechaPedidos, pagina: 1 })}
                branchOptions={branchOptions}
                branchValue={filtros.sede ?? "all"}
                onBranchChange={(value) => actualizar({ sede: value === "all" ? undefined : value, pagina: 1 })}
                isLoadingBranches={branchesQuery.isPending}
                userOptions={userOptions}
                userValue={filtros.usuario ?? "all"}
                onUserChange={(value) => actualizar({ usuario: value === "all" ? undefined : value, pagina: 1 })}
              />
            </div>
          }
          bottomContent={
            filasFiltradas.length > 0 && (
              <div className="flex flex-col items-center gap-3 border-t border-surface-sand px-5 py-4 sm:flex-row sm:justify-between">
                <p className="text-xs text-placeholder">
                  Mostrando {filasPagina.length} de {filasFiltradas.length} pedidos
                </p>
                <MlPagination
                  page={pagina}
                  totalPages={totalPages}
                  onChange={(p) => actualizar({ pagina: p })}
                  label="Páginas de pedidos"
                  surface="card"
                />
              </div>
            )
          }
          emptyContent={
            <MlEmptyState
              headingLevel={2}
              illustrationSrc="/images/empty/tomate.png"
              titleTone="brand"
              title="No encontramos pedidos con esos filtros"
              description="Prueba con un rango de fechas más amplio, o quita alguno de los filtros que tienes activos."
              actionLabel={hayFiltrosActivos ? "Limpiar filtros" : undefined}
              actionVariant="bordered"
              onAction={hayFiltrosActivos ? limpiarFiltros : undefined}
              className="py-12"
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
            Pedidos realizados
          </h1>
          <p className="text-sm leading-[17px] text-brand">
            Todo lo que ha pedido tu empresa, con su estado de entrega y de pago.
          </p>
        </div>
        <AtButton as={Link} href={RUTA_ORDENAR} size="md" startContent={<Plus aria-hidden="true" className="size-4" />}>
          Nuevo pedido
        </AtButton>
      </div>

      {content}

      <OrConfirmModal {...repetir.modalProps} />
    </div>
  );
}
