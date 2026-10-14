"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Eye, EyeOff } from "lucide-react";

import { useLogin } from "@/domain/hooks/auth";
import { getApiErrorMessage, isApiError } from "@/shared/utils";
import { AtButton, AtIconButton, AtInput, MlAuthHeader, MlForm, MlFormAlert, TmAuthLayout } from "@/app/lib/atomic";

const ERROR_ID = "login-error";
const PASSWORD_HINT = "Revisa tu contraseña: distingue mayúsculas de minúsculas.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** El back responde 401 "Credenciales inválidas" cuando el correo o la contraseña no coinciden. */
function isCredentialsError(error: unknown): boolean {
  return isApiError(error) && error.statusCode === 401 && error.message === "Credenciales inválidas";
}

/**
 * Resto de 401 ("cuenta no activada", "desactivada"...): el mensaje del back tal cual.
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

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, error, reset } = useLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

    const errors = validate(email, password);
    setFieldErrors(errors);
    const firstInvalid = errors.email ? "email" : errors.password ? "password" : null;
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    login({ email, password }, { onSuccess: () => router.push("/") });
  };

  return (
    <TmAuthLayout>
      <div className="flex flex-col gap-5">
        <MlAuthHeader title="Iniciar sesión" subtitle="Aquí empieza tu experiencia de catering" />

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
                <AtIconButton
                  aria-label="Mostrar contraseña"
                  aria-pressed={isPasswordVisible}
                  className="border-0 bg-transparent text-muted data-[hover=true]:bg-surface-sand"
                  onPress={() => setIsPasswordVisible((visible) => !visible)}
                >
                  {isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </AtIconButton>
              }
            />
          </div>

          <AtButton type="submit" size="lg" fullWidth isLoading={isPending}>
            Iniciar sesión
          </AtButton>
        </MlForm>

        {/* "Olvidé la contraseña" del Figma: sin ruta ni endpoint todavía. En su lugar, la solicitud de acceso. */}
        <p className="mt-3 text-center text-base font-semibold text-placeholder">
          <Link
            href="/register"
            className="rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Solicitar acceso para mi empresa
          </Link>
        </p>
      </div>
    </TmAuthLayout>
  );
}
