"use client";

import { FormEvent } from "react";

import { cn, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

import {
  isPlatformChannelLocked,
  NOTIFICATION_PREFERENCE_GROUP_INFO,
  NOTIFICATION_PREFERENCE_GROUPS,
  NOTIFICATION_PREFERENCES_FOOTER_NOTE,
  NOTIFICATION_PREFERENCES_INTRO,
  NOTIFICATION_PREFERENCES_SAVE_NOTE,
  NotificationPreferenceGroup,
  notificationPreferencesByGroup,
} from "@/domain/models";
import { AtButton, AtChip, AtSwitch } from "@/ui/atomic/atoms";
import { MlForm, MlFormAlert } from "@/ui/atomic/molecules";

import { OrNotificationPreferencesFormProps } from "./or-notification-preferences-form.types";

function GroupTable({
  group,
  values,
  onChange,
  disabled,
}: Pick<OrNotificationPreferencesFormProps, "values" | "onChange"> & {
  group: NotificationPreferenceGroup;
  disabled: boolean;
}) {
  const { heading, badge } = NOTIFICATION_PREFERENCE_GROUP_INFO[group];
  const items = notificationPreferencesByGroup(group);
  const platformLocked = isPlatformChannelLocked(group);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold leading-6 text-foreground">{heading}</h3>
        <AtChip>{badge}</AtChip>
      </div>
      <Table aria-label={`Notificaciones: ${heading}`} shadow="none" radius="lg" className="min-w-full">
        <TableHeader>
          <TableColumn>AVISO</TableColumn>
          <TableColumn align="center" width={96}>
            CORREO
          </TableColumn>
          <TableColumn align="center" width={148}>
            EN LA PLATAFORMA
          </TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.type}>
              <TableCell>
                <div className="flex flex-col gap-0.5 py-1 pr-2">
                  <p className="text-[13px] font-semibold leading-[18px] text-foreground">{item.label}</p>
                  <p className="text-xs leading-4 text-muted">{item.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <AtSwitch
                    aria-label={`Correo: ${item.label}`}
                    isSelected={values[item.type].emailEnabled}
                    isDisabled={disabled}
                    onValueChange={(value) => onChange(item.type, "emailEnabled", value)}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <AtSwitch
                    aria-label={`En la plataforma: ${item.label}`}
                    isSelected={platformLocked ? true : values[item.type].platformEnabled}
                    isDisabled={platformLocked || disabled}
                    onValueChange={(value) => onChange(item.type, "platformEnabled", value)}
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * "Notificaciones" de Mi perfil (Figma `3656:2115`): dos tablas (pedidos/facturas y novedades) con
 * switches de Correo y En la plataforma. En "pedidos", En la plataforma va siempre activado y
 * deshabilitado (el back no permite apagarlo); en "novedades" los dos canales son editables.
 * Mismo patrón que `OrProfileBasicForm`: borrador controlado por la página, "Guardar preferencias"
 * y "Descartar" solo responden con cambios.
 */
export function OrNotificationPreferencesForm({
  values,
  onChange,
  isDirty,
  isSubmitting = false,
  formError,
  onSubmit,
  onDiscard,
  className,
}: OrNotificationPreferencesFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty || isSubmitting) return;
    onSubmit();
  };

  return (
    <section
      aria-labelledby="perfil-notificaciones-titulo"
      className={cn("flex flex-col rounded-card bg-content1 p-5 sm:p-6", className)}
    >
      <header className="flex flex-col gap-1 border-b border-divider pb-5">
        <h2 id="perfil-notificaciones-titulo" className="font-display text-xl font-bold leading-7 text-foreground">
          Notificaciones
        </h2>
        <p className="text-xs leading-4 text-muted">{NOTIFICATION_PREFERENCES_INTRO}</p>
      </header>

      <MlForm validationBehavior="aria" className="flex flex-col gap-6 pt-5" onSubmit={handleSubmit}>
        {formError && <MlFormAlert title="No pudimos guardar tus preferencias.">{formError}</MlFormAlert>}

        {NOTIFICATION_PREFERENCE_GROUPS.map((group) => (
          <GroupTable
            key={group}
            group={group}
            values={values}
            onChange={onChange}
            disabled={isSubmitting}
          />
        ))}

        <p className="flex w-full items-start gap-3 rounded-2xl bg-surface-sand/50 px-4 py-3.5 text-xs leading-[18px] text-foreground">
          <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
          {NOTIFICATION_PREFERENCES_FOOTER_NOTE}
        </p>

        <div className="flex w-full flex-col-reverse gap-4 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p id="perfil-notificaciones-ayuda" className="text-xs leading-4 text-subtle">
            {NOTIFICATION_PREFERENCES_SAVE_NOTE}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <AtButton
              size="lg"
              variant="bordered"
              className="h-12 border-primary px-6 text-sm text-primary aria-disabled:opacity-50"
              aria-disabled={!isDirty || isSubmitting || undefined}
              onPress={() => {
                if (isDirty && !isSubmitting) onDiscard();
              }}
            >
              Descartar
            </AtButton>
            <AtButton
              type="submit"
              size="lg"
              className="h-12 px-6 text-sm aria-disabled:opacity-50"
              aria-disabled={!isDirty || undefined}
              aria-describedby={isDirty ? undefined : "perfil-notificaciones-ayuda"}
              isLoading={isSubmitting}
            >
              Guardar preferencias
            </AtButton>
          </div>
        </div>
      </MlForm>
    </section>
  );
}
