import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { NotificationsResponse } from "@/domain/types";

import { notificationsQueryKey } from "./useNotifications";

/** `PATCH /notifications/read-all`, optimista (todas leídas y contador a 0); si falla, se restaura la caché. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((state) => state.activeCompanyId);
  const key = notificationsQueryKey(companyId);

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueriesData<NotificationsResponse>({ queryKey: key });
      const readAt = new Date().toISOString();
      queryClient.setQueriesData<NotificationsResponse>({ queryKey: key }, (page) =>
        page && {
          ...page,
          data: page.data.map((n) => (n.readAt === null ? { ...n, readAt } : n)),
          unreadCount: 0,
        },
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
