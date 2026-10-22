"use client";

import { FormEvent, useRef, useState } from "react";

import { cn } from "@heroui/react";

import { AtAvatar, AtButton, AtInput } from "@/ui/atomic/atoms";
import { MlForm, MlFormAlert } from "@/ui/atomic/molecules";

import {
  OrProfileBasicFormField,
  OrProfileBasicFormProps,
  OrProfileBasicFormValues,
} from "./or-profile-basic-form.types";

/** Límites de `PATCH /auth/me` (T-30a). */
const NAME_MAX = 120;
const PHONE_MAX = 30;
const POSITION_MAX = 100;

const CLASES_CAMPO = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  inputWrapper: "h-11 bg-content1",
  input: "text-sm font-normal",
};

const CLASES_SOLO_LECTURA = {
  ...CLASES_CAMPO,
  inputWrapper: "h-11 border-transparent bg-background data-[hover=true]:border-transparent",
  input: "text-sm font-normal !text-muted",
};

type Errores = Partial<Record<OrProfileBasicFormField, string>>;

const ORDEN_CAMPOS: OrProfileBasicFormField[] = ["firstName", "lastName", "phone", "position"];

function validar(values: OrProfileBasicFormValues, showPosition: boolean): Errores {
  const errores: Errores = {};
  const nombreCompleto = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
  if (!values.firstName.trim()) errores.firstName = "Escribe tu nombre.";
  else if (nombreCompleto.length > NAME_MAX) {
    errores.lastName = `Nombre y apellido admiten como máximo ${NAME_MAX} caracteres entre los dos.`;
  }
  if (values.phone.trim().length > PHONE_MAX) errores.phone = `Máximo ${PHONE_MAX} caracteres.`;
  if (showPosition && values.position.trim().length > POSITION_MAX) {
    errores.position = `Máximo ${POSITION_MAX} caracteres.`;
  }
  return errores;
}

function NoEditable() {
  return <span className="shrink-0 text-[11px] font-medium text-muted">No editable</span>;
}

/**
 * "Datos básicos" de Mi perfil (Figma `3651:1921`, con foto `3702:17145`): foto (iniciales si no hay, "Subir
 * foto"/"Cambiar foto" + "Quitar foto" por props, el modal de recorte lo abre quien usa este formulario), Nombre,
 * Apellido, Teléfono y Cargo editables; Correo, Departamento y Sede de solo lectura (los define la empresa).
 * "Guardar cambios" solo responde con cambios (`aria-disabled`, para que el foco no caiga a `<body>` cuando se
 * inhabilita tras guardar). Al enviar con errores, el foco va al primer campo inválido.
 */
export function OrProfileBasicForm({
  values,
  onChange,
  name,
  avatarSrc,
  onUploadPhoto,
  onRemovePhoto,
  isRemovingPhoto = false,
  removePhotoError,
  email,
  departmentName,
  branchName,
  showPosition = true,
  updatedLabel,
  isDirty,
  isSubmitting = false,
  formError,
  onSubmit,
  onDiscard,
  className,
}: OrProfileBasicFormProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [errores, setErrores] = useState<Errores>({});

  const cambiar = (field: OrProfileBasicFormField) => (value: string) => {
    onChange(field, value);
    if (errores[field]) setErrores((actual) => ({ ...actual, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty || isSubmitting) return;
    const nuevos = validar(values, showPosition);
    setErrores(nuevos);
    const primero = ORDEN_CAMPOS.find((field) => nuevos[field]);
    if (primero) {
      contenedorRef.current?.querySelector<HTMLInputElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    onSubmit();
  };

  const descartar = () => {
    setErrores({});
    onDiscard();
  };

  const campo = (field: OrProfileBasicFormField) => ({
    name: field,
    value: values[field],
    onValueChange: cambiar(field),
    isInvalid: Boolean(errores[field]),
    errorMessage: errores[field],
    // Mientras se guarda, solo lectura: al responder se descarta el borrador y se perdería lo escrito.
    isReadOnly: isSubmitting,
    classNames: CLASES_CAMPO,
  });

  return (
    <section
      aria-labelledby="perfil-datos-titulo"
      className={cn("flex flex-col rounded-card bg-content1 p-5 sm:p-6", className)}
    >
      <header className="flex flex-col gap-2 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="perfil-datos-titulo" className="font-display text-xl font-bold leading-7 text-foreground">
            Datos básicos
          </h2>
          <p className="text-xs leading-4 text-muted">Así te identifica tu empresa dentro de la plataforma.</p>
        </div>
        {updatedLabel && <p className="text-xs leading-4 text-subtle">{updatedLabel}</p>}
      </header>

      <div ref={contenedorRef}>
        <MlForm validationBehavior="aria" className="flex flex-col gap-5 pt-5" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <AtAvatar name={name} src={avatarSrc} isDecorative className="size-16 text-xl" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold leading-5 text-foreground">
                    {avatarSrc ? "Tu foto" : "Foto de perfil"}
                  </p>
                  <p className="text-xs leading-4 text-muted">
                    {avatarSrc
                      ? "Se muestra en tu perfil y junto a los pedidos que hagas."
                      : "Si no cargas una, se muestran tus iniciales. JPG o PNG, máximo 2 MB."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <AtButton
                  size="md"
                  variant="bordered"
                  className="h-10 border-primary text-sm text-primary aria-disabled:opacity-50"
                  aria-disabled={isRemovingPhoto || undefined}
                  onPress={() => {
                    if (!isRemovingPhoto) onUploadPhoto?.();
                  }}
                >
                  {avatarSrc ? "Cambiar foto" : "Subir foto"}
                </AtButton>
                {avatarSrc && (
                  <AtButton
                    size="md"
                    variant="light"
                    color="default"
                    className="h-10 text-[13px] text-muted"
                    isLoading={isRemovingPhoto}
                    aria-disabled={isRemovingPhoto || undefined}
                    onPress={() => {
                      if (!isRemovingPhoto) onRemovePhoto?.();
                    }}
                  >
                    Quitar foto
                  </AtButton>
                )}
              </div>
            </div>
            {removePhotoError && (
              <MlFormAlert title="No pudimos quitar tu foto.">{removePhotoError}</MlFormAlert>
            )}
          </div>

          {formError && <MlFormAlert title="No pudimos guardar tus datos.">{formError}</MlFormAlert>}

          <div className="grid w-full gap-x-4 gap-y-4 sm:grid-cols-2">
            <AtInput
              {...campo("firstName")}
              label="Nombre"
              labelPlacement="outside-top"
              autoComplete="given-name"
              aria-required="true"
              maxLength={NAME_MAX}
            />
            <AtInput
              {...campo("lastName")}
              label="Apellido"
              labelPlacement="outside-top"
              autoComplete="family-name"
              maxLength={NAME_MAX}
            />
            <AtInput
              type="email"
              name="email"
              label="Correo electrónico"
              labelPlacement="outside-top"
              value={email}
              isReadOnly
              endContent={<NoEditable />}
              classNames={CLASES_SOLO_LECTURA}
            />
            <AtInput
              {...campo("phone")}
              type="tel"
              label="Teléfono de contacto"
              labelPlacement="outside-top"
              placeholder="+58 412 000 0000"
              autoComplete="tel"
              maxLength={PHONE_MAX}
            />
            <AtInput
              name="departmentName"
              label="Departamento"
              labelPlacement="outside-top"
              value={departmentName ?? "Sin asignar"}
              isReadOnly
              endContent={<NoEditable />}
              classNames={CLASES_SOLO_LECTURA}
            />
            <AtInput
              name="branchName"
              label="Sede a la que perteneces"
              labelPlacement="outside-top"
              value={branchName ?? "Sin asignar"}
              isReadOnly
              endContent={<NoEditable />}
              classNames={CLASES_SOLO_LECTURA}
            />
            {showPosition && (
              <AtInput
                {...campo("position")}
                label="Cargo en la empresa"
                labelPlacement="outside-top"
                placeholder="Ej.: Coordinador de Bienestar"
                autoComplete="organization-title"
                maxLength={POSITION_MAX}
              />
            )}
          </div>

          <p className="flex w-full items-start gap-3 rounded-2xl bg-surface-sand/50 px-4 py-3.5 text-xs leading-[18px] text-foreground">
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            Tu correo es tu usuario de acceso y no se puede cambiar desde aquí. Si cambió, pídele a tu
            administrador de empresa que cree un usuario nuevo. El departamento y la sede los define tu
            empresa: si están errados, avísale a tu administrador.
          </p>

          <div className="flex w-full flex-col-reverse gap-4 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p id="perfil-datos-ayuda" className="text-xs leading-4 text-subtle">
              Guardar cambios se activa solo cuando edites algún campo.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <AtButton
                size="lg"
                variant="bordered"
                className="h-12 border-primary px-6 text-sm text-primary aria-disabled:opacity-50"
                aria-disabled={!isDirty || isSubmitting || undefined}
                onPress={() => {
                  if (isDirty && !isSubmitting) descartar();
                }}
              >
                Descartar
              </AtButton>
              <AtButton
                type="submit"
                size="lg"
                className="h-12 px-6 text-sm aria-disabled:opacity-50"
                aria-disabled={!isDirty || undefined}
                aria-describedby={isDirty ? undefined : "perfil-datos-ayuda"}
                isLoading={isSubmitting}
              >
                Guardar cambios
              </AtButton>
            </div>
          </div>
        </MlForm>
      </div>
    </section>
  );
}
