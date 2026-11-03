"use client";

import { useId, useMemo, useState } from "react";

import { ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { CloudOff, Plus } from "lucide-react";

import { useCompleteOnboarding } from "@/domain/hooks/companies";
import { useCompanyMembers, useInviteCompanyMember } from "@/domain/hooks/company-members";
import { COMPANY_ROLE_LABELS, COMPANY_ROLE_OPTIONS } from "@/domain/models";
import { CompanyMember, CompanyRole } from "@/domain/types";
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

import { integrantesLabel, mensajeErrorFinalizar, mensajeErrorInvitar, ROL_CORTO } from "../_data/onboarding";

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
  if (!valores.firstName.trim()) errores.firstName = "Escribe el nombre.";
  if (!valores.lastName.trim()) errores.lastName = "Escribe el apellido.";
  if (!valores.email.trim()) errores.email = "Escribe el correo.";
  else if (!EMAIL_RE.test(valores.email.trim())) errores.email = "Escribe un correo válido.";
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
  onFinished: () => void;
}

/**
 * Paso 3 (Figma `3394:2380`, `3394:2455` invitar, `3394:2598` con equipo): opcional. La lista siempre trae al
 * usuario actual («Tú · Administrador»). Invitar usa `POST .../members/invite` (T-29) con `OrMemberForm` sin
 * departamento ni sede («Sede asignada» se omite: decisión 2026-11-03). «Finalizar y comenzar» llama a
 * `onboarding/complete`; su 400 (falta dirección fiscal o sede) se muestra tal cual.
 */
export function PasoEquipo({
  currentUserId,
  currentUserName,
  currentUserPosition,
  onFinished,
}: PasoEquipoProps) {
  const id = useId();
  const membersQuery = useCompanyMembers();
  const invite = useInviteCompanyMember();
  const complete = useCompleteOnboarding();
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
    return lista.sort((a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser));
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

  const cambiar = <F extends OrMemberFormField>(field: F, value: OrMemberFormValues[F]) => {
    setValores((actual) => ({ ...actual, [field]: value }));
    if (errores[field]) setErrores((actual) => ({ ...actual, [field]: undefined }));
  };

  const invitar = () => {
    if (invite.isPending) return;
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setFormError(null);
    const name = `${valores.firstName.trim()} ${valores.lastName.trim()}`.trim();
    const email = valores.email.trim();
    invite
      .mutateAsync({
        name,
        email,
        role: valores.role as CompanyRole,
        ...(valores.phone.trim() && { phone: valores.phone.trim() }),
        ...(valores.position.trim() && { position: valores.position.trim() }),
      })
      .then(() => {
        setIsModalOpen(false);
        setAviso(`Invitamos a ${name}. Le llegará un correo a ${email} para entrar.`);
      })
      .catch((error: unknown) => setFormError(mensajeErrorInvitar(error)));
  };

  const finalizar = () => {
    if (complete.isPending || esDobleClic()) return;
    setErrorFinalizar(null);
    complete
      .mutateAsync()
      .then(onFinished)
      .catch((error: unknown) => setErrorFinalizar(mensajeErrorFinalizar(error)));
  };

  const tituloId = `${id}-titulo`;
  const modalTituloId = `${id}-modal-titulo`;

  return (
    <div className="flex w-full flex-col gap-[25px]">
      <section aria-labelledby={tituloId} aria-busy={membersQuery.isPending || undefined} className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id={tituloId} className="font-display text-[21px] font-bold leading-7 text-foreground">
            Tu equipo
          </h2>
          <span className="rounded-full bg-secondary-600 px-2.5 py-0.5 text-xs font-semibold leading-4 text-primary-foreground">
            {integrantesLabel(integrantes.length)}
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {integrantes.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-card border border-border-subtle bg-content1 px-4 py-3"
            >
              <AtAvatar name={item.name} isDecorative />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="flex flex-wrap items-center gap-2 text-[17px] font-semibold leading-6 text-foreground">
                  <span className="min-w-0 break-words">{item.name}</span>
                  {item.isCurrentUser && <AtChip className="h-5 bg-background text-[11px] text-muted">Tú</AtChip>}
                </p>
                {item.position && <p className="text-[15px] leading-5 text-subtle">{item.position}</p>}
              </div>
              <AtChip className="shrink-0">{ROL_CORTO[item.role]}</AtChip>
            </li>
          ))}
          {membersQuery.isPending && (
            <li aria-hidden="true">
              <AtSkeleton className="h-[66px] rounded-card" />
            </li>
          )}
        </ul>

        {membersQuery.isError && (
          <div className="rounded-card bg-content1">
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

        <p role="status" className="text-[13px] font-semibold leading-[18px] text-brand empty:hidden">
          {aviso}
        </p>

        <AtButton
          size="sm"
          variant="bordered"
          className="self-start border-primary px-4 text-[13px] text-primary"
          onPress={abrirModal}
          startContent={<Plus aria-hidden="true" className="size-4" />}
        >
          Agregar integrante
        </AtButton>
        <p className="text-[13px] leading-[18px] text-muted">
          Puedes invitar a más personas cuando quieras desde la sección Usuarios.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        {errorFinalizar && <MlFormAlert title="No pudimos terminar la configuración.">{errorFinalizar}</MlFormAlert>}
        <AtButton size="lg" fullWidth onPress={finalizar} isLoading={complete.isPending}>
          Finalizar y comenzar
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
          <ModalHeader className="flex flex-col gap-1 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
            <h2 id={modalTituloId} className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
              Invitar integrante
            </h2>
            <p className="text-xs font-normal leading-4 text-muted">
              Le enviaremos un correo para que entre con sus propias credenciales. Tendrá acceso a todas
              las sedes.
            </p>
          </ModalHeader>
          <ModalBody className="p-0">
            <OrMemberForm
              mode="create"
              title={null}
              values={valores}
              errors={errores}
              onChange={cambiar}
              departmentOptions={[]}
              branchOptions={[]}
              roleOptions={OPCIONES_ROL}
              hideDepartment
              hideBranch
              formError={formError}
              onSubmit={invitar}
              onCancel={cerrarModal}
              isSubmitting={invite.isPending}
              submitLabel="Agregar integrante"
              cancelLabel="Continuar más tarde"
              className="rounded-none bg-transparent px-5 pb-6 pt-4 sm:px-7 sm:pb-7"
            />
          </ModalBody>
        </ModalContent>
      </AtModal>
    </div>
  );
}
