"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PartyPopper } from "lucide-react";

import { useBranches } from "@/domain/hooks/branches";
import { useInviteCompanyMember } from "@/domain/hooks/company-members";
import { useDepartments } from "@/domain/hooks/departments";
import { COMPANY_ROLE_DESCRIPTIONS, COMPANY_ROLE_LABELS, COMPANY_ROLE_OPTIONS } from "@/domain/models";
import { CompanyRole } from "@/domain/types";
import { AtButton } from "@/ui/atomic/atoms";
import { MlRoleGuide } from "@/ui/atomic/molecules";
import { OrMemberForm, OrMemberFormErrors, OrMemberFormField, OrMemberFormValues } from "@/ui/atomic/organisms";

import { RUTA_ADMINISTRACION } from "../../../_navegacion";
import { mensajeErrorMiembro } from "../../_data/errores-administracion";

const VALORES_INICIALES: OrMemberFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  departmentId: "",
  branchId: "",
  role: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(valores: OrMemberFormValues): OrMemberFormErrors {
  const errores: OrMemberFormErrors = {};
  if (!valores.firstName.trim()) errores.firstName = "Escribe el nombre.";
  if (!valores.lastName.trim()) errores.lastName = "Escribe el apellido.";
  if (!valores.email.trim()) errores.email = "Escribe el correo.";
  else if (!EMAIL_RE.test(valores.email.trim())) errores.email = "Escribe un correo válido.";
  if (!valores.role) errores.role = "Selecciona un rol.";
  return errores;
}

interface UsuarioCreado {
  name: string;
  email: string;
  roleLabel: string;
  departmentLabel: string;
  branchLabel: string;
}

const ROLE_GUIDE_ITEMS = COMPANY_ROLE_OPTIONS.map((role) => ({
  label: COMPANY_ROLE_LABELS[role],
  description: COMPANY_ROLE_DESCRIPTIONS[role],
}));

/**
 * "Añadir usuario" (Figma `3463:2225`) → "Usuario creado" (Figma `3463:2279`) en la misma pantalla.
 * `POST /companies/:companyId/members/invite`: crea el `User` y envía la invitación por Supabase.
 */
export function NuevoUsuario() {
  const router = useRouter();
  const invite = useInviteCompanyMember();
  const departmentsQuery = useDepartments();
  const branchesQuery = useBranches();

  const [valores, setValores] = useState<OrMemberFormValues>(VALORES_INICIALES);
  const [errores, setErrores] = useState<OrMemberFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [creado, setCreado] = useState<UsuarioCreado | null>(null);

  const departmentOptions = departmentsQuery.data ?? [];
  const branchOptions = branchesQuery.data ?? [];
  const roleOptions = COMPANY_ROLE_OPTIONS.map((role) => ({
    value: role,
    label: COMPANY_ROLE_LABELS[role],
  }));

  const cambiar = <F extends OrMemberFormField>(field: F, value: OrMemberFormValues[F]) => {
    setValores((actual) => ({ ...actual, [field]: value }));
    if (errores[field]) setErrores((actual) => ({ ...actual, [field]: undefined }));
  };

  const reiniciar = () => {
    setValores(VALORES_INICIALES);
    setErrores({});
    setFormError(null);
    setCreado(null);
  };

  const enviar = () => {
    if (invite.isPending) return;
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setFormError(null);
    const name = `${valores.firstName.trim()} ${valores.lastName.trim()}`.trim();
    const email = valores.email.trim();
    const role = valores.role as CompanyRole;

    invite
      .mutateAsync({
        name,
        email,
        role,
        ...(valores.phone.trim() && { phone: valores.phone.trim() }),
        ...(valores.position.trim() && { position: valores.position.trim() }),
        ...(valores.departmentId && { departmentId: valores.departmentId }),
        ...(valores.branchId && { branchId: valores.branchId }),
      })
      .then(() => {
        setCreado({
          name,
          email,
          roleLabel: COMPANY_ROLE_LABELS[role],
          departmentLabel: departmentOptions.find((d) => d.id === valores.departmentId)?.name ?? "—",
          branchLabel: branchOptions.find((b) => b.id === valores.branchId)?.name ?? "—",
        });
      })
      .catch((error: unknown) => setFormError(mensajeErrorMiembro(error, "No pudimos crear el usuario. Inténtalo de nuevo.")));
  };

  if (creado) {
    return (
      <div className="mx-auto w-full max-w-[600px]">
        <div className="flex flex-col items-center gap-6 rounded-card bg-content1 p-10 text-center">
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-surface-sand text-brand">
            <PartyPopper className="size-7" />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
              Usuario creado
            </h1>
            <p className="text-sm leading-[22px] text-muted">
              El usuario con el correo{" "}
              <span className="font-semibold text-accent">{creado.email}</span> ya puede acceder a Ofibites
            </p>
          </div>

          <dl className="flex w-full flex-col gap-2 rounded-control bg-background px-5 py-4 text-left text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Nombre</dt>
              <dd className="font-semibold text-foreground">{creado.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Rol</dt>
              <dd className="font-semibold text-foreground">{creado.roleLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Departamento</dt>
              <dd className="font-semibold text-foreground">{creado.departmentLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Sede</dt>
              <dd className="font-semibold text-foreground">{creado.branchLabel}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap justify-center gap-3">
            <AtButton as={Link} href={RUTA_ADMINISTRACION} size="md">
              Volver a usuarios
            </AtButton>
            <AtButton size="md" variant="bordered" color="default" onPress={reiniciar}>
              Añadir otro usuario
            </AtButton>
          </div>

          <p className="text-xs leading-[18px] text-muted">
            Si no la recibe, puedes reenviar la invitación desde la lista de usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
            Añadir usuario
          </h1>
          <p className="max-w-[52ch] text-sm leading-[22px] text-muted">
            La persona recibe un correo y entra con sus propias credenciales.
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
          mode="create"
          values={valores}
          errors={errores}
          onChange={cambiar}
          departmentOptions={departmentOptions}
          branchOptions={branchOptions}
          roleOptions={roleOptions}
          isLoadingDepartments={departmentsQuery.isPending}
          isLoadingBranches={branchesQuery.isPending}
          formError={formError}
          onSubmit={enviar}
          onCancel={() => router.push(RUTA_ADMINISTRACION)}
          isSubmitting={invite.isPending}
          submitLabel="Crear usuario"
        />
        <MlRoleGuide items={ROLE_GUIDE_ITEMS} />
      </div>
    </div>
  );
}
