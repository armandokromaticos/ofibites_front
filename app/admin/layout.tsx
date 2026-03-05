"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { TpAdminLayout } from "@/libs/cantaritos-ui";
import { useAuthStore } from "@/domain/stores";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  return <TpAdminLayout>{children}</TpAdminLayout>;
}
