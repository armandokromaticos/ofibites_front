import { ReactNode } from "react";

import { BookOpen, ClipboardList, FileText, LayoutGrid, ShoppingCart, Utensils } from "lucide-react";

import { OrAppSidebarItem } from "@/app/lib/atomic";

// Navegación del cliente, compartida por /dashboard, /ordenar y su layout (`(cliente)/layout.tsx`).
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

// Rutas que la app ya enlaza fuera del menú (top bar). Aún no existen.
export const RUTA_CARRITO = "/carrito";

/** Página del grupo `(cliente)`: título (e icono) de la top bar y, si está en el menú, su ítem activo. */
export interface PaginaCliente {
  href: string;
  label: string;
  icon?: ReactNode;
  /** `key` del ítem del sidebar que se marca como activo. Sin valor, ninguno. */
  navKey?: string;
}

/**
 * Páginas del cliente para el layout compartido. **Toda página nueva del grupo `(cliente)` debe entrar aquí**:
 * si no, la top bar muestra "Ofibites" y ningún ítem activo. Una ruta hija (`/pedidos/<id>`) cuenta como la de
 * su `href` salvo que tenga entrada propia (gana la más larga).
 */
export const PAGINAS_CLIENTE: PaginaCliente[] = [
  ...NAV_ITEMS_CLIENTE.map(({ href, label, icon, key }) => ({ href, label, icon, navKey: key })),
  // Provisional: título de la sección "Pedidos realizados" del Figma, hasta que exista la pantalla.
  { href: RUTA_PEDIDOS, label: "Pedidos realizados", icon: <ClipboardList /> },
  { href: RUTA_CARRITO, label: "Carrito", icon: <ShoppingCart /> },
];

const TITULO_POR_DEFECTO = "Ofibites";

/** Página del cliente en la que se está (por `pathname`), con respaldo para una ruta no listada. */
export function paginaClienteActual(pathname: string): PaginaCliente {
  const pagina = PAGINAS_CLIENTE.filter(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return pagina ?? { href: pathname, label: TITULO_POR_DEFECTO };
}

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

/** "Repetir" de las últimas órdenes: Ordenar con el pedido a repetir (`?repetir=<orderId>`). */
export function rutaOrdenarRepetir(orderId: string): string {
  return `${RUTA_ORDENAR}?repetir=${encodeURIComponent(orderId)}`;
}

/** id de pedido de `?repetir=`: letras, números y guiones (números de ejemplo o UUID). Otro valor se ignora. */
export function parseRepetirOrdenar(value: unknown): string | undefined {
  return typeof value === "string" && /^[A-Za-z0-9-]{1,64}$/.test(value) ? value : undefined;
}
