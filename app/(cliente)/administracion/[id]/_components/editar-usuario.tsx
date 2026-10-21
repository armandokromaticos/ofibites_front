"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { CloudOff, Sparkles } from "lucide-react";

import { useBranches } from "@/domain/hooks/branches";
import { useCompanyMember, useUpdateCompanyMember } from "@/domain/hooks/company-members";
import { useDepartments } from "@/domain/hooks/departments";
import {
  COMPANY_ROLE_DESCRIPTIONS,
  COMPANY_ROLE_LABELS,
  COMPANY_ROLE_OPTIONS,
  formatMemberLastSeen,
  MEMBER_STATUS_COLORS,
  MEMBER_STATUS_LABELS,
  memberStatus,
} from "@/domain/models";
import { CompanyMember } from "@/domain/types";
import { formatCaracasDateSlash } from "@/shared/utils";
import { AtButton, AtModal, AtSkeleton } from "@/ui/atomic/atoms";
import { MlEmptyState, MlRoleGuide } from "@/ui/atomic/molecules";
import { OrConfirmModal, OrMemberForm, OrMemberFormErrors, OrMemberFormField, OrMemberFormValues } from "@/ui/atomic/organisms";

import { RUTA_ADMINISTRACION } from "../../../_navegacion";
import { mensajeErrorMiembro } from "../../_data/errores-administracion";

const ROLE_GUIDE_ITEMS = COMPANY_ROLE_OPTIONS.map((role) => ({
  label: COMPANY_ROLE_LABELS[role],
  description: COMPANY_ROLE_DESCRIPTIONS[role],
}));

/** Separa `User.name` por el **primer espacio** (heurística): el resto, aunque tenga más espacios, es "apellido". */
function separarNombreApellido(name: string): { firstName: string; lastName: string } {
  const indice = name.indexOf(" ");
  if (indice === -1) return { firstName: name, lastName: "" };
  return { firstName: name.slice(0, indice), lastName: name.slice(indice + 1) };
}

function valoresDesde(
  member: Pick<CompanyMember, "name" | "email" | "phone" | "position" | "departmentId" | "branchId" | "role">,
): OrMemberFormValues {
  const { firstName, lastName } = separarNombreApellido(member.name);
  return {
    firstName,
    lastName,
    email: member.email,
    phone: member.phone ?? "",
    position: member.position ?? "",
    departmentId: member.departmentId ?? "",
    branchId: member.branchId ?? "",
    role: member.role,
  };
}

interface EditarUsuarioProps {
  id: string;
}

/** Carga el miembro (`GET .../members/:id`) y pinta sus 3 estados (cargando, error, con datos). */
export function EditarUsuario({ id }: EditarUsuarioProps) {
  const memberQuery = useCompanyMember(id);

  if (memberQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
        <AtSkeleton className="h-10 w-64 rounded-full" />
        <AtSkeleton className="h-[420px] rounded-card" />
      </div>
    );
  }

  if (memberQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[1296px] rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          headingLevel={2}
          icon={<CloudOff />}
          title="No pudimos cargar este usuario"
          description="Puede que ya no exista, o que sea un problema de conexión."
          actionLabel="Volver a usuarios"
          actionHref={RUTA_ADMINISTRACION}
        />
      </div>
    );
  }

  // `key`: si `id` cambia (navegación directa entre dos ediciones), el formulario vuelve a montar con el
  // estado inicial del miembro nuevo, en vez de arrastrar los campos del anterior.
  return <FormularioEdicion key={memberQuery.data.id} member={memberQuery.data} />;
}

interface FormularioEdicionProps {
  member: CompanyMember;
}

/**
 * "Editar usuario" (Figma `3511:9089`) con el modal "Usuario editado" (`3529:1721`) y el de
 * "Desactivar usuario" (`3529:1880`, igual que el de la lista). Nombre, Apellido y Teléfono son editables
 * (T-29c); Correo sigue de solo lectura (ver `OrMemberForm`). El estado local se inicializa una vez desde
 * `member` (sin `useEffect`: `EditarUsuario` ya solo renderiza esto con datos listos).
 */
function FormularioEdicion({ member }: FormularioEdicionProps) {
  const router = useRouter();
  const departmentsQuery = useDepartments();
  const branchesQuery = useBranches();
  const updateMember = useUpdateCompanyMember();

  const [valores, setValores] = useState<OrMemberFormValues>(() => valoresDesde(member));
  const [isActive, setIsActive] = useState(member.isActive);
  const [errores, setErrores] = useState<OrMemberFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const departmentOptions = departmentsQuery.data ?? [];
  const branchOptions = branchesQuery.data ?? [];
  const roleOptions = COMPANY_ROLE_OPTIONS.map((role) => ({
    value: role,
    label: COMPANY_ROLE_LABELS[role],
  }));

  const status = memberStatus({ isActive, lastSeenAt: member.lastSeenAt });
  const { name, email } = member;

  const cambiar = <F extends OrMemberFormField>(field: F, value: OrMemberFormValues[F]) => {
    setValores((actual) => ({ ...actual, [field]: value }));
    if (errores[field]) setErrores((actual) => ({ ...actual, [field]: undefined }));
  };

  const guardar = () => {
    if (updateMember.isPending) return;
    if (!valores.firstName.trim()) {
      setErrores({ firstName: "Escribe el nombre." });
      return;
    }
    if (!valores.role) {
      setErrores({ role: "Selecciona un rol." });
      return;
    }
    setErrores({});
    setFormError(null);

    updateMember.mutate(
      {
        id: member.id,
        body: {
          name: `${valores.firstName.trim()} ${valores.lastName.trim()}`.trim(),
          phone: valores.phone.trim() || null,
          role: valores.role,
          position: valores.position.trim() || null,
          departmentId: valores.departmentId || null,
          branchId: valores.branchId || null,
          isActive,
        },
      },
      {
        onSuccess: () => setShowSuccess(true),
        onError: (error) => setFormError(mensajeErrorMiembro(error, "No pudimos guardar los cambios. Inténtalo de nuevo.")),
      },
    );
  };

  const reactivar = () => {
    setIsTogglingActive(true);
    updateMember.mutate(
      { id: member.id, body: { isActive: true } },
      {
        onSuccess: () => setIsActive(true),
        onError: (error) => setFormError(mensajeErrorMiembro(error, "No pudimos reactivar al usuario.")),
        onSettled: () => setIsTogglingActive(false),
      },
    );
  };

  const confirmarDesactivar = () => {
    setIsTogglingActive(true);
    updateMember.mutate(
      { id: member.id, body: { isActive: false } },
      {
        onSuccess: () => {
          setIsActive(false);
          setShowDeactivate(false);
        },
        onError: (error) => setFormError(mensajeErrorMiembro(error, "No pudimos desactivar al usuario.")),
        onSettled: () => setIsTogglingActive(false),
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
            Editar usuario
          </h1>
          <p className="max-w-[52ch] text-sm leading-[22px] text-muted">
            Ajusta sus datos, su rol o su acceso. Los cambios se aplican de inmediato.
          </p>
        </div>
        <Link
          href={RUTA_ADMINISTRACION}
          className="text-sm font-medium leading-5 text-foreground underline-offset-4 hover:underline"
        >
          ‹ Volver a usuarios
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <OrMemberForm
          mode="edit"
          values={valores}
          errors={errores}
          onChange={cambiar}
          departmentOptions={departmentOptions}
          branchOptions={branchOptions}
          roleOptions={roleOptions}
          isLoadingDepartments={departmentsQuery.isPending}
          isLoadingBranches={branchesQuery.isPending}
          header={{
            name,
            email,
            statusLabel: MEMBER_STATUS_LABELS[status],
            statusColor: MEMBER_STATUS_COLORS[status],
            lastSeenLabel: formatMemberLastSeen(member.lastSeenAt),
            createdLabel: `Creado el ${formatCaracasDateSlash(member.createdAt)}`,
          }}
          isActive={isActive}
          onActiveChange={(nuevoEstado) => (nuevoEstado ? reactivar() : setShowDeactivate(true))}
          formError={formError}
          onSubmit={guardar}
          onCancel={() => router.push(RUTA_ADMINISTRACION)}
          isSubmitting={updateMember.isPending && !isTogglingActive}
          submitLabel="Guardar cambios"
          onDeactivateClick={() => (isActive ? setShowDeactivate(true) : reactivar())}
          deactivateLabel={isActive ? "Desactivar usuario" : "Reactivar usuario"}
        />
        <MlRoleGuide items={ROLE_GUIDE_ITEMS} />
      </div>

      <OrConfirmModal
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        onConfirm={confirmarDesactivar}
        title={`¿Desactivar a ${name}?`}
        description="Pierde acceso a la plataforma de inmediato. Sus pedidos y facturas se conservan y puedes reactivarlo cuando quieras."
        confirmLabel="Desactivar usuario"
        isDestructive
        isConfirming={isTogglingActive}
      />

      <AtModal isOpen={showSuccess} onOpenChange={(open) => !open && setShowSuccess(false)} placement="center" size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col items-start gap-2 px-6 pb-1 pt-6">
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-surface-sand text-brand">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-xl font-bold leading-7 text-foreground">Usuario editado</span>
          </ModalHeader>
          <ModalBody className="px-6 py-2">
            <p className="text-sm leading-[22px] text-muted">Se han realizado los cambios en este usuario</p>
          </ModalBody>
          <ModalFooter className="px-6 pb-6 pt-4">
            <AtButton size="md" onPress={() => setShowSuccess(false)}>
              Aceptar
            </AtButton>
          </ModalFooter>
        </ModalContent>
      </AtModal>
    </div>
  );
}
