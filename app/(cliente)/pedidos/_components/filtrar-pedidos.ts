import { ORDER_STATUS_GROUP_LABELS, paymentStatusListView } from "@/domain/models";
import { Order, OrderInvoice } from "@/domain/types";
import { formatCaracasDateSlash, formatPrice } from "@/shared/utils";
import { OrOrderTableRow } from "@/ui/atomic";

import { rutaPedido, rutaRepetirPedido } from "../../_navegacion";
import { sePuedeRepetir } from "../_data/repetir";

import { FiltrosPedidos } from "./use-filtros-pedidos";

/** Fila de la tabla con los campos crudos que necesitan los filtros (no solo lo que se pinta). */
export interface FilaPedido extends OrOrderTableRow {
  branchId: string | null;
  /**
   * Quien hizo el pedido: `Order.user.id` (T-38: `userId` o, si no hay, `createdById`, resuelto por el back). Es el
   * valor del filtro "Usuario".
   */
  filterUserId: string;
  createdAt: string;
  /** Ruta del editor "Repetir pedido" o `null` si el pedido no tiene líneas (mismo criterio que el detalle). */
  repetirHref: string | null;
  /** Nombres de los productos (T-38: `items[].name`), para buscar "por producto". */
  productos: string[];
  /** Factura del pedido (T-06) para "Pagar factura" y "Descargar factura"; `null` sin factura. */
  invoice: OrderInvoice | null;
}

const SIN_DATO = "—";

/**
 * `Order` real (`GET /orders`) a fila de tabla. "Usuario" y "Departamento" vienen del back (T-38: `user` y
 * `department`). "Tipo de pedido" sigue sin campo en el back (hueco de T-28, DECISIONES T-28b): siempre "—".
 */
export function construirFilaPedido(order: Order): FilaPedido {
  const filterUserId = order.user?.id ?? order.userId ?? order.createdById;
  return {
    id: order.id,
    orderNumber: order.orderNumber ?? order.id.slice(-8).toUpperCase(),
    dateLabel: formatCaracasDateSlash(order.createdAt),
    dateTime: order.createdAt,
    departmentLabel: order.department?.name ?? SIN_DATO,
    userLabel: order.user?.name ?? SIN_DATO,
    typeLabel: SIN_DATO,
    amountLabel: order.total !== null ? formatPrice(order.total) : SIN_DATO,
    statusGroup: order.statusGroup,
    statusLabel: ORDER_STATUS_GROUP_LABELS[order.statusGroup],
    payment: order.invoice ? paymentStatusListView(order.invoice.paymentStatus) : null,
    detailHref: rutaPedido(order.id),
    branchId: order.branchId,
    filterUserId,
    createdAt: order.createdAt,
    repetirHref: sePuedeRepetir(order) ? rutaRepetirPedido(order.id) : null,
    productos: (order.items ?? []).map((item) => item.name).filter(Boolean),
    invoice: order.invoice ?? null,
  };
}

const DIA_EN_MS = 24 * 60 * 60 * 1000;

function dentroDelRango(createdAt: string, fecha: FiltrosPedidos["fecha"], ahora: number): boolean {
  if (fecha === "todo") return true;
  const dias = Number(fecha);
  return ahora - Date.parse(createdAt) <= dias * DIA_EN_MS;
}

function coincideBusqueda(fila: FilaPedido, q: string): boolean {
  const texto = q.trim().toLowerCase();
  if (!texto) return true;
  // T-06: también por número de factura (proforma o fiscal); T-38: por nombre de producto.
  const candidatos = [
    fila.orderNumber,
    fila.userLabel,
    fila.departmentLabel,
    fila.invoice?.invoiceNumber ?? "",
    fila.invoice?.fiscalNumber ?? "",
    ...fila.productos,
  ];
  return candidatos.some((valor) => valor.toLowerCase().includes(texto));
}

/**
 * Filtra las filas con los 4 dropdowns, la fecha y el buscador. `GET /orders` de T-28a ya filtra y pagina
 * en servidor (`statusGroup`, `branchId`, `userId`, `search` por nº de pedido, `skip`/`take`), pero aquí
 * se aplica todo en **cliente** sobre el array completo (sin filtros ni paginación en la petición): con
 * los pedidos de una empresa normal esto es instantáneo y evita que el filtro "Usuario" (que sale de los
 * propios pedidos cargados) se quede sin opciones al filtrar por otra cosa. Repetir el filtrado en servidor
 * queda para cuando el volumen lo justifique (ver DECISIONES T-28b). Sin filtro de estado activo, los
 * cancelados/rechazados siguen saliendo (decisión 2026-10-20: "Cancelado" no es un tab, pero el pedido se ve
 * igual en la tabla).
 */
export function filtrarPedidos(
  filas: FilaPedido[],
  filtros: FiltrosPedidos,
  ahora = Date.now(),
): FilaPedido[] {
  return filas.filter((fila) => {
    if (filtros.grupo && fila.statusGroup !== filtros.grupo) return false;
    if (filtros.sede && fila.branchId !== filtros.sede) return false;
    if (filtros.usuario && fila.filterUserId !== filtros.usuario) return false;
    if (!dentroDelRango(fila.createdAt, filtros.fecha, ahora)) return false;
    if (!coincideBusqueda(fila, filtros.q)) return false;
    return true;
  });
}

const porFechaDesc = (a: FilaPedido, b: FilaPedido) => Date.parse(b.createdAt) - Date.parse(a.createdAt);

/** Filas ordenadas de la más reciente a la más antigua (como el Figma). */
export function ordenarPedidos(filas: FilaPedido[]): FilaPedido[] {
  return [...filas].sort(porFechaDesc);
}
