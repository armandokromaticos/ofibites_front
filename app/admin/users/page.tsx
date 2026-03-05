"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle, Plus, Shield, Users, XCircle } from "lucide-react";

import { AtButton, MlSearchBar, MlStatCard, OgUserTable } from "@/libs/cantaritos-ui";
import { useDeleteUser, useUsers } from "@/domain/hooks/users";
import { UserDetail } from "@/domain/types";

export default function UsersPage() {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState("");

  const handleDelete = (user: UserDetail) => {
    const confirmed = window.confirm(
      `¿Eliminar al usuario "${user.name}"? Esta acción no es reversible.`,
    );
    if (confirmed) {
      deleteUser.mutate(user.id);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (user: UserDetail) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user: UserDetail) => user.isActive).length;
    const admins = users.filter((user: UserDetail) => user.role === "ADMIN").length;
    const inactive = users.filter((user: UserDetail) => !user.isActive).length;
    return { total, active, admins, inactive };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <AtButton
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => router.push("/admin/users/new")}
        >
          Crear Usuario
        </AtButton>
      </div>

      {/* Search */}
      <MlSearchBar
        placeholder="Buscar por nombre o email..."
        value={search}
        onValueChange={setSearch}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MlStatCard
          title="Total"
          value={stats.total}
          icon={<Users className="h-6 w-6" />}
        />
        <MlStatCard
          title="Activos"
          value={stats.active}
          subtitle={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total`}
          subtitleColor="success"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <MlStatCard
          title="Administradores"
          value={stats.admins}
          subtitle="Rol ADMIN"
          subtitleColor="warning"
          icon={<Shield className="h-6 w-6" />}
        />
        <MlStatCard
          title="Inactivos"
          value={stats.inactive}
          subtitle="Cuentas desactivadas"
          subtitleColor="danger"
          icon={<XCircle className="h-6 w-6" />}
        />
      </div>

      {/* Table */}
      <OgUserTable
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={(user) => router.push(`/admin/users/${user.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
