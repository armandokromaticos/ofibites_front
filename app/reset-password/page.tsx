"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { useResetPassword } from "@/domain/hooks/auth";
import { parseRecoveryLink, RecoveryLink } from "@/domain/models";
import { getApiErrorMessage, getApiErrorMessages, isApiError } from "@/shared/utils";
import { AtButton, AtTextLink, MlAuthHeader, OrNewPasswordForm, TmAuthLayout } from "@/app/lib/atomic";

const GENERIC_ERROR = "No pudimos cambiar la contraseña. Inténtalo de nuevo en unos minutos.";

type View = "form" | "invalid-link" | "done";

/**
 * 400: mensaje del back en español (de class-validator, en array, o propio como "distinta de la anterior").
 * 429 (límite por IP): tal cual. 503, red y resto de 5xx: genérico; el formulario sigue para reintentar.
 */
function getResetErrorMessage(error: unknown): string {
  if (isApiError(error) && error.statusCode === 400) {
    return getApiErrorMessages(error)[0] ?? GENERIC_ERROR;
  }
  return getApiErrorMessage(error, GENERIC_ERROR);
}

function BackToLogin() {
  return (
    <p className="text-center text-base font-semibold text-placeholder">
      <AtTextLink href="/login">Volver al inicio de sesión</AtTextLink>
    </p>
  );
}

const subscribeNothing = () => () => {};

/** `true` solo en el cliente, ya hidratado (en el servidor y al hidratar, `false`). */
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

/** Lleva el foco al título cuando la pantalla cambia de estado (no al cargar la página). */
function useFocusOnChange(view: View) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const initialView = useRef(view);

  useEffect(() => {
    if (view !== initialView.current) titleRef.current?.focus();
  }, [view]);

  return titleRef;
}

function ResetPasswordFlow() {
  const router = useRouter();
  // El token solo vive en el estado de este componente: ni en storage ni en el store de auth.
  // Se lee una vez al montar (solo en el cliente: ver `useIsClient`).
  const [link] = useState<RecoveryLink>(() =>
    parseRecoveryLink(window.location.hash, window.location.search),
  );
  const [view, setView] = useState<View>(link.status === "valid" ? "form" : "invalid-link");
  const [linkExpired, setLinkExpired] = useState(link.status === "expired");
  const titleRef = useFocusOnChange(view);
  const { mutate: resetPassword, isPending, error, reset } = useResetPassword();

  // Fuera de la URL el token y los parámetros de error: no quedan en el historial ni se comparten.
  useEffect(() => {
    const { hash, search, pathname } = window.location;
    if (hash || search) window.history.replaceState(null, "", pathname);
  }, []);

  const handleSubmit = (password: string) => {
    if (link.status !== "valid") return;
    resetPassword(
      { accessToken: link.accessToken, password },
      {
        onSuccess: () => setView("done"),
        onError: (resetError) => {
          if (isApiError(resetError) && resetError.statusCode === 401) {
            setLinkExpired(true);
            setView("invalid-link");
          }
        },
      },
    );
  };

  if (view === "done") {
    // Figma 3236:12405.
    return (
      <div className="flex flex-col gap-10">
        <MlAuthHeader
          title="¡Contraseña actualizada!"
          titleRef={titleRef}
          subtitle="Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con tus nuevas credenciales."
        />
        <AtButton size="lg" fullWidth onPress={() => router.push("/login")}>
          Iniciar sesión
        </AtButton>
      </div>
    );
  }

  if (view === "invalid-link") {
    // Sin Figma: mismo esqueleto que "Contraseña actualizada".
    return (
      <div className="flex flex-col gap-10">
        <MlAuthHeader
          title={linkExpired ? "El enlace venció" : "El enlace no es válido"}
          titleRef={titleRef}
          subtitle={
            linkExpired
              ? "Los enlaces de recuperación duran poco y solo se pueden usar una vez. Pide uno nuevo para " +
                "cambiar tu contraseña."
              : "No pudimos leer el enlace de recuperación. Ábrelo de nuevo desde el correo o pide uno nuevo."
          }
        />
        <div className="flex flex-col gap-[19px]">
          <AtButton size="lg" fullWidth onPress={() => router.push("/forgot-password")}>
            Pedir un enlace nuevo
          </AtButton>
          <BackToLogin />
        </div>
      </div>
    );
  }

  // Figma 3236:12333, 3339:2640, 3339:2772 y 3339:3005. El 401 no se muestra aquí: cambia de pantalla.
  const isLinkError = isApiError(error) && error.statusCode === 401;
  const formError = error && !isLinkError ? getResetErrorMessage(error) : null;
  return (
    <div className="flex flex-col gap-[38px]">
      <MlAuthHeader
        title="Crear nueva contraseña"
        titleRef={titleRef}
        subtitle="Ingresa tu nueva contraseña a continuación. Asegúrate de que sea segura y fácil de recordar para ti."
      />
      <OrNewPasswordForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        error={formError}
        onEdit={() => {
          if (error) reset();
        }}
        footer={<BackToLogin />}
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  const isClient = useIsClient();

  return (
    <TmAuthLayout variant="centered">
      <div className="mx-auto w-full max-w-[502px]">
        {isClient ? (
          <ResetPasswordFlow />
        ) : (
          // El enlace va en el hash, que el servidor no ve: hasta hidratar no se sabe qué mostrar.
          <p role="status" className="py-24 text-center text-base font-semibold text-muted">
            Comprobando el enlace…
          </p>
        )}
      </div>
    </TmAuthLayout>
  );
}
