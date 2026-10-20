import { User } from "@/domain/types";

/**
 * Nombre de quien hizo un pedido (`Order.userId`, o `createdById` si no hay `userId`: ver `filterUserId`
 * en `_components/filtrar-pedidos.ts`), para la columna y el filtro "Usuario" del Figma.
 *
 * TODO: conectar API (propuesta a backend-dev, ver CONTRATOS-API · T-28a): no hay endpoint accesible a
 * CLIENT que resuelva el nombre de un compañero de equipo a partir de su id (`CompanyMemberResponseDto`
 * solo trae `userId`, sin nombre ni correo; `GET /users` es solo de plataforma). El nombre propio sale de
 * la sesión (`useAuthStore`); el de otro usuario, un respaldo con los últimos 4 caracteres de su id.
 */
export function nombreUsuarioPedido(
  userId: string,
  currentUser: Pick<User, "id" | "name"> | null,
): string {
  if (currentUser && currentUser.id === userId) return currentUser.name;
  return `Miembro ${userId.slice(-4).toUpperCase()}`;
}
