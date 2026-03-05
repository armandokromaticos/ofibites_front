"use client";

import { OgAdminSidebar } from "@/libs/cantaritos-ui/organisms";

import { TpAdminLayoutProps } from "./tp-admin-layout.types";

export function TpAdminLayout({ children }: TpAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <OgAdminSidebar />
      <main className="ml-64 p-6">{children}</main>
    </div>
  );
}
