"use client";

import { useId, useMemo, useState } from "react";

import { ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { CloudOff, Plus } from "lucide-react";

import { useCompleteOnboarding } from "@/domain/hooks/companies";
import {
  useCompanyMembers,
  useInviteCompanyMember,
} from "@/domain/hooks/company-members";
import { useDepartments } from "@/domain/hooks/departments";
import { COMPANY_ROLE_LABELS, COMPANY_ROLE_OPTIONS } from "@/domain/models";
import { CompanyMember, CompanyRole } from "@/domain/types";
import { enfocarPrimerCampoInvalido, isApiError } from "@/shared/utils";
import {
  AtAvatar,
  AtButton,
  AtChip,
  AtModal,
  AtSkeleton,
  MlEmptyState,
  MlFormAlert,
  OrMemberForm,
  OrMemberFormErrors,
  OrMemberFormField,
  OrMemberFormValues,
} from "@/ui/atomic";

import {
  integrantesLabel,
  mensajeErrorFinalizar,
  mensajeErrorInvitar,
  ROL_CORTO,
} from "../_data/onboarding";

import { useGuardaDobleClic } from "./use-guarda-doble-clic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** El Figma propone «Comprador» como rol por defecto («Rol de acceso · Comprador»). */
const VALORES_INICIALES: OrMemberFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  departmentId: "",
  branchId: "",
  role: "COMPANY_BUYER",
};

const OPCIONES_ROL = COMPANY_ROLE_OPTIONS.map((role) => ({
  value: role,
  label: COMPANY_ROLE_LABELS[role],
}));

/** Mismas reglas que «Añadir usuario» de Administración. */
function validar(valores: OrMemberFormValues): OrMemberFormErrors {
  const errores: OrMemberFormErrors = {};
  // T-39 pide "Escribe el nombre y apellido." para un solo campo; aquí son dos y llevan el mismo texto.
  if (!valores.firstName.trim())
    errores.firstName = "Escribe el nombre y apellido.";
  if (!valores.lastName.trim())
    errores.lastName = "Escribe el nombre y apellido.";
  if (!valores.email.trim()) errores.email = "Escribe el correo.";
  else if (!EMAIL_RE.test(valores.email.trim()))
    errores.email = "Revisa el correo: Parece que falta algo.";
  if (!valores.role) errores.role = "Selecciona un rol.";
  return errores;
}

interface Integrante {
  id: string;
  name: string;
  position: string | null;
  role: CompanyRole;
  isCurrentUser: boolean;
}

interface PasoEquipoProps {
  currentUserId: string;
  currentUserName: string;
  currentUserPosition: string | null;
  /** Se llama antes de `onboarding/complete`: el padre no debe redirigir mientras la sesión pasa a completada. */
  onFinishStart: () => void;
  onFinished: () => void;
  /** `onboarding/complete` falló (después de `onIncomplete` si era un 400). */
  onFinishFailed: () => void;
  /**
   * 400 de `onboarding/complete` (falta dirección fiscal o sede): el padre refresca los datos y, si algún paso
   * anterior quedó incompleto, lleva a él con el mensaje. Devuelve `true` si cambió de paso.
   */
  onIncomplete: (mensaje: string) => Promise<boolean>;
}

/**
 * Paso 3 (Figma `3394:2380`, `3394:2455` invitar, `3394:2598` con equipo): opcional. La lista siempre trae al
 * usuario actual («Tú · Administrador»). Invitar usa `POST .../members/invite` (T-29) con `OrMemberForm` sin
 * departamento ni sede («Sede asignada» se omite: decisión 2026-11-03). «Finalizar configuración» llama a
 * `onboarding/complete`; su 400 (falta dirección fiscal o sede) se muestra tal cual.
 */
export function PasoEquipo({
  currentUserId,
  currentUserName,
  currentUserPosition,
  onFinishStart,
  onFinished,
  onFinishFailed,
  onIncomplete,
}: PasoEquipoProps) {
  const id = useId();
  const membersQuery = useCompanyMembers();
  const invite = useInviteCompanyMember();
  const complete = useCompleteOnboarding();
  const departmentsQuery = useDepartments();
  const esDobleClic = useGuardaDobleClic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valores, setValores] = useState<OrMemberFormValues>(VALORES_INICIALES);
  const [errores, setErrores] = useState<OrMemberFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorFinalizar, setErrorFinalizar] = useState<string | null>(null);

  const integrantes = useMemo<Integrante[]>(() => {
    const lista = (membersQuery.data ?? [])
      .filter((member: CompanyMember) => member.isActive)
      .map((member) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        role: member.role,
        isCurrentUser: member.userId === currentUserId,
      }));
    // Si la lista aún no trae al usuario actual (o falló), se pinta igual desde la sesión: siempre está.
    if (!lista.some((item) => item.isCurrentUser)) {
      lista.unshift({
        id: "yo",
        name: currentUserName,
        position: currentUserPosition,
        role: "COMPANY_ADMIN",
        isCurrentUser: true,
      });
    }
    return lista.sort(
      (a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser),
    );
  }, [membersQuery.data, currentUserId, currentUserName, currentUserPosition]);

  const abrirModal = () => {
    setValores(VALORES_INICIALES);
    setErrores({});
    setFormError(null);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    if (!invite.isPending) setIsModalOpen(false);
  };

  const cambiar = <F extends OrMemberFormField>(
    field: F,
    value: OrMemberFormValues[F],
  ) => {
    setValores((actual) => ({ ...actual, [field]: value }));
    if (errores[field])
      setErrores((actual) => ({ ...actual, [field]: undefined }));
  };

  const invitar = () => {
    if (invite.isPending) return;
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      enfocarPrimerCampoInvalido();
      return;
    }

    setFormError(null);
    const name =
      `${valores.firstName.trim()} ${valores.lastName.trim()}`.trim();
    const email = valores.email.trim();
    invite
      .mutateAsync({
        name,
        email,
        role: valores.role as CompanyRole,
        ...(valores.phone.trim() && { phone: valores.phone.trim() }),
        ...(valores.position.trim() && { position: valores.position.trim() }),
        ...(valores.departmentId && { departmentId: valores.departmentId }),
      })
      .then(() => {
        setIsModalOpen(false);
        setAviso(`¡Listo! Enviamos la invitación a ${email}.`);
      })
      .catch((error: unknown) => setFormError(mensajeErrorInvitar(error)));
  };

  const finalizar = () => {
    if (complete.isPending || esDobleClic()) return;
    setErrorFinalizar(null);
    onFinishStart();
    complete
      .mutateAsync()
      .then(onFinished)
      .catch(async (error: unknown) => {
        const mensaje = mensajeErrorFinalizar(error);
        const es400 = isApiError(error) && error.statusCode === 400;
        const cambioDePaso = es400 && (await onIncomplete(mensaje));
        if (!cambioDePaso) setErrorFinalizar(mensaje);
        onFinishFailed();
      });
  };

  const tituloId = `${id}-titulo`;
  const modalTituloId = `${id}-modal-titulo`;

  return (
    <div className="flex flex-col gap-[25px] w-full">
      <section
        aria-labelledby={tituloId}
        aria-busy={membersQuery.isPending || undefined}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center gap-3">
          <h2
            id={tituloId}
            className="font-display font-bold text-[21px] text-foreground leading-7"
          >
            Tu equipo
          </h2>
          <span className="bg-secondary-600 px-2.5 py-0.5 rounded-full font-semibold text-primary-foreground text-xs leading-4">
            {integrantesLabel(integrantes.length)}
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {integrantes.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-content1 px-4 py-3 border border-border-subtle rounded-card"
            >
              <AtAvatar name={item.name} isDecorative />
              <div className="flex flex-col flex-1 min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-[17px] text-foreground leading-6">
                  <span className="min-w-0 break-words">{item.name}</span>
                  {item.isCurrentUser && (
                    <AtChip className="bg-background h-5 text-[11px] text-muted">
                      Tú
                    </AtChip>
                  )}
                </p>
                {item.position && (
                  <p className="text-[15px] text-subtle leading-5">
                    {item.position}
                  </p>
                )}
              </div>
              <AtChip className="shrink-0">{ROL_CORTO[item.role]}</AtChip>
            </li>
          ))}
          {membersQuery.isPending && (
            <li aria-hidden="true">
              <AtSkeleton className="rounded-card h-[66px]" />
            </li>
          )}
        </ul>

        {membersQuery.isError && (
          <div className="bg-content1 rounded-card">
            <MlEmptyState
              tone="error"
              size="sm"
              headingLevel={3}
              icon={<CloudOff />}
              title="No pudimos cargar tu equipo"
              description="Puedes seguir igual: tu equipo se verá en la sección Usuarios."
              actionLabel="Reintentar"
              onAction={() => membersQuery.refetch()}
              isActionLoading={membersQuery.isFetching}
            />
          </div>
        )}

        <p
          role="status"
          className="empty:hidden font-semibold text-[13px] text-brand leading-[18px]"
        >
          {aviso}
        </p>

        <AtButton
          size="sm"
          variant="bordered"
          className="self-start px-4 border-primary text-[13px] text-primary"
          onPress={abrirModal}
          startContent={<Plus aria-hidden="true" className="size-4" />}
        >
          Agregar integrante
        </AtButton>
        <p className="text-[13px] text-muted leading-[18px]">
          Puedes invitar a más personas cuando quieras desde la sección de
          Usuarios.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        {errorFinalizar && (
          <MlFormAlert title="No pudimos terminar la configuración.">
            {errorFinalizar}
          </MlFormAlert>
        )}
        <AtButton
          size="lg"
          fullWidth
          onPress={finalizar}
          isLoading={complete.isPending}
        >
          Finalizar configuración
        </AtButton>
      </div>

      <AtModal
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          if (!open) cerrarModal();
        }}
        placement="center"
        scrollBehavior="outside"
        isDismissable={!invite.isPending}
        isKeyboardDismissDisabled={invite.isPending}
        hideCloseButton
        classNames={{
          wrapper: "px-4",
          base: "mx-0 my-8 max-w-[564px] rounded-card bg-content1 shadow-popover",
          backdrop: "bg-primary/25 backdrop-blur-[2px]",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-5 sm:px-7 pt-6 sm:pt-7 pb-0">
            <h2
              id={modalTituloId}
              className="font-display font-bold text-[28px] text-foreground leading-9 tracking-[-0.04em]"
            >
              Invitar a una persona al equipo
            </h2>
            <p className="font-normal text-muted text-xs leading-4">
              Le enviaremos un correo para que entre con sus propias
              credenciales. Tendrá acceso a todas las sedes.
            </p>
          </ModalHeader>
          <ModalBody className="p-0">
            <OrMemberForm
              mode="create"
              title={null}
              values={valores}
              errors={errores}
              onChange={cambiar}
              departmentOptions={(departmentsQuery.data ?? []).map((d) => ({
                id: d.id,
                name: d.name,
              }))}
              isLoadingDepartments={departmentsQuery.isLoading}
              branchOptions={[]}
              roleOptions={OPCIONES_ROL}
              hideBranch
              formError={formError}
              onSubmit={invitar}
              onCancel={cerrarModal}
              isSubmitting={invite.isPending}
              submitLabel="Enviar invitación"
              cancelLabel="Continuar más tarde"
              className="bg-transparent px-5 sm:px-7 pt-4 pb-6 sm:pb-7 rounded-none"
            />
          </ModalBody>
        </ModalContent>
      </AtModal>
    </div>
  );
}
