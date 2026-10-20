"use client";

import { ReactNode, useMemo } from "react";
import Link from "next/link";

import { ClipboardList, CloudOff, Plus } from "lucide-react";

import { useBranches } from "@/domain/hooks/branches";
import { useDepartments } from "@/domain/hooks/departments";
import { EstadoQaPedidos, useOrders } from "@/domain/hooks/orders";
import { ORDER_STATUS_GROUP_FILTERS, ORDER_STATUS_GROUP_LABELS } from "@/domain/models";
import { useAuthStore } from "@/domain/stores";
import { OrderStatusGroup } from "@/domain/types";
import { AtButton, AtSkeleton, MlEmptyState, MlPagination, OrOrderFiltersBar, OrOrderTable } from "@/ui/atomic";

import { RUTA_ORDENAR } from "../../_navegacion";

import { construirFilaPedido, filtrarPedidos, ordenarPedidos } from "./filtrar-pedidos";
import { RangoFechaPedidos, useFiltrosPedidos } from "./use-filtros-pedidos";

// 10 por página: el Figma muestra 6, pero no fija el tamaño del lote (a diferencia de Ordenar, que sigue el
// `pageSize` del contrato); todo se pagina en cliente sobre el resultado completo de `GET /orders`.
const PAGE_SIZE = 10;

const DATE_OPTIONS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
  { value: "todo", label: "Todo el tiempo" },
];

function Esqueleto() {
  return (
    <div className="flex flex-col gap-5">
      <AtSkeleton className="h-[57px] rounded-full" />
      <div className="flex flex-wrap gap-3">
        {[160, 160, 160, 160].map((width, index) => (
          <AtSkeleton key={index} className="h-10 rounded-full" style={{ width }} />
        ))}
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
  const filasPagina = filasFiltradas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

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
          onDateChange={(value) => actualizar({ fecha: value as RangoFechaPedidos, pagina: 1 })}
          branchOptions={branchOptions}
          branchValue={filtros.sede ?? "all"}
          onBranchChange={(value) => actualizar({ sede: value === "all" ? undefined : value, pagina: 1 })}
          isLoadingBranches={branchesQuery.isPending}
          userOptions={userOptions}
          userValue={filtros.usuario ?? "all"}
          onUserChange={(value) => actualizar({ usuario: value === "all" ? undefined : value, pagina: 1 })}
        />

        {filasFiltradas.length === 0 ? (
          <div className="rounded-card bg-content1">
            <MlEmptyState
              headingLevel={2}
              title="No encontramos pedidos con esos filtros"
              description="Prueba con un rango de fechas más amplio, o quita alguno de los filtros que tienes activos."
              actionLabel={hayFiltrosActivos ? "Limpiar filtros" : undefined}
              onAction={hayFiltrosActivos ? limpiarFiltros : undefined}
            />
          </div>
        ) : (
          <>
            <OrOrderTable rows={filasPagina} />
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted">
                Mostrando {filasPagina.length} de {filasFiltradas.length} pedidos
              </p>
              <MlPagination page={pagina} totalPages={totalPages} onChange={(p) => actualizar({ pagina: p })} label="Páginas de pedidos" />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-card bg-content1 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
            Pedidos realizados
          </h1>
          <p className="max-w-[52ch] text-sm leading-[22px] text-muted">
            Todo lo que ha pedido tu empresa, con su estado de entrega.
          </p>
        </div>
        <AtButton as={Link} href={RUTA_ORDENAR} size="md" startContent={<Plus aria-hidden="true" className="size-4" />}>
          Nuevo pedido
        </AtButton>
      </div>

      {content}
    </div>
  );
}
