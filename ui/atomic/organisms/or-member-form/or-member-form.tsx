"use client";

import { cn, SelectItem } from "@heroui/react";

import { CompanyRole } from "@/domain/types";
import { AtAvatar, AtButton, AtChip, AtInput, AtSelect, AtSwitch } from "@/ui/atomic/atoms";
import { MlFormAlert } from "@/ui/atomic/molecules";

import { OrMemberFormProps } from "./or-member-form.types";

const CLASES_CAMPO = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  inputWrapper: "h-11",
  input: "text-sm font-normal",
};

const CLASES_SELECT = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  trigger: "h-11 min-h-11",
  value: "text-sm font-normal !text-foreground",
};

/**
 * "Datos de la persona" (Figma "Añadir usuario" `3463:2225` y "Editar usuario" `3511:9089`). Nombre, Apellido
 * y Teléfono son editables en los dos modos (T-29c: `PATCH /members/:id` acepta `name`/`phone` opcionales).
 * El correo **nunca** se edita (ni se pide en `edit`, ni se envía en el `PATCH`): la cabecera ya lo muestra
 * de solo lectura, y la nota de abajo explica por qué (decisión de diseño del Figma, no un hueco).
 */
export function OrMemberForm({
  mode,
  values,
  errors = {},
  onChange,
  departmentOptions,
  branchOptions,
  roleOptions,
  isLoadingDepartments,
  isLoadingBranches,
  header,
  isActive,
  onActiveChange,
  formError,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  onDeactivateClick,
  deactivateLabel,
  className,
}: OrMemberFormProps) {
  const isCreate = mode === "create";

  return (
    <div className={cn("flex flex-col gap-6 rounded-card bg-content1 p-6", className)}>
      {header && (
        <div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AtAvatar name={header.name} size="md" className="size-12 text-base" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[17px] font-semibold leading-6 text-foreground">{header.name}</p>
                <AtChip size="sm" variant="flat" color={header.statusColor}>
                  {header.statusLabel}
                </AtChip>
              </div>
              {header.email && <p className="text-xs leading-4 text-subtle">{header.email}</p>}
              <p className="text-xs font-medium leading-4 text-subtle">
                Última conexión: {header.lastSeenLabel}
              </p>
            </div>
          </div>
          {header.createdLabel && <p className="text-xs leading-4 text-subtle">{header.createdLabel}</p>}
        </div>
      )}

      {formError && <MlFormAlert>{formError}</MlFormAlert>}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold leading-7 text-foreground">Datos de la persona</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <AtInput
            label="Nombre"
            labelPlacement="outside-top"
            placeholder="Ej.: Andrea"
            value={values.firstName}
            onValueChange={(value) => onChange("firstName", value)}
            isInvalid={Boolean(errors.firstName)}
            errorMessage={errors.firstName}
            isRequired
            classNames={CLASES_CAMPO}
          />
          <AtInput
            label="Apellido"
            labelPlacement="outside-top"
            placeholder="Ej.: Silva"
            value={values.lastName}
            onValueChange={(value) => onChange("lastName", value)}
            isInvalid={Boolean(errors.lastName)}
            errorMessage={errors.lastName}
            isRequired={isCreate}
            classNames={CLASES_CAMPO}
          />
        </div>

        {isCreate ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <AtInput
              type="email"
              label="Correo corporativo"
              labelPlacement="outside-top"
              placeholder="nombre@empresa.com"
              value={values.email}
              onValueChange={(value) => onChange("email", value)}
              isInvalid={Boolean(errors.email)}
              errorMessage={errors.email}
              isRequired
              classNames={CLASES_CAMPO}
            />
            <AtInput
              type="tel"
              label="Teléfono"
              labelPlacement="outside-top"
              placeholder="+58 412 000 0000"
              value={values.phone}
              onValueChange={(value) => onChange("phone", value)}
              isInvalid={Boolean(errors.phone)}
              errorMessage={errors.phone}
              classNames={CLASES_CAMPO}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AtInput
              type="tel"
              label="Teléfono"
              labelPlacement="outside-top"
              placeholder="+58 412 000 0000"
              value={values.phone}
              onValueChange={(value) => onChange("phone", value)}
              isInvalid={Boolean(errors.phone)}
              errorMessage={errors.phone}
              classNames={CLASES_CAMPO}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <AtInput
            label="Cargo en la empresa"
            labelPlacement="outside-top"
            placeholder="Ej.: Coordinadora de RRHH"
            value={values.position}
            onValueChange={(value) => onChange("position", value)}
            isInvalid={Boolean(errors.position)}
            errorMessage={errors.position}
            classNames={CLASES_CAMPO}
          />
          <AtSelect
            label="Departamento"
            labelPlacement="outside-top"
            placeholder="Selecciona un departamento"
            selectedKeys={values.departmentId ? [values.departmentId] : []}
            onChange={(event) => onChange("departmentId", event.target.value)}
            isLoading={isLoadingDepartments}
            isInvalid={Boolean(errors.departmentId)}
            errorMessage={errors.departmentId}
            classNames={CLASES_SELECT}
          >
            {departmentOptions.map((option) => (
              <SelectItem key={option.id}>{option.name}</SelectItem>
            ))}
          </AtSelect>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AtSelect
            label="Sede a la que pertenece"
            labelPlacement="outside-top"
            placeholder="Selecciona una sede"
            selectedKeys={values.branchId ? [values.branchId] : []}
            onChange={(event) => onChange("branchId", event.target.value)}
            isLoading={isLoadingBranches}
            isInvalid={Boolean(errors.branchId)}
            errorMessage={errors.branchId}
            classNames={CLASES_SELECT}
          >
            {branchOptions.map((option) => (
              <SelectItem key={option.id}>{option.name}</SelectItem>
            ))}
          </AtSelect>
          <AtSelect
            label="Rol de usuario"
            labelPlacement="outside-top"
            placeholder="Selecciona un rol"
            selectedKeys={values.role ? [values.role] : []}
            onChange={(event) => onChange("role", event.target.value as CompanyRole)}
            isInvalid={Boolean(errors.role)}
            errorMessage={errors.role}
            isRequired
            classNames={CLASES_SELECT}
          >
            {roleOptions.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            ))}
          </AtSelect>
        </div>

        {!isCreate && (
          <div className="flex items-center gap-3 rounded-control bg-background px-4 py-3 sm:w-fit">
            <AtSwitch isSelected={isActive} onValueChange={onActiveChange} aria-label="Estado del usuario">
              {isActive ? "Activo" : "Inactivo"}
            </AtSwitch>
          </div>
        )}

        {!isCreate && (
          <p className="rounded-control bg-background px-4 py-3 text-xs leading-[18px] text-muted">
            El correo no se puede cambiar. Si la persona cambió de correo, desactiva este usuario y
            crea uno nuevo.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {onDeactivateClick ? (
          <AtButton
            size="md"
            variant="bordered"
            color="danger"
            className="border-danger-500 text-danger-600"
            onPress={onDeactivateClick}
          >
            {deactivateLabel}
          </AtButton>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <AtButton size="md" variant="light" color="default" className="text-ghost-foreground" onPress={onCancel}>
            Cancelar
          </AtButton>
          <AtButton size="md" onPress={onSubmit} isLoading={isSubmitting}>
            {submitLabel}
          </AtButton>
        </div>
      </div>
    </div>
  );
}
