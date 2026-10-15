"use client";

import { useRequireSession } from "@/domain/hooks/auth";
import { PLATFORM_ROLES } from "@/domain/models/auth.model";
import { TmAdminLayout } from "@/ui/atomic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Roles de plataforma (todos menos CLIENT). Sin sesión → /login; un cliente → /dashboard.
  const status = useRequireSession({ roles: PLATFORM_ROLES });

  if (status !== "allowed") {
    return null;
  }

  return <TmAdminLayout>{children}</TmAdminLayout>;
}
