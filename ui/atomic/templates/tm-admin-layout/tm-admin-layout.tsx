"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

import { VIEW_TRANSITION_CLASS, VIEW_TRANSITION_NAME } from "@/shared/motion";
import { OrAdminSidebar } from "@/ui/atomic/organisms";

import { TmAdminLayoutProps } from "./tm-admin-layout.types";

export function TmAdminLayout({ children }: TmAdminLayoutProps) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      <ViewTransition name={VIEW_TRANSITION_NAME.appSidebar} enter={VIEW_TRANSITION_CLASS.page} default="none">
        <OrAdminSidebar />
      </ViewTransition>
      {/* Por ruta: entra y sale como página; filtros y query params no animan. */}
      <ViewTransition
        key={pathname}
        enter={VIEW_TRANSITION_CLASS.page}
        exit={VIEW_TRANSITION_CLASS.page}
        update="none"
        default="none"
      >
        <main className="ml-64 p-6">{children}</main>
      </ViewTransition>
    </div>
  );
}
