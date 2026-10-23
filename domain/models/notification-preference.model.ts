import { NotificationPreferenceType } from "@/domain/types";

export type NotificationPreferenceGroup = "pedidos" | "novedades";

export interface NotificationPreferenceCatalogItem {
  type: NotificationPreferenceType;
  label: string;
  description: string;
  group: NotificationPreferenceGroup;
}

/**
 * Copy exacto del Figma "Perfil · Notificaciones" (`3656:2115`, ver `diseno/figma/textos/perfil.md`).
 * El back solo conoce el `type`; etiquetas y descripciones viven aquí, no en el componente.
 */
export const NOTIFICATION_PREFERENCE_CATALOG: readonly NotificationPreferenceCatalogItem[] = [
  {
    type: "ORDER_CONFIRMED_OR_REJECTED",
    group: "pedidos",
    label: "Pedido confirmado o rechazado",
    description: "Ofibites aceptó, ajustó o rechazó un pedido que hiciste.",
  },
  {
    type: "ORDER_STATUS_CHANGED",
    group: "pedidos",
    label: "Cambios de estado",
    description: "En preparación, en tránsito y entregado.",
  },
  {
    type: "INVOICE_GENERATED",
    group: "pedidos",
    label: "Factura generada",
    description: "Se emitió la factura de un pedido tuyo.",
  },
  {
    type: "INVOICE_DUE_SOON_OR_OVERDUE",
    group: "pedidos",
    label: "Factura próxima a vencer y vencida",
    description: "Aviso 3 días antes del vencimiento y el día que vence.",
  },
  {
    type: "PAYMENT_STATUS_CHANGED",
    group: "pedidos",
    label: "Pago registrado, validado o rechazado",
    description: "Movimientos del comprobante que subiste.",
  },
  {
    type: "NEW_ASSORTMENT",
    group: "novedades",
    label: "Nuevo surtido disponible",
    description: "Cuando entra un desayuno o una línea nueva al catálogo.",
  },
  {
    type: "QUICK_COFFEE_BREAK_OPTIONS",
    group: "novedades",
    label: "Opciones rápidas para coffee break",
    description: "Sugerencias armadas para pedidos de último momento.",
  },
  {
    type: "SUGGESTION_FOR_YOU",
    group: "novedades",
    label: "Nuestra sugerencia para ti",
    description: "Recomendaciones según lo que suele pedir tu oficina.",
  },
  {
    type: "TERMS_CHANGES",
    group: "novedades",
    label: "Cambios en condiciones",
    description: "Ajustes de precios, zonas o tiempos de entrega.",
  },
];

/** Encabezado y badge de cada grupo (cabecera de su tabla en el Figma). */
export const NOTIFICATION_PREFERENCE_GROUP_INFO: Record<
  NotificationPreferenceGroup,
  { heading: string; badge: string }
> = {
  pedidos: { heading: "Sobre tus pedidos y facturas", badge: "Siempre activas en la plataforma" },
  novedades: { heading: "Novedades y sugerencias", badge: "Puedes apagarlas todas" },
};

/** Orden de los grupos en la pantalla: pedidos primero, luego novedades. */
export const NOTIFICATION_PREFERENCE_GROUPS: readonly NotificationPreferenceGroup[] = ["pedidos", "novedades"];

export function notificationPreferencesByGroup(
  group: NotificationPreferenceGroup,
): NotificationPreferenceCatalogItem[] {
  return NOTIFICATION_PREFERENCE_CATALOG.filter((item) => item.group === group);
}

/** En el grupo "pedidos" el canal de plataforma siempre está activo y no se puede editar (ver el back, T-30e). */
export function isPlatformChannelLocked(group: NotificationPreferenceGroup): boolean {
  return group === "pedidos";
}

export const NOTIFICATION_PREFERENCES_INTRO = "Elige por dónde quieres enterarte de cada cosa.";

export const NOTIFICATION_PREFERENCES_FOOTER_NOTE =
  "Los avisos sobre pedidos y facturas siempre llegan a la campana de la plataforma: son parte del servicio y no se pueden apagar. Lo que eliges es si además te llegan por correo.";

export const NOTIFICATION_PREFERENCES_SAVE_NOTE = "Los cambios aplican solo a tu usuario.";
