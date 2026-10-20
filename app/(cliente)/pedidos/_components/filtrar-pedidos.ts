import { ORDER_STATUS_GROUP_LABELS } from "@/domain/models";
import { Department, Order, User } from "@/domain/types";
import { formatCaracasDateSlash, formatPrice } from "@/shared/utils";
import { OrOrderTableRow } from "@/ui/atomic";

import { rutaPedido } from "../../_navegacion";
import { nombreUsuarioPedido } from "../_data/nombre-usuario";

import { FiltrosPedidos } from "./use-filtros-pedidos";

/** Fila de la tabla con los campos crudos que necesitan los filtros (no solo lo que se pinta). */
export interface FilaPedido extends OrOrderTableRow {
  branchId: string | null;
  /**
   * `Order.userId` (quién hizo el pedido) si existe, si no `createdById`: es el campo que filtra el
   * back con `?userId=` (T-28a, confirmado en CONTRATOS-API) — `userId` puede ser `null` en pedidos
   * viejos o creados por otro rol, y entonces se usa quien lo creó como mejor aproximación.
   */
  filterUserId: string;
  createdAt: string;
}

const SIN_DATO = "—";

/**
 * `Order` real (`GET /orders`, ya con `statusGroup`) a fila de tabla. "Departamento" sale de
 * `GET /companies/:id/departments`; "Usuario" y "Tipo de pedido" son huecos documentados (ver
 * `_data/nombre-usuario.ts` y DECISIONES T-28b): sin nombre real de otros usuarios, "Tipo" siempre "—".
 */
export function construirFilaPedido(
  order: Order,
  departamentos: Department[],
  currentUser: Pick<User, "id" | "name"> | null,
): FilaPedido {
  const departamento = departamentos.find((d) => d.id === order.departmentId)?.name ?? SIN_DATO;
  const filterUserId = order.userId ?? order.createdById;
  return {
    id: order.id,
    orderNumber: order.orderNumber ?? order.id.slice(-8).toUpperCase(),
    dateLabel: formatCaracasDateSlash(order.createdAt),
    dateTime: order.createdAt,
    departmentLabel: departamento,
    userLabel: nombreUsuarioPedido(filterUserId, currentUser),
    typeLabel: SIN_DATO,
    amountLabel: order.total !== null ? formatPrice(order.total) : SIN_DATO,
    statusGroup: order.statusGroup,
    statusLabel: ORDER_STATUS_GROUP_LABELS[order.statusGroup],
    detailHref: rutaPedido(order.id),
    branchId: order.branchId,
    filterUserId,
    createdAt: order.createdAt,
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
  const candidatos = [fila.orderNumber, fila.userLabel, fila.departmentLabel];
  return candidatos.some((valor) => valor.toLowerCase().includes(texto));
}

/**
 * Filtra las filas con los 4 dropdowns, la fecha y el buscador. `GET /orders` de T-28a ya filtra y pagina
 * en servidor (`statusGroup`, `branchId`, `userId`, `search` por nº de pedido, `skip`/`take`), pero aquí
 * se aplica todo en **cliente** sobre el array completo (sin filtros ni paginación en la petición): con
 * los pedidos de una empresa normal esto es instantáneo y evita que el filtro "Usuario" (que depende de
 * los propios pedidos cargados, sin endpoint de nombres) se quede sin opciones al filtrar por otra cosa.
 * Repetir el filtrado en servidor queda para cuando el volumen lo justifique (ver DECISIONES T-28b).
 * Sin filtro de estado activo, los cancelados/rechazados siguen saliendo (decisión 2026-10-20: "Cancelado"
 * no es un tab, pero el pedido se ve igual en la tabla). La búsqueda no cubre nombre de producto: la
 * respuesta de `GET /orders` no trae nombres de ítem (el back lo marcó pendiente en CONTRATOS-API).
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
