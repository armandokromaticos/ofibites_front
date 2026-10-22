"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { CloudOff } from "lucide-react";

import { useChangePassword, useMe, useUpdateMe } from "@/domain/hooks/auth";
import { COMPANY_ROLE_LABELS, separarNombreApellido, unirNombreApellido } from "@/domain/models";
import { useAuthStore } from "@/domain/stores";
import { Membership, MeResponse, UpdateMeRequest } from "@/domain/types";
import { formatCaracasDateSlash } from "@/shared/utils";
import { AtSkeleton } from "@/ui/atomic/atoms";
import { MlEmptyState, MlSectionNavItem } from "@/ui/atomic/molecules";
import {
  OrChangePasswordFocusRequest,
  OrChangePasswordForm,
  OrChangePasswordFormValues,
  OrChangePasswordServerErrors,
  OrProfileBasicForm,
  OrProfileBasicFormField,
  OrProfileBasicFormValues,
  OrProfileCard,
  OrStatusModal,
} from "@/ui/atomic/organisms";

import { parseSeccionPerfil, RUTA_DASHBOARD, rutaPerfil } from "../../_navegacion";
import { clasificarErrorContrasena, mensajeErrorPerfil } from "../_data/errores-perfil";

const RUTA_OLVIDE_CONTRASENA = "/forgot-password";

/** Secciones del Figma (`3651:1920`). Sin `href`: fases siguientes, deshabilitadas con "Pronto". */
const SECCIONES: MlSectionNavItem[] = [
  { key: "datos", label: "Datos básicos", href: rutaPerfil("datos") },
  { key: "contrasena", label: "Contraseña", href: rutaPerfil("contrasena") },
  { key: "notificaciones", label: "Notificaciones" },
  { key: "sedes", label: "Direcciones y sedes" },
  { key: "indicadores", label: "Indicadores" },
];

function valoresDesde(me: MeResponse, membership: Membership | undefined): OrProfileBasicFormValues {
  const { firstName, lastName } = separarNombreApellido(me.user.name);
  return { firstName, lastName, phone: me.user.phone ?? "", position: membership?.position ?? "" };
}

/** Solo lo que cambió: sin `position` no hace falta `X-Company-Id` ni membresía (contrato T-30a). */
function cuerpoCambios(
  base: OrProfileBasicFormValues,
  valores: OrProfileBasicFormValues,
  conCargo: boolean,
): UpdateMeRequest {
  const cuerpo: UpdateMeRequest = {};
  const nombre = unirNombreApellido(valores.firstName, valores.lastName);
  if (nombre !== unirNombreApellido(base.firstName, base.lastName)) cuerpo.name = nombre;
  if (valores.phone.trim() !== base.phone.trim()) cuerpo.phone = valores.phone.trim() || null;
  if (conCargo && valores.position.trim() !== base.position.trim()) {
    cuerpo.position = valores.position.trim() || null;
  }
  return cuerpo;
}

/**
 * "Mi perfil" del cliente (T-30, fase 1): tarjeta lateral con la navegación y las secciones Datos básicos y
 * Contraseña. La sección activa va en `?seccion=` (enlazable); cambiarla no navega (`history.replaceState`) y
 * los dos formularios siguen montados, así que un cambio sin guardar no se pierde al ir y volver.
 * Estados: cargando (esqueleto), error con reintentar y con datos (`GET /auth/me`, la misma caché de la guarda).
 */
export function PerfilCliente() {
  const meQuery = useMe();

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">Mi perfil</h1>
          <p className="max-w-[60ch] text-sm leading-[22px] text-brand">
            Gestiona tus datos, tu acceso, tus avisos y las sedes de entrega de tu empresa.
          </p>
        </div>
        <Link
          href={RUTA_DASHBOARD}
          className="text-sm font-medium leading-5 text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:mt-3"
        >
          ‹ Volver al inicio
        </Link>
      </div>

      {meQuery.isPending ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]" aria-busy="true">
          <span className="sr-only">Cargando tu perfil…</span>
          <AtSkeleton className="h-[360px] rounded-card" />
          <AtSkeleton className="h-[640px] rounded-card" />
        </div>
      ) : meQuery.isError ? (
        <div className="rounded-card bg-content1">
          <MlEmptyState
            tone="error"
            headingLevel={2}
            icon={<CloudOff />}
            title="No pudimos cargar tu perfil"
            description="Puede ser un problema de conexión. Vuelve a intentarlo en unos segundos."
            actionLabel="Reintentar"
            onAction={() => meQuery.refetch()}
            isActionLoading={meQuery.isFetching}
          />
        </div>
      ) : (
        <PerfilConDatos me={meQuery.data} />
      )}
    </div>
  );
}

function PerfilConDatos({ me }: { me: MeResponse }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seccion = parseSeccionPerfil(searchParams.get("seccion"));

  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const membership = me.memberships.find((m) => m.companyId === activeCompanyId);

  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();

  // Datos básicos: `base` sale siempre del último `/auth/me`; `borrador` solo existe mientras se edita.
  const base = useMemo(() => valoresDesde(me, membership), [me, membership]);
  const [borrador, setBorrador] = useState<OrProfileBasicFormValues | null>(null);
  const valores = borrador ?? base;
  const conCargo = Boolean(membership);
  // Mismo criterio que el cuerpo del PATCH: mover una palabra de Nombre a Apellido no cambia `name`, así que no
  // activa "Guardar cambios".
  const isDirty = borrador !== null && Object.keys(cuerpoCambios(base, borrador, conCargo)).length > 0;
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [perfilGuardado, setPerfilGuardado] = useState(false);

  // Contraseña: `formKey` vuelve a montar el formulario (vacío) tras un cambio correcto.
  const [formKey, setFormKey] = useState(0);
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null);
  const [erroresServidor, setErroresServidor] = useState<OrChangePasswordServerErrors>({});
  const [contrasenaCambiada, setContrasenaCambiada] = useState(false);
  const [actualIncorrecta, setActualIncorrecta] = useState(false);
  const [focoContrasena, setFocoContrasena] = useState<OrChangePasswordFocusRequest | null>(null);
  // "Volver a intentar" pide reescribir la actual; "Olvidé mi contraseña" sale de la página.
  const enfocarActualAlCerrar = useRef(false);

  const enfocarCampo = (field: OrChangePasswordFocusRequest["field"], select = false) =>
    setFocoContrasena((actual) => ({ id: (actual?.id ?? 0) + 1, field, select }));

  const irASeccion = useCallback((key: string) => {
    // `null` y no `history.state`: con el estado interno de Next, `useSearchParams` no se entera (T-19).
    window.history.replaceState(null, "", rutaPerfil(parseSeccionPerfil(key)));
  }, []);

  const cambiarCampo = (campo: OrProfileBasicFormField, value: string) => {
    setBorrador((actual) => ({ ...(actual ?? base), [campo]: value }));
    setErrorPerfil(null);
  };

  const guardarPerfil = () => {
    if (updateMe.isPending) return;
    const cuerpo = cuerpoCambios(base, valores, conCargo);
    if (Object.keys(cuerpo).length === 0) {
      setBorrador(null);
      return;
    }
    setErrorPerfil(null);
    updateMe.mutate(cuerpo, {
      onSuccess: () => {
        // La caché de `useMe` ya tiene la respuesta: `base` pasa a ser lo guardado.
        setBorrador(null);
        setPerfilGuardado(true);
      },
      onError: (error) => setErrorPerfil(mensajeErrorPerfil(error)),
    });
  };

  const actualizarContrasena = ({ currentPassword, newPassword }: OrChangePasswordFormValues) => {
    if (changePassword.isPending) return;
    setErrorContrasena(null);
    setErroresServidor({});
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setFormKey((key) => key + 1);
          setContrasenaCambiada(true);
        },
        onError: (error) => {
          const clasificado = clasificarErrorContrasena(error);
          if (clasificado.tipo === "actual-incorrecta") {
            // El foco va al campo cuando el modal termine de cerrarse (`onExited`).
            setErroresServidor({ currentPassword: clasificado.mensaje });
            enfocarActualAlCerrar.current = true;
            setActualIncorrecta(true);
          } else if (clasificado.tipo === "actual") {
            setErroresServidor({ currentPassword: clasificado.mensaje });
            enfocarCampo("currentPassword");
          } else if (clasificado.tipo === "nueva") {
            setErroresServidor({ newPassword: clasificado.mensaje });
            enfocarCampo("newPassword");
          } else {
            setErrorContrasena(clasificado.mensaje);
          }
        },
      },
    );
  };

  const roleLabel = membership
    ? [COMPANY_ROLE_LABELS[membership.role], membership.branchName].filter(Boolean).join(" · ")
    : undefined;
  const passwordChangedAt = me.user.passwordChangedAt;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr] xl:gap-8">
      <OrProfileCard
        name={me.user.name}
        email={me.user.email}
        roleLabel={roleLabel}
        nav={{
          "aria-label": "Secciones del perfil",
          items: SECCIONES,
          activeKey: seccion,
          onSelect: irASeccion,
        }}
      />

      <div className="min-w-0">
        <div hidden={seccion !== "datos"}>
          <OrProfileBasicForm
            values={valores}
            onChange={cambiarCampo}
            name={me.user.name}
            email={me.user.email}
            departmentName={membership?.departmentName ?? null}
            branchName={membership?.branchName ?? null}
            showPosition={Boolean(membership)}
            updatedLabel={`Última actualización: ${formatCaracasDateSlash(me.user.updatedAt)}`}
            isDirty={isDirty}
            isSubmitting={updateMe.isPending}
            formError={errorPerfil}
            onSubmit={guardarPerfil}
            onDiscard={() => {
              setBorrador(null);
              setErrorPerfil(null);
            }}
          />
        </div>
        <div hidden={seccion !== "contrasena"}>
          <OrChangePasswordForm
            key={formKey}
            onSubmit={actualizarContrasena}
            isSubmitting={changePassword.isPending}
            formError={errorContrasena}
            serverErrors={erroresServidor}
            focusRequest={focoContrasena}
            onEdit={() => {
              setErrorContrasena(null);
              setErroresServidor({});
            }}
            lastChangedLabel={
              passwordChangedAt ? `Última vez que la cambiaste: ${formatCaracasDateSlash(passwordChangedAt)}` : undefined
            }
          />
        </div>
      </div>

      <OrStatusModal
        isOpen={perfilGuardado}
        onClose={() => setPerfilGuardado(false)}
        tone="success"
        title="Perfil actualizado"
        description="Tus datos quedaron guardados y ya se ven así para el resto de tu empresa."
        note="Tu departamento y tu sede los define tu empresa y no cambiaron."
      />
      <OrStatusModal
        isOpen={contrasenaCambiada}
        onClose={() => setContrasenaCambiada(false)}
        tone="success"
        title="Contraseña actualizada"
        description="Tu nueva contraseña ya está activa. Cerramos tu sesión en los demás dispositivos por seguridad; en este sigues conectado."
      />
      <OrStatusModal
        isOpen={actualIncorrecta}
        onClose={() => setActualIncorrecta(false)}
        tone="error"
        title="La contraseña actual no es correcta"
        description="No cambiamos nada. Verifica que la escribiste bien; cuidado con las mayúsculas."
        primaryAction={{ label: "Volver a intentar", onPress: () => setActualIncorrecta(false) }}
        secondaryAction={{
          label: "Olvidé mi contraseña",
          onPress: () => {
            enfocarActualAlCerrar.current = false;
            router.push(RUTA_OLVIDE_CONTRASENA);
          },
        }}
        onExited={() => {
          if (!enfocarActualAlCerrar.current) return;
          enfocarActualAlCerrar.current = false;
          // Tras desmontar, el FocusScope devuelve el foco a "Actualizar contraseña": se enfoca después.
          window.setTimeout(() => enfocarCampo("currentPassword", true), 0);
        }}
      />
    </div>
  );
}
