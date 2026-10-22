import { useMutation } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { UpdateMeRequest } from "@/domain/types";

import { useSincronizarMe } from "./useMe";

/**
 * `PATCH /auth/me` (Mi perfil, T-30). La respuesta tiene la forma de `GET /auth/me`: reemplaza la caché de
 * `useMe` sin otro GET y actualiza la sesión (nombre del sidebar, menú de cuenta y cargo de la membresía).
 * Invalida `company-members` para que la administración de usuarios no muestre los datos anteriores.
 */
export function useUpdateMe() {
  const sincronizar = useSincronizarMe();

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => authService.updateMe(data),
    onSuccess: sincronizar,
  });
}
