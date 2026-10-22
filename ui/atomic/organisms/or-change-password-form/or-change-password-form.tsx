"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { cn } from "@heroui/react";

import {
  checkPasswordRules,
  describeMissingPasswordRules,
  getPasswordLengthError,
  isPasswordValid,
  PASSWORD_MAX_LENGTH,
} from "@/shared/utils";
import { AtButton, AtInput, AtPasswordToggle } from "@/ui/atomic/atoms";
import { MlForm, MlFormAlert, MlPasswordChecklist } from "@/ui/atomic/molecules";

import { OrChangePasswordFormProps } from "./or-change-password-form.types";

type Campo = "currentPassword" | "newPassword" | "confirmation";
type Errores = Partial<Record<Campo, string>>;

const ORDEN_CAMPOS: Campo[] = ["currentPassword", "newPassword", "confirmation"];

const CLASES_CAMPO = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  inputWrapper: "h-11 bg-content1 pr-1",
  input: "text-sm font-normal",
};

interface Valores {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
}

function validar({ currentPassword, newPassword, confirmation }: Valores): Errores {
  const errores: Errores = {};
  if (!currentPassword) errores.currentPassword = "Escribe tu contraseña actual.";

  const largo = getPasswordLengthError(newPassword);
  if (!newPassword) errores.newPassword = "Escribe la nueva contraseña.";
  else if (largo) errores.newPassword = largo;
  else if (!isPasswordValid(newPassword)) {
    errores.newPassword = `Le falta: ${describeMissingPasswordRules(newPassword)}.`;
  } else if (newPassword === currentPassword) {
    errores.newPassword = "La nueva contraseña debe ser distinta de la actual.";
  }

  if (!confirmation) errores.confirmation = "Confirma la nueva contraseña.";
  else if (confirmation !== newPassword) errores.confirmation = "Las contraseñas no coinciden.";
  return errores;
}

/** Resumen del aviso de error (Figma `3654:1998`): una frase con el único error o el número de campos. */
function resumen(errores: Errores): string {
  const mensajes = ORDEN_CAMPOS.map((campo) => errores[campo]).filter(Boolean);
  if (mensajes.length === 1) return `${mensajes[0]} Corrígelo y vuelve a intentar.`;
  return `Revisa los ${mensajes.length} campos marcados y vuelve a intentar.`;
}

/**
 * "Contraseña" de Mi perfil (Figma `3653:1959`, error de validación `3654:1998`): actual, nueva y confirmación
 * con botón para mostrar cada una, checklist de la política (la misma de `/reset-password`, `MlPasswordChecklist`)
 * que se enciende al escribir, y aviso de que se cierran las demás sesiones.
 *
 * - Los errores por campo aparecen al pulsar "Actualizar contraseña" y desde ahí se recalculan al escribir; el
 *   foco va al primer campo inválido. Los del servidor (`serverErrors`) se pintan en su campo.
 * - "Cancelar" vacía los tres campos y los errores.
 */
export function OrChangePasswordForm({
  onSubmit,
  isSubmitting = false,
  formError,
  serverErrors,
  focusRequest,
  onEdit,
  lastChangedLabel,
  className,
}: OrChangePasswordFormProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [valores, setValores] = useState<Valores>({ currentPassword: "", newPassword: "", confirmation: "" });
  const [visibles, setVisibles] = useState<Record<Campo, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmation: false,
  });
  const [intentado, setIntentado] = useState(false);

  const erroresLocales = intentado ? validar(valores) : {};
  const errores: Errores = {
    ...erroresLocales,
    ...(serverErrors?.currentPassword ? { currentPassword: serverErrors.currentPassword } : {}),
    ...(serverErrors?.newPassword ? { newPassword: serverErrors.newPassword } : {}),
  };
  const hayErroresLocales = Object.keys(erroresLocales).length > 0;

  const rules = checkPasswordRules(valores.newPassword);

  // Un error del servidor pintado en un campo no se anuncia: el foco al campo lo hace leer con su error.
  const focusId = focusRequest?.id;
  const focusField = focusRequest?.field;
  const focusSelect = focusRequest?.select;
  useEffect(() => {
    if (focusId === undefined || !focusField) return;
    const input = contenedorRef.current?.querySelector<HTMLInputElement>(`[name="${focusField}"]`);
    input?.focus();
    if (focusSelect) input?.select();
  }, [focusId, focusField, focusSelect]);

  const cambiar = (campo: Campo) => (value: string) => {
    setValores((actual) => ({ ...actual, [campo]: value }));
    onEdit?.();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIntentado(true);
    const nuevos = validar(valores);
    const primero = ORDEN_CAMPOS.find((campo) => nuevos[campo]);
    if (primero) {
      contenedorRef.current?.querySelector<HTMLInputElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    onSubmit({ currentPassword: valores.currentPassword, newPassword: valores.newPassword });
  };

  const cancelar = () => {
    setValores({ currentPassword: "", newPassword: "", confirmation: "" });
    setIntentado(false);
    onEdit?.();
  };

  const campo = (
    nombre: Campo,
    label: string,
    autoComplete: string,
    toggleLabel: string,
    maxLength?: number,
  ) => (
    <AtInput
      name={nombre}
      maxLength={maxLength}
      label={label}
      labelPlacement="outside-top"
      type={visibles[nombre] ? "text" : "password"}
      autoComplete={autoComplete}
      aria-required="true"
      value={valores[nombre]}
      onValueChange={cambiar(nombre)}
      isInvalid={Boolean(errores[nombre])}
      errorMessage={errores[nombre]}
      classNames={CLASES_CAMPO}
      endContent={
        <AtPasswordToggle
          aria-label={toggleLabel}
          isVisible={visibles[nombre]}
          className="size-9 min-w-9"
          onPress={() => setVisibles((actual) => ({ ...actual, [nombre]: !actual[nombre] }))}
        />
      }
    />
  );

  return (
    <section
      aria-labelledby="perfil-contrasena-titulo"
      className={cn("flex flex-col rounded-card bg-content1 p-5 sm:p-6", className)}
    >
      <header className="flex flex-col gap-2 border-b border-divider pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="perfil-contrasena-titulo" className="font-display text-xl font-bold leading-7 text-foreground">
            Contraseña
          </h2>
          <p className="text-xs leading-4 text-muted">Es la misma con la que entras a la plataforma.</p>
        </div>
        {lastChangedLabel && <p className="text-xs leading-4 text-subtle">{lastChangedLabel}</p>}
      </header>

      <div ref={contenedorRef}>
        <MlForm validationBehavior="aria" className="flex flex-col gap-5 pt-5" onSubmit={handleSubmit}>
          {hayErroresLocales ? (
            <MlFormAlert title="No pudimos actualizar la contraseña.">{resumen(erroresLocales)}</MlFormAlert>
          ) : (
            formError && <MlFormAlert title="No pudimos actualizar la contraseña.">{formError}</MlFormAlert>
          )}

          <div className="grid w-full gap-4 sm:grid-cols-2">
            {campo(
              "currentPassword",
              "Contraseña actual",
              "current-password",
              "Mostrar la contraseña actual",
              PASSWORD_MAX_LENGTH,
            )}
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            {campo("newPassword", "Nueva contraseña", "new-password", "Mostrar la nueva contraseña")}
            {campo("confirmation", "Confirmar nueva contraseña", "new-password", "Mostrar la confirmación")}
          </div>

          <div className="flex w-full flex-col gap-3 rounded-2xl bg-background px-4 py-4">
            <p className="text-xs font-semibold leading-4 text-foreground">La contraseña debe tener</p>
            <MlPasswordChecklist rules={rules} showStatus={valores.newPassword !== ""} />
            <p className="text-[11px] leading-4 text-muted">Las marcas se van encendiendo mientras escribes.</p>
          </div>

          <p className="flex w-full items-start gap-3 rounded-2xl bg-surface-sand/50 px-4 py-3.5 text-xs leading-[18px] text-foreground">
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            Al cambiar la contraseña se cierra tu sesión en los demás dispositivos. En este seguirás
            conectado.
          </p>

          <div className="flex w-full flex-col-reverse gap-4 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-4 text-subtle">
              ¿No la recuerdas? Cierra sesión y usa “Olvidé mi contraseña”.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <AtButton
                size="lg"
                variant="bordered"
                className="h-12 border-primary px-6 text-sm text-primary"
                onPress={cancelar}
                isDisabled={isSubmitting}
              >
                Cancelar
              </AtButton>
              <AtButton type="submit" size="lg" className="h-12 px-6 text-sm" isLoading={isSubmitting}>
                Actualizar contraseña
              </AtButton>
            </div>
          </div>
        </MlForm>
      </div>
    </section>
  );
}
