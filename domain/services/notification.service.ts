import {
  MarkAllNotificationsReadResponse,
  NotificationDto,
  NotificationsQuery,
  NotificationsResponse,
} from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

function toSearchParams(query: NotificationsQuery): string {
  const params = new URLSearchParams();
  if (query.unread !== undefined) params.set("unread", String(query.unread));
  if (query.skip !== undefined) params.set("skip", String(query.skip));
  if (query.take !== undefined) params.set("take", String(query.take));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Notificaciones del usuario. `authFetcher` envía `X-Company-Id` de la empresa activa (el back filtra por ella). */
export const notificationService = {
  list: (query: NotificationsQuery = {}): Promise<NotificationsResponse> =>
    authFetcher<NotificationsResponse>(`/notifications${toSearchParams(query)}`),

  /** Idempotente: si ya estaba leída, conserva `readAt`. 404 si no existe o no es del usuario. */
  markRead: (id: string): Promise<NotificationDto> =>
    authFetcher<NotificationDto>(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }),

  markAllRead: (): Promise<MarkAllNotificationsReadResponse> =>
    authFetcher<MarkAllNotificationsReadResponse>("/notifications/read-all", { method: "PATCH" }),
};

