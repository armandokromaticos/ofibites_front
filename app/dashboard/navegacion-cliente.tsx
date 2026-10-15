import { BookOpen, FileText, LayoutGrid, Utensils } from "lucide-react";

import { OrAppSidebarItem } from "@/app/lib/atomic";

// Navegación del cliente, compartida por /dashboard y /ordenar.
export const RUTA_DASHBOARD = "/dashboard";
export const RUTA_ORDENAR = "/ordenar";
// Rutas que aún no existen (Pedidos...): los enlaces ya apuntan a su sitio.
export const RUTA_PEDIDOS = "/pedidos";
// TODO: conectar API (T-04). El Figma no fija la ruta de "Data y consumo": provisional.
export const RUTA_CONSUMO = "/consumo";

export const NAV_ITEMS_CLIENTE: OrAppSidebarItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Panel de control", href: RUTA_DASHBOARD, icon: <LayoutGrid /> },
  { key: "ordenar", label: "Ordenar", description: "Pide comida a la oficina", href: RUTA_ORDENAR, icon: <Utensils /> },
  { key: "consumo", label: "Data y consumo", description: "Reportes y consumo", href: RUTA_CONSUMO, icon: <FileText /> },
  {
    key: "administracion",
    label: "Administración",
    description: "Control de usuarios",
    href: "/administracion",
    icon: <BookOpen />,
  },
];

/** Categorías con las que el dashboard enlaza a Ordenar (`?categoria=<slug>`), con su nombre en una frase. */
export const CATEGORIAS_ORDENAR = {
  bebidas: "bebidas",
  desayunos: "desayunos",
} as const;

export type CategoriaOrdenar = keyof typeof CATEGORIAS_ORDENAR;

/** Un valor desconocido de `?categoria=` se ignora. */
export function parseCategoriaOrdenar(value: unknown): CategoriaOrdenar | undefined {
  return typeof value === "string" && value in CATEGORIAS_ORDENAR ? (value as CategoriaOrdenar) : undefined;
}

export function rutaOrdenarCategoria(categoria: CategoriaOrdenar): string {
  return `${RUTA_ORDENAR}?categoria=${categoria}`;
}
