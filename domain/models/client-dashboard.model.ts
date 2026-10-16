import { OrderStatus } from "./order-status.model";

/**
 * Modelo de UI del Dashboard del cliente (Figma 3000:17294). No hay endpoint propio: `useClientDashboard` lo
 * compone en el front con la sesión, `GET /banners`, `GET /catalog`, `GET /orders` y las direcciones de la empresa
 * (`domain/adapters/client-dashboard.adapter.ts`). Las categorías son fijas del front (`dashboard/_data`).
 */
export interface ClientDashboard {
  user: ClientDashboardUser;
  promotions: ClientDashboardPromotion[];
  recommendations: ClientDashboardRecommendation[];
  /** `null` si no hay ningún pedido en curso. */
  activeOrder: ClientActiveOrder | null;
  /** Últimas órdenes, de la más reciente a la más antigua. */
  recentOrders: ClientRecentOrder[];
}

export interface ClientDashboardUser {
  /** Nombre para el saludo ("María Gabriela"). */
  displayName: string;
  /** Nombre corto del sidebar ("Ma. Gabriela"). */
  shortName: string;
  role: string;
  /** Nombre completo (cabecera del menú de cuenta). */
  fullName: string;
  email: string;
  /** Empresa activa; sin valor si la sesión no tiene membresía en ella. */
  companyName?: string;
  avatarSrc?: string;
}

export interface ClientDashboardPromotion {
  id: string;
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ClientDashboardCategory {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: "start" | "end";
  /** `bleed`: foto recortada para el banner, a sangre por su lado y por abajo (Figma). Por defecto `contain`. */
  imageFit?: "contain" | "bleed";
}

/**
 * Categoría de una recomendación (filtros "Según tus preferencias"). El catálogo no la da por ítem: sale de la
 * sección en la que aparece (`desayunos`, `coffee-break`, `bebidas`); ver DECISIONES 2026-10-15.
 */
export type ClientRecommendationCategory = "desayunos" | "coffee" | "bebidas";

/** Nombre visible de cada categoría (chips de filtro y anuncios). */
export const RECOMMENDATION_CATEGORY_LABELS: Record<ClientRecommendationCategory, string> = {
  desayunos: "Desayunos",
  coffee: "Coffee break",
  bebidas: "Bebidas",
};

export interface ClientDashboardRecommendation {
  id: string;
  /** Tipo de ítem del catálogo: decide el enlace a la ficha (`?tipo=combo`). */
  kind: "product" | "combo";
  name: string;
  description: string;
  category: ClientRecommendationCategory;
  /** Solo UI: tipo de foto (recorte, caja sobre fondo de marca o foto a sangre). Por defecto recorte. */
  imageKind?: "cutout" | "plate" | "photo";
  /** `null` si el ítem no tiene foto: la pantalla pone la de por defecto. */
  imageSrc: string | null;
  imageAlt: string;
}

export interface ClientActiveOrder {
  id: string;
  productName: string;
  boxes: number;
  status: OrderStatus;
  /**
   * Entrega pedida (ISO 8601 con `-04:00`): `deliveryDate` + `deliveryTime`. El back no tiene hora estimada de
   * llegada. `null` si el pedido no tiene fecha u hora de entrega.
   */
  estimatedArrival: string | null;
  /** Avance de 0 a 100, derivado del estado: el back no lo expone (ver DECISIONES 2026-10-14). */
  progress: number;
}

export interface ClientRecentOrder {
  id: string;
  /** Número visible sin "#". TODO de contrato: el back no tiene número de pedido; son los 8 últimos del id. */
  number: string;
  productName: string;
  boxes: number;
  status: OrderStatus;
  address: string;
  /** Fecha del pedido (ISO 8601 con zona). */
  createdAt: string;
}
