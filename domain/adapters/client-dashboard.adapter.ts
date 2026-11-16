// Adapters puros API → modelo de UI del Dashboard del cliente (`ClientDashboard`). No hay endpoint propio:
// `useClientDashboard` pide cada pieza y aquí se compone.
import {
  ClientActiveOrder,
  ClientDashboard,
  ClientDashboardPromotion,
  ClientDashboardRecommendation,
  ClientDashboardUser,
  ClientRecentOrder,
  ClientRecommendationCategory,
  DEFAULT_RECOMMENDATION_CATEGORIES,
  isRecommendationCategory,
  ORDER_STATUS_LABELS,
  OrderStatus,
  RECOMMENDATION_CATEGORIES,
} from "@/domain/models";
import {
  Banner,
  CatalogItem,
  CatalogItemKind,
  CompanyAddress,
  CompanyRole,
  Membership,
  Order,
  TeamPreferencesResponse,
  User,
} from "@/domain/types";

/**
 * Secciones del catálogo que se piden para las recomendaciones (la categoría es el propio slug de `Section`). Las
 * tres de siempre van primero para que, sin preferencias del equipo, el orden sea el de antes de T-45.
 */
export const RECOMMENDATION_SECTIONS: readonly ClientRecommendationCategory[] = [
  ...DEFAULT_RECOMMENDATION_CATEGORIES,
  ...RECOMMENDATION_CATEGORIES.filter((c) => !DEFAULT_RECOMMENDATION_CATEGORIES.includes(c)),
];

const MAX_RECOMMENDATIONS = 6;
const MAX_RECENT_ORDERS = 4;

const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  COMPANY_ADMIN: "Administrador",
  COMPANY_BUYER: "Comprador",
  COMPANY_FINANCE: "Finanzas",
  COMPANY_APPROVER: "Aprobador",
};

// ---------------------------------------------------------------------------------------------------------------
// Usuario (de la sesión)

/** Saludo, nombre corto del sidebar, datos del menú de cuenta, rol en la empresa activa y foto (T-30d). */
export function toClientDashboardUser(
  user: (Pick<User, "name" | "email"> & Partial<Pick<User, "avatarUrl">>) | null,
  memberships: Membership[],
  activeCompanyId: string | null,
): ClientDashboardUser {
  const palabras = (user?.name ?? "").trim().split(/\s+/).filter(Boolean);
  const membership = memberships.find((m) => m.companyId === activeCompanyId);
  return {
    // Dos primeras palabras ("María Gabriela" o "Juan Pérez"): el saludo no cabe con el nombre completo.
    displayName: palabras.slice(0, 2).join(" "),
    // "María G.": primer nombre e inicial de la siguiente palabra.
    shortName: palabras.length > 1 ? `${palabras[0]} ${palabras[1].charAt(0).toUpperCase()}.` : (palabras[0] ?? ""),
    role: membership ? COMPANY_ROLE_LABELS[membership.role] : "Cliente",
    fullName: (user?.name ?? "").trim(),
    email: user?.email ?? "",
    companyName: membership?.companyName,
    // Sin foto (o una sesión guardada antes de T-30c, sin el campo), las iniciales.
    avatarSrc: user?.avatarUrl ?? undefined,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Promociones (`GET /banners?section=home-carousel&active=true`)

/** Banners con imagen, por `order`. El subtítulo, solo si trae texto. */
export function toPromotions(banners: Banner[]): ClientDashboardPromotion[] {
  return banners
    .filter((banner): banner is Banner & { imageUrl: string } => Boolean(banner.imageUrl))
    .sort((a, b) => a.order - b.order)
    .map((banner) => ({
      id: banner.id,
      title: banner.title ?? banner.altText,
      ...(banner.subtitle?.trim() && { subtitle: banner.subtitle.trim() }),
      imageSrc: banner.imageUrl,
      imageAlt: banner.altText,
      ...(banner.linkUrl && { ctaHref: banner.linkUrl, ctaLabel: "Ordenar ahora" }),
    }));
}

// ---------------------------------------------------------------------------------------------------------------
// Recomendaciones (`GET /catalog` por sección)

const itemKey = (kind: CatalogItemKind, id: string) => `${kind}:${id}`;

/**
 * Todos los ítems recomendables de las secciones de `RECOMMENDATION_SECTIONS`, sin repetir, en el orden en que
 * aparecen (sección a sección). Cada ítem lleva **todas** las secciones en las que sale (`categories`): el catálogo
 * no da la sección por ítem, pero sí lo trae cada `GET /catalog?section=`. Lo que se pinta lo decide
 * `toRecommendationView` con las preferencias del equipo.
 */
export function toRecommendations(
  porCategoria: Partial<Record<ClientRecommendationCategory, CatalogItem[]>>,
): ClientDashboardRecommendation[] {
  const candidatos = new Map<string, ClientDashboardRecommendation>();
  for (const category of RECOMMENDATION_SECTIONS) {
    for (const item of porCategoria[category] ?? []) {
      const key = itemKey(item.kind, item.id);
      const existente = candidatos.get(key);
      if (existente) {
        if (!existente.categories.includes(category)) existente.categories.push(category);
        continue;
      }
      candidatos.set(key, {
        id: item.id,
        kind: item.kind,
        name: item.name,
        description: item.description ?? "",
        categories: [category],
        imageSrc: item.image,
        imageAlt: item.name,
        isFeatured: item.isFeatured,
      });
    }
  }
  return [...candidatos.values()];
}

/** Lo que pinta "Según tus preferencias": chips (además de "Todos") y la lista de cada uno. */
export interface RecommendationView {
  categories: ClientRecommendationCategory[];
  todos: ClientDashboardRecommendation[];
  porCategoria: Partial<Record<ClientRecommendationCategory, ClientDashboardRecommendation[]>>;
}

/** Orden estable con los destacados (`isFeatured`) primero. */
const destacadosPrimero = (items: ClientDashboardRecommendation[]) => [
  ...items.filter((item) => item.isFeatured),
  ...items.filter((item) => !item.isFeatured),
];

/**
 * Chips y listas de "Según tus preferencias" (contrato T-45).
 * - Con `source = "registration"` y alguna sección elegida con ítems: chips = esas secciones en el orden de la
 *   solicitud (solo las que tienen ítems); "Todos" = primero los ítems de esas secciones (destacados primero y, a
 *   igualdad, por la sección elegida antes), luego el resto (destacados primero); cada chip, los ítems de su
 *   sección (destacados primero). Hasta 6 por lista.
 * - Sin preferencias (`source = "none"`, cargando o error): como antes de T-45. Hasta 6 ítems de desayunos,
 *   coffee break y bebidas (destacados primero) y cada chip fijo filtra esos 6 por pertenencia (puede quedar vacío).
 */
export function toRecommendationView(
  pool: ClientDashboardRecommendation[],
  preferences: TeamPreferencesResponse | undefined,
): RecommendationView {
  const conItems = (category: ClientRecommendationCategory) =>
    pool.some((item) => item.categories.includes(category));
  const elegidas =
    preferences?.source === "registration"
      ? [...new Set(preferences.sectionSlugs)].filter(isRecommendationCategory).filter(conItems)
      : [];

  if (elegidas.length === 0) {
    const base = destacadosPrimero(
      pool.filter((item) => item.categories.some((c) => DEFAULT_RECOMMENDATION_CATEGORIES.includes(c))),
    ).slice(0, MAX_RECOMMENDATIONS);
    return {
      categories: [...DEFAULT_RECOMMENDATION_CATEGORIES],
      todos: base,
      porCategoria: Object.fromEntries(
        DEFAULT_RECOMMENDATION_CATEGORIES.map((c) => [
          c,
          base.filter((item) => item.categories.includes(c)),
        ]),
      ),
    };
  }

  const rango = (item: ClientDashboardRecommendation) => {
    const indices = item.categories.map((c) => elegidas.indexOf(c)).filter((i) => i >= 0);
    return indices.length > 0 ? Math.min(...indices) : Infinity;
  };
  const preferidos = pool
    .filter((item) => rango(item) !== Infinity)
    .map((item, indice) => ({ item, indice, rango: rango(item) }))
    .sort(
      (a, b) =>
        Number(b.item.isFeatured) - Number(a.item.isFeatured) ||
        a.rango - b.rango ||
        a.indice - b.indice,
    )
    .map(({ item }) => item);
  const resto = destacadosPrimero(pool.filter((item) => rango(item) === Infinity));

  return {
    categories: elegidas,
    todos: [...preferidos, ...resto].slice(0, MAX_RECOMMENDATIONS),
    porCategoria: Object.fromEntries(
      elegidas.map((c) => [
        c,
        destacadosPrimero(pool.filter((item) => item.categories.includes(c))).slice(
          0,
          MAX_RECOMMENDATIONS,
        ),
      ]),
    ),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Pedidos (`GET /orders` + catálogo para los nombres + direcciones de la empresa)

/** Mapa `kind:id` → nombre con todos los ítems de catálogo recibidos (para nombrar los pedidos). */
export function toCatalogNames(...listas: CatalogItem[][]): Map<string, string> {
  const nombres = new Map<string, string>();
  for (const item of listas.flat()) nombres.set(itemKey(item.kind, item.id), item.name);
  return nombres;
}

/** Mapa id → nombre corto (`label`, o `line1`) de las direcciones de la empresa. */
export function toAddressNames(addresses: CompanyAddress[]): Map<string, string> {
  return new Map(addresses.map((address) => [address.id, address.label || address.line1]));
}

const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "REJECTED", "CANCELLED"];

/** Avance de la card del pedido en curso: el back no lo tiene, sale del estado. */
const ORDER_PROGRESS: Record<OrderStatus, number> = {
  CREATED: 10,
  PENDING_APPROVAL: 10,
  PENDING_CONFIRMATION: 10,
  IN_ADJUSTMENT: 20,
  CONFIRMED: 30,
  IN_PREPARATION: 55,
  IN_TRANSIT: 80,
  DELIVERED: 100,
  REJECTED: 0,
  CANCELLED: 0,
};

/** Dirección que se pinta si no se pudo resolver (sin permiso para listarlas o borrada). */
const SIN_DIRECCION = "—";

function isOrderStatus(status: string): status is OrderStatus {
  return status in ORDER_STATUS_LABELS;
}

/** "Morning Bite", "Morning Bite y 2 más" o "Pedido" si el primer ítem no está en el catálogo recibido. */
function orderProductName(order: Order, nombres: Map<string, string>): string {
  const items = order.items ?? [];
  const primero = items[0];
  if (!primero) return "Pedido";
  const nombre = primero.comboId
    ? nombres.get(itemKey("combo", primero.comboId))
    : nombres.get(itemKey("product", primero.productId));
  if (!nombre) return "Pedido";
  return items.length > 1 ? `${nombre} y ${items.length - 1} más` : nombre;
}

/**
 * Entrega pedida en hora de Caracas. `deliveryDate` es `@db.Date` (medianoche UTC): sus 10 primeros caracteres
 * son la fecha pura, que con `deliveryTime` ("HH:mm") da el instante en `-04:00`.
 */
export function toEstimatedArrival(
  deliveryDate: string | null,
  deliveryTime: string | null,
): string | null {
  const fecha = deliveryDate?.slice(0, 10);
  const fechaValida = fecha !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  if (!fechaValida || !deliveryTime || !/^\d{2}:\d{2}$/.test(deliveryTime)) return null;
  return `${fecha}T${deliveryTime}:00-04:00`;
}

const porCreacionDesc = (a: Order, b: Order) => Date.parse(b.createdAt) - Date.parse(a.createdAt);

/**
 * Pedido en curso (el no terminal más reciente, con prioridad para "En camino") y las 4 últimas órdenes
 * (todos los estados, de la más nueva a la más vieja). Los estados que el front no conoce se ignoran.
 */
export function toDashboardOrders(
  orders: Order[],
  nombres: Map<string, string>,
  direcciones: Map<string, string>,
): Pick<ClientDashboard, "activeOrder" | "recentOrders"> {
  const conocidas = orders
    .filter((order): order is Order & { status: OrderStatus } => isOrderStatus(order.status))
    .sort(porCreacionDesc);
  const boxes = (order: Order) => (order.items ?? []).reduce((total, item) => total + item.quantity, 0);

  const enCurso = conocidas.filter((order) => !TERMINAL_STATUSES.includes(order.status));
  const activa = enCurso.find((order) => order.status === "IN_TRANSIT") ?? enCurso[0];
  const activeOrder: ClientActiveOrder | null = activa
    ? {
      id: activa.id,
      productName: orderProductName(activa, nombres),
      boxes: boxes(activa),
      status: activa.status,
      estimatedArrival: toEstimatedArrival(activa.deliveryDate, activa.deliveryTime),
      progress: ORDER_PROGRESS[activa.status],
    }
    : null;

  const recentOrders: ClientRecentOrder[] = conocidas.slice(0, MAX_RECENT_ORDERS).map((order) => ({
    id: order.id,
    number: order.orderNumber ?? order.id.slice(-8).toUpperCase(),
    productName: orderProductName(order, nombres),
    boxes: boxes(order),
    status: order.status,
    address: direcciones.get(order.deliveryAddressId) ?? SIN_DIRECCION,
    createdAt: order.createdAt,
  }));

  return { activeOrder, recentOrders };
}
