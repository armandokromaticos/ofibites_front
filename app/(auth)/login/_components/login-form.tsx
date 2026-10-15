"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@heroui/react";

import { useLogin } from "@/domain/hooks/auth";
import { getHomePath } from "@/domain/models/auth.model";
import { useAuthHydrated, useAuthStore } from "@/domain/stores";
import { getApiErrorMessage, isApiError } from "@/shared/utils";
import {
  AtButton,
  AtInput,
  AtPasswordToggle,
  AtTextLink,
  MlAuthHeader,
  MlForm,
  MlFormAlert,
} from "@/app/lib/atomic";

const ERROR_ID = "login-error";
const PASSWORD_HINT = "Revisa tu contraseña: distingue mayúsculas de minúsculas.";
const SIN_EMPRESA_MESSAGE =
  "Ya no tienes acceso a ninguna empresa activa. Contacta al administrador de tu empresa.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** El back responde 401 "Credenciales inválidas" cuando el correo o la contraseña no coinciden. */
function isCredentialsError(error: unknown): boolean {
  return isApiError(error) && error.statusCode === 401 && error.message === "Credenciales inválidas";
}

/**
 * Resto de 401 ("cuenta no activada", "desactivada", "sin empresa"...): el mensaje del back tal cual, solo en la alerta.
 * Red, 408 y 5xx: mensaje genérico de `getApiErrorMessage`.
 */
function getLoginErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, "No pudimos iniciar sesión. Inténtalo de nuevo en unos minutos.");
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email) errors.email = "Escribe tu correo electrónico.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Escribe un correo válido, por ejemplo nombre@empresa.com.";
  if (!password) errors.password = "Escribe tu contraseña.";
  return errors;
}

interface LoginFormProps {
  /**
   * `centered`: login v1 (Figma 3236:11719), cabecera y enlaces centrados.
   * `start`: login v2, alineado a la izquierda y con el título animado.
   */
  align?: "centered" | "start";
}

/** Formulario de login compartido por las dos variantes: mismo comportamiento, copy y errores. */
export function LoginForm({ align = "centered" }: LoginFormProps) {
  const router = useRouter();
  const isStart = align === "start";
  const linkAlign = isStart ? "text-left" : "text-center";
  const { mutate: login, isPending, error, reset } = useLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Con una sesión de cliente ya abierta (p. ej. al volver a /login), directo al dashboard.
  const hasHydrated = useAuthHydrated();
  const hasClientSession = useAuthStore(
    (state) => state.isAuthenticated && state.user?.role === "CLIENT",
  );
  const shouldRedirect = hasHydrated && hasClientSession;
  // La guarda cerró la sesión porque el cliente ya no tiene empresa operativa (motivo en memoria, no en la URL).
  const signOutReason = useAuthStore((state) => state.signOutReason);
  const clearSignOutReason = useAuthStore((state) => state.clearSignOutReason);

  useEffect(() => {
    if (shouldRedirect) router.replace("/dashboard");
  }, [shouldRedirect, router]);

  // Solo un error de credenciales marca los campos; red, 5xx o "cuenta no activada" van solo en la alerta.
  const credentialsInvalid = isCredentialsError(error);

  const clearErrors = (field: keyof FieldErrors) => {
    if (error) reset();
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();

    if (signOutReason) clearSignOutReason();
    const errors = validate(email, password);
    setFieldErrors(errors);
    const firstInvalid = errors.email ? "email" : errors.password ? "password" : null;
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    // CLIENT → /dashboard; el resto (admin de plataforma, aún sin inicio propio) → /.
    login({ email, password }, { onSuccess: (me) => router.replace(getHomePath(me.user.role)) });
  };

  return (
    <div className="flex flex-col gap-5">
      <MlAuthHeader
        title="Iniciar sesión"
        subtitle="Aquí empieza tu experiencia de catering"
        align={isStart ? "start" : "center"}
        animateTitle={isStart}
      />

      {/*
        Validación propia con validationBehavior="aria": en "native", isInvalid hace setCustomValidity
        y el navegador bloquea el siguiente submit sin avisar (no se podía reintentar el login).
      */}
      <MlForm className="gap-[33px]" validationBehavior="aria" onSubmit={handleSubmit}>
        <div className="flex w-full flex-col gap-[19px]">
          {/*
            Figma 3388:2250 sin el contador de intentos ni el bloqueo: el back no tiene ninguno (T-09).
            Solo las credenciales marcan los campos; red, 5xx o "cuenta no activada" van solo en la alerta.
          */}
          {!error && signOutReason === "sin-empresa" && (
            <MlFormAlert title="Cerramos tu sesión.">{SIN_EMPRESA_MESSAGE}</MlFormAlert>
          )}
          {error && (
            <MlFormAlert id={ERROR_ID} title={credentialsInvalid ? "Correo o contraseña incorrectos." : undefined}>
              {credentialsInvalid ? undefined : getLoginErrorMessage(error)}
            </MlFormAlert>
          )}

          <AtInput
            aria-label="Correo electrónico"
            name="email"
            type="email"
            placeholder="Correo Electrónico"
            autoComplete="email"
            aria-required="true"
            isInvalid={Boolean(fieldErrors.email) || credentialsInvalid}
            errorMessage={fieldErrors.email}
            aria-describedby={credentialsInvalid ? ERROR_ID : undefined}
            onValueChange={() => clearErrors("email")}
          />

          <AtInput
            aria-label="Contraseña"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Contraseña"
            autoComplete="current-password"
            aria-required="true"
            isInvalid={Boolean(fieldErrors.password) || credentialsInvalid}
            errorMessage={fieldErrors.password ?? (credentialsInvalid ? PASSWORD_HINT : undefined)}
            aria-describedby={credentialsInvalid ? ERROR_ID : undefined}
            onValueChange={() => clearErrors("password")}
            classNames={{ inputWrapper: "pr-2" }}
            endContent={
              <AtPasswordToggle
                aria-label="Mostrar contraseña"
                isVisible={isPasswordVisible}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
              />
            }
          />
        </div>

        {/* También mientras se redirige (tras el login o con una sesión de cliente ya abierta). */}
        <AtButton type="submit" size="lg" fullWidth isLoading={isPending || shouldRedirect}>
          Iniciar sesión
        </AtButton>
      </MlForm>

      {/* Figma 3236:11719: "Olvidé la contraseña". La solicitud de acceso no está en el Figma del login. */}
      <p className={cn("mt-3 text-base font-semibold text-placeholder", linkAlign)}>
        <AtTextLink href="/forgot-password">Olvidé la contraseña</AtTextLink>
      </p>
      <p className={cn("text-base font-semibold text-placeholder", linkAlign)}>
        <AtTextLink href="/register">Solicitar acceso para mi empresa</AtTextLink>
      </p>
    </div>
  );
}
