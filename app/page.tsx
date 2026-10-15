"use client";

import Link from "next/link";

import { isPlatformRole } from "@/domain/models/auth.model";
import { useAuthHydrated, useAuthStore } from "@/domain/stores";
import { AtButton } from "@/ui/atomic";

export default function Home() {
  const hasHydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-6 text-3xl font-bold">
          Página en construcción
        </h1>

        <div className="flex flex-col items-center gap-3">
          <AtButton as={Link} href="/login">
            Ir a iniciar sesión
          </AtButton>

          {hasHydrated && user && isPlatformRole(user.role) && (
            <AtButton as={Link} href="/admin" variant="bordered">
              Panel de administración
            </AtButton>
          )}
        </div>
      </div>
    </main>
  );
}
