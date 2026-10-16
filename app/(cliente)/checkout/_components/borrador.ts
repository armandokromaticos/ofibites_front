"use client";

import { useAuthStore } from "@/domain/stores";

/** Clave del borrador del checkout: un borrador de otro usuario o de otra empresa no se reutiliza. */
export function usePropietarioBorrador(): string {
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const companyId = useAuthStore((state) => state.activeCompanyId ?? "");
  return `${userId}:${companyId}`;
}
