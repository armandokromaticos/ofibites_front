"use client";

import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import { Info } from "lucide-react";

import { USER_ROLE_LABELS } from "@/domain/models/auth.model";
import { UserRole } from "@/domain/types";
import { AtInput } from "@/app/lib/atomic/atoms";
import { MlForm } from "@/app/lib/atomic/molecules";

import { OrUserFormProps } from "./or-user-form.types";

// Sin FINANCE_ADMIN ni KAM: el `@IsEnum(Role)` del back aún no los incluye y responde 400 (T-14).
// Cuando el enum TS del back los tenga, se añaden aquí.
const EDITABLE_ROLES: UserRole[] = ["SUPER_ADMIN", "OPS_ADMIN", "OPERATOR", "CLIENT"];

const ROLE_OPTIONS = EDITABLE_ROLES.map((key) => ({ key, label: USER_ROLE_LABELS[key] }));

export function OrUserForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  isEditing = false,
}: OrUserFormProps) {
  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Información del Usuario</h2>
        </div>

        <MlForm
          id="user-form"
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            const formData = new FormData(formEvent.currentTarget);
            const password = (formData.get("password") ?? "").toString();
            onSubmit({
              name: (formData.get("name") ?? "").toString().trim(),
              email: (formData.get("email") ?? "").toString().trim(),
              ...((!isEditing && password) ? { password } : {}),
              phone: (formData.get("phone") ?? "").toString().trim(),
              ...(isEditing ? { role: (formData.get("role") ?? "CLIENT").toString() as UserRole } : {}),
            });
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AtInput
              label="Nombre"
              name="name"
              placeholder="Ej: Juan Pérez"
              defaultValue={defaultValues?.name}
              isRequired
              isDisabled={isLoading}
            />
            <AtInput
              label="Email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              defaultValue={defaultValues?.email}
              isRequired
              isDisabled={isLoading}
            />
          </div>

          {!isEditing && (
            <AtInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              isRequired
              isDisabled={isLoading}
            />
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AtInput
              label="Teléfono"
              name="phone"
              type="tel"
              placeholder="Ej: +52 123 456 7890"
              defaultValue={defaultValues?.phone}
              isDisabled={isLoading}
            />
            {isEditing && (
              <Select
                label="Rol"
                name="role"
                placeholder="Selecciona un rol"
                defaultSelectedKeys={defaultValues?.role ? [defaultValues.role] : ["CLIENT"]}
                isDisabled={isLoading}
              >
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            )}
          </div>
        </MlForm>
      </CardBody>
    </Card>
  );
}
