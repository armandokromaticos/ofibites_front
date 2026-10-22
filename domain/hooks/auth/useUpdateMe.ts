import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { MeResponse, UpdateMeRequest } from "@/domain/types";

import { ME_QUERY_KEY } from "./useMe";

/**
 * `PATCH /auth/me` (Mi perfil, T-30). La respuesta tiene la forma de `GET /auth/me`: reemplaza la caché de
 * `useMe` sin otro GET y actualiza la sesión (nombre del sidebar, menú de cuenta y cargo de la membresía).
 * Invalida `company-members` para que la administración de usuarios no muestre los datos anteriores.
 */
export function useUpdateMe() {
  const queryClient = useQueryClient();
  const syncMe = useAuthStore((state) => state.syncMe);

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => authService.updateMe(data),
    onSuccess: (me: MeResponse) => {
      queryClient.setQueryData(ME_QUERY_KEY, me);
      syncMe(me);
      // Nombre, teléfono y cargo salen también en la lista y la ficha de /administracion.
      void queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
  });
}
