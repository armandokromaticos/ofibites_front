"use client";

import { usePathname } from "next/navigation";

import { LogOut, Package, ShoppingBag, Users } from "lucide-react";

import { AtButton } from "@/libs/cantaritos-ui/atoms";
import { MlSidebarItem } from "@/libs/cantaritos-ui/molecules";
import { useLogout } from "@/domain/hooks/auth";
import { useAuthStore } from "@/domain/stores";

const NAV_ITEMS = [
  {
    href: "/admin/products",
    label: "Productos",
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: <Users className="h-5 w-5" />,
  },
];

export function OgAdminSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo / Title */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <ShoppingBag className="h-7 w-7 text-primary" />
        <span className="text-lg font-bold">Cantaritos Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <MlSidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-gray-200 px-4 py-4">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <AtButton
          variant="light"
          size="sm"
          fullWidth
          startContent={<LogOut className="h-4 w-4" />}
          onPress={() => logout()}
          isLoading={isLoggingOut}
        >
          Cerrar sesión
        </AtButton>
      </div>
    </aside>
  );
}
