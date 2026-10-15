"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { useForgotPassword } from "@/domain/hooks/auth";
import { getApiErrorMessage, isApiError } from "@/shared/utils";
import {
  AT_TEXT_LINK_CLASSES,
  AtButton,
  AtInput,
  AtTextLink,
  MlAuthHeader,
  MlForm,
  MlFormAlert,
  TmAuthLayout,
} from "@/ui/atomic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_EMAIL_MESSAGE = "Escribe un correo válido, por ejemplo nombre@empresa.com.";
/** Supabase no deja reenviar el correo de recuperación al mismo usuario antes de ~60 s. */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * 400 ("email debe ser un correo válido", "…como máximo 254 caracteres"): mensaje propio con ejemplo, en el campo.
 * 429 (límite por IP) y resto con mensaje del back: tal cual. Red y 5xx: mensaje genérico.
 */
function getForgotErrorMessage(error: unknown): string {
  if (isApiError(error) && error.statusCode === 400) return INVALID_EMAIL_MESSAGE;
  return getApiErrorMessage(error, "No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos.");
}

function BackToLogin() {
  return (
    <p className="text-center text-base font-semibold text-placeholder">
      <AtTextLink href="/login">Volver al inicio de sesión</AtTextLink>
    </p>
  );
}

/** Cuenta atrás en segundos hasta `until` (marca de tiempo); 0 cuando ya pasó. */
function useCountdown(until: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= until) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [until]);

  // Hasta el primer tic, `now` puede ser de antes de `until`: nunca más que la espera completa.
  return Math.min(RESEND_COOLDOWN_SECONDS, Math.max(0, Math.ceil((until - now) / 1000)));
}

interface RequestLinkProps {
  onSent: (email: string) => void;
}

/** Paso 1 (Figma 3236:12197): correo + "Enviar código". */
function RequestLink({ onSent }: RequestLinkProps) {
  const { mutate: sendLink, isPending, error, reset } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);

  // El 400 es del campo; el resto (429, red, 5xx) va en la alerta.
  const isFieldError = isApiError(error) && error.statusCode === 400;
  const emailError = fieldError ?? (isFieldError ? INVALID_EMAIL_MESSAGE : null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setFieldError(value ? INVALID_EMAIL_MESSAGE : "Escribe tu correo electrónico.");
      event.currentTarget.querySelector<HTMLInputElement>("[name=\"email\"]")?.focus();
      return;
    }
    sendLink(
      { email: value },
      {
        onSuccess: () => onSent(value),
        // El 400 se pinta en el campo, que no se anuncia solo: el foco al campo lo hace leer con su error.
        onError: (sendError) => {
          if (isApiError(sendError) && sendError.statusCode === 400) {
            fieldsRef.current?.querySelector<HTMLInputElement>("[name=\"email\"]")?.focus();
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-[59px]">
      <MlAuthHeader
        title="¿Olvidaste tu contraseña?"
        subtitle={
          "¡No hay problema! Introduce tu dirección de correo electrónico y te enviaremos las " +
          "instrucciones para restablecer la contraseña a tu bandeja de entrada."
        }
      />

      <div className="flex flex-col gap-[19px]">
        <MlForm className="gap-[33px]" validationBehavior="aria" onSubmit={handleSubmit}>
          <div ref={fieldsRef} className="flex w-full flex-col gap-[19px]">
            {error && !isFieldError && <MlFormAlert>{getForgotErrorMessage(error)}</MlFormAlert>}

            <AtInput
              aria-label="Correo electrónico"
              name="email"
              type="email"
              placeholder="Correo Electrónico"
              autoComplete="email"
              aria-required="true"
              value={email}
              onValueChange={(value) => {
                setEmail(value);
                if (fieldError) setFieldError(null);
                if (error) reset();
              }}
              isInvalid={Boolean(emailError)}
              errorMessage={emailError ?? undefined}
            />
          </div>

          {/* Figma: deshabilitado (gris) con el campo vacío. */}
          <AtButton type="submit" size="lg" fullWidth isDisabled={!email.trim()} isLoading={isPending}>
            Enviar código
          </AtButton>
        </MlForm>

        <BackToLogin />
      </div>
    </div>
  );
}

interface CheckInboxProps {
  email: string;
  /** Marca de tiempo hasta la que no se puede reenviar. */
  cooldownUntil: number;
  onResent: () => void;
}

/** Paso 2 (Figma 3236:12268): "¡Revisa tu bandeja de entrada!" con "Reenviar enlace". */
function CheckInbox({ email, cooldownUntil, onResent }: CheckInboxProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { mutate: resend, isPending, error, reset } = useForgotPassword();
  const [notice, setNotice] = useState("");
  const secondsLeft = useCountdown(cooldownUntil);
  const isWaiting = secondsLeft > 0;

  // El formulario desaparece: el foco pasa al título del nuevo estado.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // aria-disabled y no disabled: el botón conserva el foco mientras espera o envía.
  const handleResend = () => {
    if (isWaiting || isPending) return;
    reset();
    setNotice("");
    resend(
      { email },
      {
        onSuccess: () => {
          onResent();
          setNotice(`Te enviamos un nuevo enlace a ${email}.`);
        },
        // Con el límite de Supabase, también se espera antes de volver a intentarlo.
        onError: (resendError) => {
          if (isApiError(resendError) && resendError.statusCode === 429) onResent();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-[59px]">
      <MlAuthHeader
        title="¡Revisa tu bandeja de entrada!"
        titleRef={titleRef}
        // Figma: el título (525 px) es más ancho que la columna de 502; el texto sigue en 502.
        className="sm:-mx-8"
        subtitle={
          <span className="mx-auto block max-w-[502px]">
            Enviamos un enlace de recuperación a{" "}
            {/* Figma en accent; secondary-600 para llegar a AA sobre crema. */}
            <span className="break-all text-secondary-600">{email}</span>. Sigue las instrucciones del
            mensaje para restablecer tu contraseña.
          </span>
        }
      />

      <div className="flex flex-col gap-[19px]">
        {error && <MlFormAlert>{getForgotErrorMessage(error)}</MlFormAlert>}

        <p className="text-center text-[15px] font-semibold leading-[19px] text-placeholder">
          ¿No lo encuentras? Revisa tu carpeta de correo no deseado (spam) o{" "}
          <button
            type="button"
            onClick={handleResend}
            aria-disabled={isWaiting || isPending ? "true" : undefined}
            className={
              isWaiting || isPending
                ? `${AT_TEXT_LINK_CLASSES} cursor-not-allowed no-underline`
                : `${AT_TEXT_LINK_CLASSES} cursor-pointer`
            }
          >
            {isPending ? "Reenviando…" : "Reenviar enlace"}
            {isWaiting && !isPending && <> en {secondsLeft} s</>}
          </button>
        </p>

        {/* Siempre en el DOM: una región viva que aparece ya con texto no siempre se anuncia. */}
        <p aria-live="polite" className="text-center text-[13px] font-semibold text-brand empty:hidden">
          {notice}
        </p>

        <BackToLogin />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const startCooldown = () => setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

  return (
    <TmAuthLayout variant="centered">
      <div className="mx-auto w-full max-w-[502px]">
        {sentTo ? (
          <CheckInbox email={sentTo} cooldownUntil={cooldownUntil} onResent={startCooldown} />
        ) : (
          <RequestLink
            onSent={(email) => {
              setSentTo(email);
              startCooldown();
            }}
          />
        )}
      </div>
    </TmAuthLayout>
  );
}
