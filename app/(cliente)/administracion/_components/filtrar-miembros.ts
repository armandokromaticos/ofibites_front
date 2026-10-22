import {
  COMPANY_ROLE_LABELS,
  formatMemberLastSeen,
  MEMBER_STATUS_COLORS,
  MEMBER_STATUS_LABELS,
  MemberStatus,
  memberStatus,
} from "@/domain/models";
import { CompanyMember, Department } from "@/domain/types";
import { OrMemberTableRow } from "@/ui/atomic";

import { rutaMiembro } from "../../_navegacion";

import { FiltrosAdministracion, OrdenMiembros } from "./use-filtros-administracion";

/** Fila de la tabla con los campos crudos que necesitan los filtros (no solo lo que se pinta). */
export interface FilaMiembro extends OrMemberTableRow {
  status: MemberStatus;
  lastSeenAt: string | null;
}

const SIN_DATO = "—";

/**
 * `CompanyMember` real a fila de tabla. "Departamento"/"Sede" salen de `GET /companies/:id/departments`
 * y `/branches` (T-28b). `name`/`email` reales del `User` (T-29c).
 */
export function construirFilaMiembro(member: CompanyMember, departments: Department[]): FilaMiembro {
  const status = memberStatus(member);
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    roleLabel: COMPANY_ROLE_LABELS[member.role],
    departmentLabel: departments.find((d) => d.id === member.departmentId)?.name ?? SIN_DATO,
    statusLabel: MEMBER_STATUS_LABELS[status],
    statusColor: MEMBER_STATUS_COLORS[status],
    lastSeenLabel: formatMemberLastSeen(member.lastSeenAt),
    editHref: rutaMiembro(member.id),
    canResendInvite: status === "pending",
    canResetPassword: status !== "pending",
    isActive: member.isActive,
    status,
    lastSeenAt: member.lastSeenAt,
  };
}

function coincideBusqueda(fila: FilaMiembro, q: string): boolean {
  const texto = q.trim().toLowerCase();
  if (!texto) return true;
  const candidatos = [fila.name, fila.email ?? ""];
  return candidatos.some((valor) => valor.toLowerCase().includes(texto));
}

/** Filtra por estado y por el buscador (nombre o correo); sin `Branch[]` porque la lista no la muestra. */
export function filtrarMiembros(
  filas: FilaMiembro[],
  filtros: Pick<FiltrosAdministracion, "estado" | "q">,
): FilaMiembro[] {
  return filas.filter((fila) => {
    if (filtros.estado && fila.status !== filtros.estado) return false;
    if (!coincideBusqueda(fila, filtros.q)) return false;
    return true;
  });
}

const porNombre = (a: FilaMiembro, b: FilaMiembro) => a.name.localeCompare(b.name, "es");
const porConexionDesc = (a: FilaMiembro, b: FilaMiembro) => {
  if (!a.lastSeenAt && !b.lastSeenAt) return porNombre(a, b);
  if (!a.lastSeenAt) return 1;
  if (!b.lastSeenAt) return -1;
  return Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt);
};

/** "Ordenar por: Nombre" (A-Z) o "Última conexión" (más reciente primero). */
export function ordenarMiembros(filas: FilaMiembro[], orden: OrdenMiembros): FilaMiembro[] {
  return [...filas].sort(orden === "conexion" ? porConexionDesc : porNombre);
}
