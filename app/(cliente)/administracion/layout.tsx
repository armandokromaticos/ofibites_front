"use client";

import { ReactNode } from "react";

import { useRequireCompanyAdmin } from "./_components/use-require-company-admin";

/** Guarda de todo `/administracion`: ver `use-require-company-admin.ts`. */
export default function AdministracionLayout({ children }: { children: ReactNode }) {
  const status = useRequireCompanyAdmin();

  if (status !== "allowed") {
    return (
      <div aria-busy="true">
        <span className="sr-only">Comprobando tus permisos…</span>
      </div>
    );
  }

  return <>{children}</>;
}
