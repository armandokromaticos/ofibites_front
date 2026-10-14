"use client";

import { OrAdminSidebar } from "@/app/lib/atomic/organisms";

import { TmAdminLayoutProps } from "./tm-admin-layout.types";

export function TmAdminLayout({ children }: TmAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <OrAdminSidebar />
      <main className="ml-64 p-6">{children}</main>
    </div>
  );
}
