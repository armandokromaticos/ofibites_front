"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/domain/stores";
import { TmAdminLayout } from "@/app/lib/atomic";

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

  return <TmAdminLayout>{children}</TmAdminLayout>;
}
