"use client";

import Link from "next/link";

import { AtButton } from "@/libs/cantaritos-ui";
import { useAuthStore } from "@/domain/stores";

export default function Home() {
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

          {user?.role === "ADMIN" && (
            <AtButton as={Link} href="/admin" variant="bordered">
              Panel de administración
            </AtButton>
          )}
        </div>
      </div>
    </main>
  );
}
