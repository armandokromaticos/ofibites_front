"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";

import { CloudOff, Plus, UserRoundX, UsersRound } from "lucide-react";

import {
  useCompanyMembers,
  useResendMemberInvite,
  useResetMemberPassword,
  useUpdateCompanyMember,
} from "@/domain/hooks/company-members";
import { useDepartments } from "@/domain/hooks/departments";
import { MEMBER_STATUS_FILTERS, MEMBER_STATUS_LABELS } from "@/domain/models";
import {
  AtButton,
  AtSkeleton,
  MlEmptyState,
  MlPagination,
  OrConfirmModal,
  OrMemberFiltersBar,
  OrMemberTable,
  OrMemberTableRow,
} from "@/ui/atomic";

import { RUTA_ADMINISTRACION_NUEVO } from "../../_navegacion";
import { mensajeErrorMiembro } from "../_data/errores-administracion";

import { construirFilaMiembro, FilaMiembro, filtrarMiembros, ordenarMiembros } from "./filtrar-miembros";
import { useFiltrosAdministracion } from "./use-filtros-administracion";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "conexion", label: "Última conexión" },
];

function Esqueleto() {
  return (
    <div className="flex flex-col gap-5">
      <AtSkeleton className="h-[57px] rounded-full" />
      <div className="flex flex-wrap gap-3">
        {[160, 160].map((width, index) => (
          <AtSkeleton key={index} className="h-10 rounded-full" style={{ width }} />
        ))}
      </div>
      <AtSkeleton className="h-[360px] rounded-card" />
    </div>
  );
}

interface Aviso {
  tone: "success" | "error";
  message: string;
}

function AvisoAccion({ aviso, onDismiss }: { aviso: Aviso; onDismiss: () => void }) {
  return (
    <div
      role={aviso.tone === "error" ? "alert" : "status"}
      className={
        "flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-[13px] font-semibold leading-[18px] " +
        (aviso.tone === "error" ? "border-accent bg-content1 text-primary" : "border-success-200 bg-success-50 text-success-700")
      }
    >
      <span>{aviso.message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 text-xs font-semibold underline underline-offset-2">
        Cerrar
      </button>
    </div>
  );
}

/**
 * "Administración de usuarios" (Figma `3463:2171`): buscador, filtros (estado, orden), tabla con el menú
 * "···" (editar, reenviar invitación / restablecer contraseña, desactivar / reactivar) y paginación en
 * cliente. Ruta ya protegida por `administracion/layout.tsx` (`useRequireCompanyAdmin`).
 */
export function AdministracionCliente() {
  const { filtros, actualizar } = useFiltrosAdministracion();
  const membersQuery = useCompanyMembers();
  const departmentsQuery = useDepartments();
  const updateMember = useUpdateCompanyMember();
  const resendInvite = useResendMemberInvite();
  const resetPassword = useResetMemberPassword();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [memberToDeactivate, setMemberToDeactivate] = useState<FilaMiembro | null>(null);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data]);

  const filas = useMemo(
    () => members.map((member) => construirFilaMiembro(member, departments)),
    [members, departments],
  );
  const filasOrdenadas = useMemo(() => ordenarMiembros(filas, filtros.orden), [filas, filtros.orden]);
  const filasFiltradas = useMemo(
    () => filtrarMiembros(filasOrdenadas, filtros),
    [filasOrdenadas, filtros],
  );

  const totalPages = Math.max(1, Math.ceil(filasFiltradas.length / PAGE_SIZE));
  const pagina = Math.min(filtros.pagina, totalPages);
  const filasPagina = filasFiltradas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Todos" },
      ...MEMBER_STATUS_FILTERS.map((estado) => ({ value: estado, label: MEMBER_STATUS_LABELS[estado] })),
    ],
    [],
  );

  const hayFiltrosActivos = Boolean(filtros.estado || filtros.q);
  const limpiarFiltros = () => actualizar({ estado: undefined, q: "", pagina: 1 });

  const handleResendInvite = (row: OrMemberTableRow) => {
    setBusyId(row.id);
    setAviso(null);
    resendInvite.mutate(row.id, {
      onSuccess: (res) => setAviso({ tone: "success", message: res.message }),
      onError: (error) => setAviso({ tone: "error", message: mensajeErrorMiembro(error, "No pudimos reenviar la invitación.") }),
      onSettled: () => setBusyId(null),
    });
  };

  const handleResetPassword = (row: OrMemberTableRow) => {
    setBusyId(row.id);
    setAviso(null);
    resetPassword.mutate(row.id, {
      onSuccess: (res) => setAviso({ tone: "success", message: res.message }),
      onError: (error) => setAviso({ tone: "error", message: mensajeErrorMiembro(error, "No pudimos restablecer la contraseña.") }),
      onSettled: () => setBusyId(null),
    });
  };

  const handleToggleActive = (row: OrMemberTableRow) => {
    if (row.isActive) {
      setMemberToDeactivate(filasFiltradas.find((fila) => fila.id === row.id) ?? null);
      return;
    }
    setBusyId(row.id);
    setAviso(null);
    updateMember.mutate(
      { id: row.id, body: { isActive: true } },
      {
        onSuccess: () => setAviso({ tone: "success", message: `${row.name} fue reactivado.` }),
        onError: (error) => setAviso({ tone: "error", message: mensajeErrorMiembro(error, "No pudimos reactivar al usuario.") }),
        onSettled: () => setBusyId(null),
      },
    );
  };

  const confirmarDesactivar = () => {
    if (!memberToDeactivate) return;
    const { id, name } = memberToDeactivate;
    setBusyId(id);
    updateMember.mutate(
      { id, body: { isActive: false } },
      {
        onSuccess: () => {
          setAviso({ tone: "success", message: `${name} fue desactivado.` });
          setMemberToDeactivate(null);
        },
        onError: (error) => setAviso({ tone: "error", message: mensajeErrorMiembro(error, "No pudimos desactivar al usuario.") }),
        onSettled: () => setBusyId(null),
      },
    );
  };

  let content: ReactNode;

  if (membersQuery.isPending) {
    content = <Esqueleto />;
  } else if (membersQuery.isError) {
    content = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          tone="error"
          headingLevel={2}
          icon={<CloudOff />}
          title="No pudimos cargar los usuarios"
          description="Puede ser un problema de conexión. Inténtalo de nuevo en unos segundos."
          actionLabel="Reintentar"
          onAction={() => membersQuery.refetch()}
          isActionLoading={membersQuery.isFetching}
        />
      </div>
    );
  } else if (members.length === 0) {
    content = (
      <div className="rounded-card bg-content1">
        <MlEmptyState
          headingLevel={2}
          icon={<UsersRound />}
          title="Todavía no has añadido a nadie"
          description="Invita a tu equipo para que puedan pedir, aprobar o pagar en nombre de la empresa."
          actionLabel="Añadir usuario"
          actionHref={RUTA_ADMINISTRACION_NUEVO}
        />
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-5 rounded-card bg-content1 p-6">
        <OrMemberFiltersBar
          search={filtros.q}
          onSearchChange={(q) => actualizar({ q, pagina: 1 })}
          statusOptions={statusOptions}
          statusValue={filtros.estado ?? "all"}
          onStatusChange={(value) => actualizar({ estado: value === "all" ? undefined : (value as FilaMiembro["status"]), pagina: 1 })}
          sortOptions={SORT_OPTIONS}
          sortValue={filtros.orden}
          onSortChange={(value) => actualizar({ orden: value as typeof filtros.orden })}
        />

        {filasFiltradas.length === 0 ? (
          <MlEmptyState
            headingLevel={3}
            size="sm"
            icon={<UserRoundX />}
            title="No encontramos usuarios con esos filtros"
            description="Prueba con otro texto o quita alguno de los filtros que tienes activos."
            actionLabel={hayFiltrosActivos ? "Limpiar filtros" : undefined}
            onAction={hayFiltrosActivos ? limpiarFiltros : undefined}
          />
        ) : (
          <>
            <OrMemberTable
              rows={filasPagina}
              onResendInvite={handleResendInvite}
              onResetPassword={handleResetPassword}
              onToggleActive={handleToggleActive}
              busyMemberId={busyId}
            />
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted">
                Mostrando {filasPagina.length} de {filasFiltradas.length} usuarios
              </p>
              <MlPagination page={pagina} totalPages={totalPages} onChange={(p) => actualizar({ pagina: p })} label="Páginas de usuarios" />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-card bg-content1 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] font-bold leading-9 tracking-[-0.04em] text-foreground">
            Administración de usuarios
          </h1>
          <p className="max-w-[52ch] text-sm leading-[22px] text-muted">
            Define quién puede pedir, aprobar y pagar en nombre de tu empresa.
          </p>
        </div>
        <AtButton as={Link} href={RUTA_ADMINISTRACION_NUEVO} size="md" startContent={<Plus aria-hidden="true" className="size-4" />}>
          Añadir usuario
        </AtButton>
      </div>

      {aviso && <AvisoAccion aviso={aviso} onDismiss={() => setAviso(null)} />}

      {content}

      <OrConfirmModal
        isOpen={Boolean(memberToDeactivate)}
        onClose={() => setMemberToDeactivate(null)}
        onConfirm={confirmarDesactivar}
        title={memberToDeactivate ? `¿Desactivar a ${memberToDeactivate.name}?` : ""}
        description="Pierde acceso a la plataforma de inmediato. Sus pedidos y facturas se conservan y puedes reactivarlo cuando quieras."
        confirmLabel="Desactivar usuario"
        isDestructive
        isConfirming={Boolean(memberToDeactivate) && busyId === memberToDeactivate?.id}
      />
    </div>
  );
}
