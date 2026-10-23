import { NotificationPreferenceType } from "@/domain/types";

export type NotificationPreferenceChannel = "emailEnabled" | "platformEnabled";

/** Borrador local: los 9 tipos del catálogo, siempre presentes. */
export type OrNotificationPreferencesFormValues = Record<
  NotificationPreferenceType,
  { emailEnabled: boolean; platformEnabled: boolean }
>;

export interface OrNotificationPreferencesFormProps {
  /** Valores actuales (controlados por la página, que sabe si hay cambios y los descarta). */
  values: OrNotificationPreferencesFormValues;
  onChange: (
    type: NotificationPreferenceType,
    channel: NotificationPreferenceChannel,
    value: boolean,
  ) => void;
  /** Hay cambios sin guardar: activa "Guardar preferencias" y "Descartar". */
  isDirty: boolean;
  isSubmitting?: boolean;
  /** Error del servidor, en una alerta sobre las tablas. */
  formError?: string | null;
  onSubmit: () => void;
  onDiscard: () => void;
  className?: string;
}
