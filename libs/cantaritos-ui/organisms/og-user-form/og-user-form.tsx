"use client";

import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import { Info } from "lucide-react";

import { AtInput } from "@/libs/cantaritos-ui/atoms";
import { MlForm } from "@/libs/cantaritos-ui/molecules";
import { UserRole } from "@/domain/types";

import { OgUserFormProps } from "./og-user-form.types";

const ROLE_OPTIONS: { key: UserRole; label: string }[] = [
  { key: "USER", label: "Usuario" },
  { key: "ADMIN", label: "Administrador" },
  { key: "STAND_OPERATOR", label: "Operador de Stand" },
  { key: "CATALOG_MANAGER", label: "Gestor de Catálogo" },
];

export function OgUserForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  isEditing = false,
}: OgUserFormProps) {
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
              ...(isEditing ? { role: (formData.get("role") ?? "USER").toString() as UserRole } : {}),
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
                defaultSelectedKeys={defaultValues?.role ? [defaultValues.role] : ["USER"]}
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
