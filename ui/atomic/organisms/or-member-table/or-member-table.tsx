"use client";

import Link from "next/link";

import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { MoreHorizontal } from "lucide-react";

import { AtAvatar, AtStatusChip } from "@/ui/atomic/atoms";

import { OrMemberTableProps, OrMemberTableRow } from "./or-member-table.types";

const NO_PUEDES_DESACTIVARTE = "No puedes desactivar tu propia cuenta.";

const vineta = <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary/45" />;

// Dentro de una DropdownSection, el `classNames` de un ítem reemplaza a `itemClasses` (no se fusionan).
const CLASES_ITEM = {
  base: "min-h-[38px] gap-2.5 rounded-lg px-3 py-[11px]",
  title: "text-[13px] font-semibold text-foreground",
};

function RowMenu({
  row,
  isBusy,
  onResendInvite,
  onResetPassword,
  onToggleActive,
}: {
  row: OrMemberTableRow;
  isBusy: boolean;
  onResendInvite: (row: OrMemberTableRow) => void;
  onResetPassword: (row: OrMemberTableRow) => void;
  onToggleActive: (row: OrMemberTableRow) => void;
}) {
  // Uno mismo no puede desactivarse: la opción sigue visible pero deshabilitada, con el motivo debajo.
  const noPuedeDesactivarse = Boolean(row.isSelf) && row.isActive;
  const esDestructiva = row.isActive && !noPuedeDesactivarse;

  return (
    <Dropdown
      placement="bottom-end"
      classNames={{
        content:
          "w-[232px] rounded-xl border border-surface-sand bg-white p-1.5 shadow-[0_8px_24px_rgb(54_56_28/0.16)]",
      }}
    >
      <DropdownTrigger>
        <button
          type="button"
          aria-label={`Más acciones para ${row.name}`}
          disabled={isBusy}
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-foreground",
            "transition-colors duration-(--duration-fast) hover:bg-background aria-expanded:bg-background",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            isBusy && "opacity-50",
          )}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Acciones para ${row.name}`}
        disabledKeys={isBusy ? ["editar", "reenviar", "restablecer", "estado"] : noPuedeDesactivarse ? ["estado"] : []}
        classNames={{ base: "p-0", list: "gap-0.5" }}
        itemClasses={CLASES_ITEM}
        onAction={(key) => {
          if (key === "reenviar") onResendInvite(row);
          else if (key === "restablecer") onResetPassword(row);
          else if (key === "estado") onToggleActive(row);
        }}
      >
        <DropdownSection
          aria-label="Acciones"
          showDivider
          classNames={{ base: "mb-0", group: "flex flex-col gap-0.5", divider: "my-0.5 bg-surface-sand/80" }}
        >
          <DropdownItem key="editar" as={Link} href={row.editHref} textValue="Editar usuario" startContent={vineta}>
            Editar usuario
          </DropdownItem>
          {row.canResendInvite ? (
            <DropdownItem key="reenviar" textValue="Reenviar invitación" startContent={vineta}>
              Reenviar invitación
            </DropdownItem>
          ) : null}
          {row.canResetPassword ? (
            <DropdownItem key="restablecer" textValue="Restablecer contraseña" startContent={vineta}>
              Restablecer contraseña
            </DropdownItem>
          ) : null}
        </DropdownSection>
        <DropdownSection aria-label="Estado" classNames={{ base: "mb-0" }}>
          <DropdownItem
            key="estado"
            textValue={row.isActive ? "Desactivar usuario" : "Reactivar usuario"}
            className={esDestructiva ? "data-[hover=true]:bg-secondary-50" : undefined}
            classNames={esDestructiva ? { ...CLASES_ITEM, title: cn(CLASES_ITEM.title, "text-secondary-600") } : undefined}
            startContent={
              esDestructiva ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" /> : vineta
            }
            description={noPuedeDesactivarse ? NO_PUEDES_DESACTIVARTE : undefined}
          >
            {row.isActive ? "Desactivar usuario" : "Reactivar usuario"}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}

/**
 * Tabla de "Administración de usuarios" (Figma `3463:2171`): usuario (avatar + nombre), correo, rol,
 * departamento, estado y última conexión, con el menú "···" de acciones por fila.
 */
export function OrMemberTable({
  rows,
  isLoading = false,
  onResendInvite,
  onResetPassword,
  onToggleActive,
  busyMemberId,
  className,
}: OrMemberTableProps) {
  return (
    <Table aria-label="Usuarios de la empresa" shadow="none" radius="lg" className={className}>
      <TableHeader>
        <TableColumn>USUARIO</TableColumn>
        <TableColumn>CORREO</TableColumn>
        <TableColumn>ROL</TableColumn>
        <TableColumn>DEPARTAMENTO</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn>ÚLTIMA CONEXIÓN</TableColumn>
        <TableColumn width={56}> </TableColumn>
      </TableHeader>
      <TableBody isLoading={isLoading} loadingContent={<Spinner label="Cargando usuarios" />} emptyContent="No encontramos usuarios.">
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <AtAvatar name={row.name} size="md" className="size-8 text-xs" />
                <span className="font-semibold text-foreground">
                  {row.name}
                  {row.isSelf ? <span className="ml-1 font-normal text-muted">(tú)</span> : null}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted">{row.email ?? "—"}</TableCell>
            <TableCell>{row.roleLabel}</TableCell>
            <TableCell>{row.departmentLabel}</TableCell>
            <TableCell>
              <AtStatusChip tone={row.statusTone}>{row.statusLabel}</AtStatusChip>
            </TableCell>
            <TableCell className="text-muted">{row.lastSeenLabel}</TableCell>
            <TableCell>
              <RowMenu
                row={row}
                isBusy={busyMemberId === row.id}
                onResendInvite={onResendInvite}
                onResetPassword={onResetPassword}
                onToggleActive={onToggleActive}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
