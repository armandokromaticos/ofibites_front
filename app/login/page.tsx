"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AtButton, AtInput, MlForm } from "@/libs/cantaritos-ui";
import { useLogin } from "@/domain/hooks/auth";


export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Iniciar Sesión</h1>

        <MlForm onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = (formData.get("email") ?? "").toString().trim();
          const password = (formData.get("password") ?? "").toString();
          if (!email || !password) return;
          login(
            { email, password },
            { onSuccess: () => router.push("/") },
          );
        }}>
          <AtInput
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="tu@email.com"
            isRequired
          />

          <AtInput
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            isRequired
          />

          {error && (
            <p className="text-sm text-red-500">
              {error.message || "Error al iniciar sesión"}
            </p>
          )}

          <AtButton className="mt-4" type="submit" fullWidth isLoading={isPending}>
            Entrar
          </AtButton>
        </MlForm>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary-500 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
