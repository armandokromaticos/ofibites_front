"use client";

import Link from "next/link";

import { MlSidebarItemProps } from "./ml-sidebar-item.types";

export function MlSidebarItem({
  href,
  icon,
  label,
  isActive = false,
}: MlSidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
