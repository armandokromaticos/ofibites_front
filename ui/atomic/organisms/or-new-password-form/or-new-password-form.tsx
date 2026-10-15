"use client";

import { FormEvent, useState } from "react";

import { cn } from "@heroui/react";

import {
  checkPasswordRules,
  describeMissingPasswordRules,
  getPasswordLengthError,
  getPasswordStrength,
  isPasswordValid,
} from "@/shared/utils";
import { AtButton, AtInput, AtPasswordToggle } from "@/ui/atomic/atoms";
import {
  MlForm,
  MlFormAlert,
  MlPasswordChecklist,
  MlPasswordStrengthMeter,
} from "@/ui/atomic/molecules";

import { OrNewPasswordFormProps } from "./or-new-password-form.types";

const MISMATCH_MESSAGE = "Las contraseñas no coinciden. Vuelve a escribirla.";
const MATCH_MESSAGE = "Las contraseñas coinciden.";

// "Las contraseñas coinciden." (Figma 3339:3005): mismo formato que el error de AtInput, en `brand`.
const MATCH_DESCRIPTION_CLASSES = [
  "flex items-center gap-2 text-[13px] font-semibold text-brand",
  "before:size-[7px] before:shrink-0 before:rounded-full before:bg-brand before:content-['']",
].join(" ");

/**
 * Crear nueva contraseña (Figma 3236:12333, 3339:2640, 3339:2772 y 3339:3005): contraseña con
 * medidor de seguridad y checklist, confirmación y botón deshabilitado hasta que todo se cumple.
 * Las reglas salen de `@/shared/utils` (las mismas que valida el back). Sirve también para el
 * cambio de contraseña obligatorio del primer login.
 *
 * - "Completa para crear tu contraseña: …" y el borde de error aparecen al salir del campo con
 *   reglas pendientes, no mientras se escribe.
 * - "No coinciden" aparece al salir de la confirmación o cuando ya es tan larga como la contraseña.
 * - Diferencia con el Figma: los campos son de tipo contraseña con botón para mostrarla (en el
 *   Figma se ve el texto plano).
 */
export function OrNewPasswordForm({
  onSubmit,
  isSubmitting = false,
  error,
  onEdit,
  submitLabel = "Cambiar contraseña",
  footer,
  className,
}: OrNewPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isConfirmationTouched, setIsConfirmationTouched] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const rules = checkPasswordRules(password);
  const strength = getPasswordStrength(password);
  const isValid = isPasswordValid(password);
  // El máximo (72) no está en el checklist: su error se muestra en cuanto se supera.
  const lengthError = getPasswordLengthError(password);
  const showPasswordError = Boolean(lengthError) || (isPasswordTouched && password !== "" && !isValid);

  const matches = confirmation !== "" && confirmation === password;
  const showMismatch =
    confirmation !== "" &&
    confirmation !== password &&
    (isConfirmationTouched || confirmation.length >= password.length);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || !matches || isSubmitting) return;
    onSubmit(password);
  };

  return (
    <div className={cn("flex w-full flex-col gap-[19px]", className)}>
      <MlForm className="gap-[39px]" validationBehavior="aria" onSubmit={handleSubmit}>
        <div className="flex w-full flex-col gap-[14px]">
          {error && <MlFormAlert>{error}</MlFormAlert>}

          <AtInput
            aria-label="Nueva contraseña"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            aria-required="true"
            value={password}
            onValueChange={(value) => {
              setPassword(value);
              onEdit?.();
            }}
            onBlur={() => setIsPasswordTouched(true)}
            isInvalid={showPasswordError}
            errorMessage={
              lengthError ??
              (showPasswordError
                ? `Completa para crear tu contraseña: ${describeMissingPasswordRules(password)}.`
                : undefined)
            }
            classNames={{ inputWrapper: "pr-2" }}
            endContent={
              <AtPasswordToggle
                aria-label="Mostrar la nueva contraseña"
                isVisible={isPasswordVisible}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
              />
            }
          />

          <MlPasswordStrengthMeter strength={strength} className="mt-1" />
          <MlPasswordChecklist rules={rules} showStatus={password !== ""} />

          <AtInput
            aria-label="Confirmar nueva contraseña"
            name="confirmation"
            type={isConfirmationVisible ? "text" : "password"}
            placeholder="Confirmar nueva contraseña"
            autoComplete="new-password"
            aria-required="true"
            value={confirmation}
            onValueChange={(value) => {
              setConfirmation(value);
              onEdit?.();
            }}
            onBlur={() => setIsConfirmationTouched(true)}
            isInvalid={showMismatch}
            errorMessage={showMismatch ? MISMATCH_MESSAGE : undefined}
            description={matches ? MATCH_MESSAGE : undefined}
            className="mt-[5px]"
            classNames={{ inputWrapper: "pr-2", description: MATCH_DESCRIPTION_CLASSES }}
            endContent={
              <AtPasswordToggle
                aria-label="Mostrar la confirmación"
                isVisible={isConfirmationVisible}
                onPress={() => setIsConfirmationVisible((visible) => !visible)}
              />
            }
          />
          {/* Los mensajes de HeroUI no se anuncian al aparecer: se repiten en una región viva. */}
          <p className="sr-only" aria-live="polite">
            {lengthError ? `${lengthError} ` : ""}
            {matches ? MATCH_MESSAGE : showMismatch ? MISMATCH_MESSAGE : ""}
          </p>
        </div>

        <AtButton type="submit" size="lg" fullWidth isDisabled={!isValid || !matches} isLoading={isSubmitting}>
          {submitLabel}
        </AtButton>
      </MlForm>

      {footer}
    </div>
  );
}
