"use client";

import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";

import { USER_ROLE_LABELS } from "@/domain/models/auth.model";
import { UserDetail, UserRole } from "@/domain/types";
import { AtButton, AtChip } from "@/ui/atomic/atoms";

import { OrUserTableProps } from "./or-user-table.types";

const ROLE_COLOR: Record<UserRole, "primary" | "success" | "warning" | "secondary"> = {
  SUPER_ADMIN: "primary",
  OPS_ADMIN: "primary",
  FINANCE_ADMIN: "warning",
  KAM: "warning",
  OPERATOR: "success",
  CLIENT: "secondary",
};

export function OrUserTable({
  users,
  onEdit,
  onDelete,
  isLoading = false,
}: OrUserTableProps) {
  return (
    <Table aria-label="Tabla de usuarios" shadow="sm">
      <TableHeader>
        <TableColumn>Usuario</TableColumn>
        <TableColumn>Rol</TableColumn>
        <TableColumn>Estado</TableColumn>
        <TableColumn width={120}>Acciones</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={<Spinner label="Cargando usuarios..." />}
        emptyContent="No se encontraron usuarios."
      >
        {users.map((user: UserDetail) => (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <span className="font-medium">{user.name}</span>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <AtChip size="sm" variant="flat" color={ROLE_COLOR[user.role]}>
                {USER_ROLE_LABELS[user.role]}
              </AtChip>
            </TableCell>
            <TableCell>
              <AtChip
                size="sm"
                variant="flat"
                color={user.isActive ? "success" : "default"}
              >
                {user.isActive ? "Activo" : "Inactivo"}
              </AtChip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <AtButton
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => onEdit(user)}
                  aria-label="Editar usuario"
                >
                  <Pencil className="h-4 w-4" />
                </AtButton>
                {onDelete && (
                  <AtButton
                    isIconOnly
                    variant="light"
                    size="sm"
                    color="danger"
                    onPress={() => onDelete(user)}
                    aria-label="Eliminar usuario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AtButton>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
