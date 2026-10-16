import { useQuery } from "@tanstack/react-query";

import { notificationService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { NotificationsQuery } from "@/domain/types";
import { isApiError } from "@/shared/utils";

/** Prefijo de todas las páginas de notificaciones de la empresa activa (el back filtra por `X-Company-Id`). */
export const notificationsQueryKey = (companyId: string | null) => ["notifications", companyId] as const;

interface UseNotificationsOptions extends NotificationsQuery {
  enabled?: boolean;
}

/**
 * Notificaciones del usuario (`GET /notifications`). Por defecto las 10 últimas (lo que muestra la campana);
 * `unreadCount` es el total sin leer. Se refresca cada minuto con la pestaña visible.
 */
export function useNotifications({
  take = 10,
  skip,
  unread,
  enabled = true,
}: UseNotificationsOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const query: NotificationsQuery = { take, skip, unread };

  return useQuery({
    queryKey: [...notificationsQueryKey(companyId), query],
    queryFn: () => notificationService.list(query),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    // 400 o 401 no mejoran al reintentar.
    retry: (failureCount, error) =>
      !(isApiError(error) && error.statusCode >= 400 && error.statusCode < 500) && failureCount < 1,
  });
}
