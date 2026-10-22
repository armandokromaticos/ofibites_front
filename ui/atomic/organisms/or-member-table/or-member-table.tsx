"use client";

import Link from "next/link";

import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
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

import { AtAvatar, AtChip } from "@/ui/atomic/atoms";

import { OrMemberTableProps, OrMemberTableRow } from "./or-member-table.types";

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
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button
          type="button"
          aria-label={`Más acciones para ${row.name}`}
          disabled={isBusy}
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-foreground",
            "transition-colors duration-(--duration-fast) hover:bg-background",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            isBusy && "opacity-50",
          )}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Acciones para ${row.name}`}
        disabledKeys={isBusy ? ["editar", "reenviar", "restablecer", "estado"] : []}
        onAction={(key) => {
          if (key === "reenviar") onResendInvite(row);
          else if (key === "restablecer") onResetPassword(row);
          else if (key === "estado") onToggleActive(row);
        }}
      >
        <DropdownItem key="editar" as={Link} href={row.editHref} textValue="Editar usuario">
          Editar usuario
        </DropdownItem>
        {row.canResendInvite ? (
          <DropdownItem key="reenviar" textValue="Reenviar invitación">
            Reenviar invitación
          </DropdownItem>
        ) : null}
        {row.canResetPassword ? (
          <DropdownItem key="restablecer" textValue="Restablecer contraseña">
            Restablecer contraseña
          </DropdownItem>
        ) : null}
        <DropdownItem
          key="estado"
          textValue={row.isActive ? "Desactivar usuario" : "Reactivar usuario"}
          className={row.isActive ? "text-danger" : undefined}
          color={row.isActive ? "danger" : "default"}
        >
          {row.isActive ? "Desactivar usuario" : "Reactivar usuario"}
        </DropdownItem>
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
                <span className="font-semibold text-foreground">{row.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted">{row.email ?? "—"}</TableCell>
            <TableCell>{row.roleLabel}</TableCell>
            <TableCell>{row.departmentLabel}</TableCell>
            <TableCell>
              <AtChip size="sm" variant="flat" color={row.statusColor}>
                {row.statusLabel}
              </AtChip>
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
