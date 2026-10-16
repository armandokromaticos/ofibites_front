import { ReactNode } from "react";

import { BookOpen, ClipboardList, FileText, LayoutGrid, Package, ShoppingCart, Utensils } from "lucide-react";

import { OrAccountMenuItem, OrAppSidebarItem } from "@/ui/atomic";

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

// Rutas que la app enlaza fuera del menú (top bar).
export const RUTA_CARRITO = "/carrito";

/** Checkout: paso 1 "Entrega" (`/checkout`), paso 2 "Revisión" y "Pedido confirmado". */
export const RUTA_CHECKOUT = "/checkout";
export const RUTA_CHECKOUT_REVISION = "/checkout/revision";

/** "Pedido confirmado" de un pedido recién creado en el checkout. */
export function rutaPedidoConfirmado(orderId: string): string {
  return `${RUTA_CHECKOUT}/confirmado/${encodeURIComponent(orderId)}`;
}
/**
 * Menú de cuenta del avatar de la top bar (T-25). Sin `href`, la opción sale deshabilitada con "Pronto": al crear
 * su pantalla, basta con añadir el `href` (y la ruta a `RUTAS_CON_PAGINA` y `PAGINAS_CLIENTE`).
 */
export const MENU_CUENTA_CLIENTE: OrAccountMenuItem[] = [
  { key: "perfil", label: "Mi perfil" },
  { key: "empresa", label: "Datos de la empresa" },
  { key: "pagos", label: "Métodos de pago" },
];

/** Ficha de un producto del catálogo (el "+" de Ordenar). Provisional hasta su tarea. */
export const RUTA_PRODUCTO = "/producto";

/**
 * Rutas del grupo que ya tienen página. Un enlace que llega de la API (p. ej. el `link` de una notificación,
 * `/pedidos/<id>`) solo se sigue si cae aquí: al crear una página nueva del grupo, añádela.
 */
const RUTAS_CON_PAGINA = [RUTA_DASHBOARD, RUTA_ORDENAR, RUTA_PRODUCTO, RUTA_CARRITO, RUTA_CHECKOUT];

/** `true` si `link` (ruta relativa) lleva a una página del cliente que existe. */
export function tienePaginaCliente(link: string): boolean {
  const pathname = link.split(/[?#]/)[0];
  return RUTAS_CON_PAGINA.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

/** Tipo de ítem del catálogo que abre la ficha: el id de un combo no es un id de producto. */
export type TipoFicha = "product" | "combo";

/** Ficha de un ítem del catálogo: `/producto/<id>` o, si es un combo, `/producto/<id>?tipo=combo`. */
export function rutaProducto(id: string, tipo: TipoFicha = "product"): string {
  const ruta = `${RUTA_PRODUCTO}/${encodeURIComponent(id)}`;
  return tipo === "combo" ? `${ruta}?tipo=combo` : ruta;
}

/** `?tipo=` de la ficha: `combo` o, por defecto, producto. */
export function parseTipoFicha(value: unknown): TipoFicha {
  return value === "combo" ? "combo" : "product";
}

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
  // Figma 3462:2094: título "Checkout" con el icono de Ordenar, que sigue activo en el sidebar.
  { href: RUTA_CHECKOUT, label: "Checkout", icon: <Utensils />, navKey: "ordenar" },
  // Se llega desde Ordenar: su ítem sigue activo.
  { href: RUTA_PRODUCTO, label: "Detalle del producto", icon: <Package />, navKey: "ordenar" },
];

const TITULO_POR_DEFECTO = "Ofibites";

/** Página del cliente en la que se está (por `pathname`), con respaldo para una ruta no listada. */
export function paginaClienteActual(pathname: string): PaginaCliente {
  const pagina = PAGINAS_CLIENTE.filter(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return pagina ?? { href: pathname, label: TITULO_POR_DEFECTO };
}

/**
 * Mapeo de las categorías del dashboard (id de la card "Explorar") al slug de la `Section` del catálogo
 * (`GET /catalog`, T-19), que es lo que Ordenar lee en `?categoria=<slug>`. Hoy coinciden; si el back usa
 * otros slugs (p. ej. `desayuno`), solo se cambia el valor aquí. Un slug que el catálogo no tenga (404) hace
 * que Ordenar muestre "Todos" con un aviso.
 */
export const CATEGORIAS_ORDENAR = {
  bebidas: "bebidas",
  desayunos: "desayunos",
} as const;

export type CategoriaOrdenar = keyof typeof CATEGORIAS_ORDENAR;

/** Categoría del dashboard con enlace a Ordenar. Un valor desconocido se ignora. */
export function parseCategoriaOrdenar(value: unknown): CategoriaOrdenar | undefined {
  return typeof value === "string" && value in CATEGORIAS_ORDENAR ? (value as CategoriaOrdenar) : undefined;
}

/** Ordenar filtrado por la sección del catálogo que corresponde a una categoría del dashboard. */
export function rutaOrdenarCategoria(categoria: CategoriaOrdenar): string {
  return `${RUTA_ORDENAR}?categoria=${CATEGORIAS_ORDENAR[categoria]}`;
}

