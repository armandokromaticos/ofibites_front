import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { NotificationsResponse } from "@/domain/types";

import { notificationsQueryKey } from "./useNotifications";

/**
 * `PATCH /notifications/:id/read`, optimista: la notificación sale como leída y el contador baja al instante.
 * Si falla, se restaura la caché; al terminar se vuelve a pedir la lista.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const key = notificationsQueryKey(companyId);

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueriesData<NotificationsResponse>({ queryKey: key });
      const readAt = new Date().toISOString();
      queryClient.setQueriesData<NotificationsResponse>({ queryKey: key }, (page) => {
        if (!page) return page;
        const wasUnread = page.data.some((n) => n.id === id && n.readAt === null);
        if (!wasUnread) return page;
        return {
          ...page,
          data: page.data.map((n) => (n.id === id ? { ...n, readAt } : n)),
          unreadCount: Math.max(0, page.unreadCount - 1),
        };
      });
      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
