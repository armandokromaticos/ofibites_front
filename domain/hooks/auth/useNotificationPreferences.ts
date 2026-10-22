import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/domain/services";
import { NotificationPreferencesResponse, UpdateNotificationPreferencesRequest } from "@/domain/types";

export const NOTIFICATION_PREFERENCES_QUERY_KEY = ["auth", "notification-preferences"] as const;

/**
 * `GET /auth/me/notification-preferences` (T-30f): preferencias de los 9 avisos del catálogo. Query propia
 * (no comparte caché con `useMe`: este endpoint no forma parte de `GET /auth/me`).
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
    queryFn: () => authService.getNotificationPreferences(),
  });
}

/**
 * `PATCH /auth/me/notification-preferences` (T-30f). La respuesta trae el catálogo completo ya actualizado:
 * reemplaza la caché del GET sin otro fetch.
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesRequest) =>
      authService.updateNotificationPreferences(data),
    onSuccess: (data: NotificationPreferencesResponse) => {
      queryClient.setQueryData(NOTIFICATION_PREFERENCES_QUERY_KEY, data);
    },
  });
}
