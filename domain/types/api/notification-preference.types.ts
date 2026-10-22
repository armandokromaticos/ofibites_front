/**
 * Catálogo de preferencias de notificaciones (T-30e/T-30f, Figma `3656:2115`). 9 tipos fijos, alineados con el
 * enum de dominio `NotificationPreferenceType` del back. Etiquetas y descripciones son del front: el back no
 * las devuelve (ver `domain/models/notification-preference.model.ts`).
 */
export type NotificationPreferenceType =
  | "ORDER_CONFIRMED_OR_REJECTED"
  | "ORDER_STATUS_CHANGED"
  | "INVOICE_GENERATED"
  | "INVOICE_DUE_SOON_OR_OVERDUE"
  | "PAYMENT_STATUS_CHANGED"
  | "NEW_ASSORTMENT"
  | "QUICK_COFFEE_BREAK_OPTIONS"
  | "SUGGESTION_FOR_YOU"
  | "TERMS_CHANGES";

/**
 * Una fila de `GET`/`PATCH /auth/me/notification-preferences`. En el grupo "pedidos" (ver el modelo),
 * `platformEnabled` siempre es `true` en la respuesta del back; el `PATCH` no puede apagarlo.
 */
export interface NotificationPreference {
  type: NotificationPreferenceType;
  emailEnabled: boolean;
  platformEnabled: boolean;
}

/**
 * `GET /auth/me/notification-preferences` (T-30e, IMPLEMENTADO): `{ preferences: NotificationPreference[] }`,
 * siempre los 9 tipos del catálogo en el orden del enum, con defaults si el usuario no guardó nada.
 */
export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

/** Un ítem del body de `PATCH /auth/me/notification-preferences`: solo lo que cambió de ese tipo. */
export interface UpdateNotificationPreferenceItem {
  type: NotificationPreferenceType;
  emailEnabled?: boolean;
  platformEnabled?: boolean;
}

/**
 * `PATCH /auth/me/notification-preferences` (T-30e, IMPLEMENTADO): body `{ preferences: [...] }`, parcial
 * (solo los tipos que cambiaron; no hace falta mandar los 9). Responde la misma forma que el GET.
 */
export interface UpdateNotificationPreferencesRequest {
  preferences: UpdateNotificationPreferenceItem[];
}
