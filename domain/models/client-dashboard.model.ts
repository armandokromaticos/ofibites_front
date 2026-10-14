import { OrderStatus } from "./order-status.model";

/**
 * Modelo de UI del Dashboard del cliente (Figma 3000:17294).
 * TODO: conectar API (T-04). Todavía no hay endpoint: cuando exista, sus tipos van en
 * `domain/types/api` y un adapter los convierte a este modelo.
 */
export interface ClientDashboard {
  user: ClientDashboardUser;
  promotions: ClientDashboardPromotion[];
  categories: ClientDashboardCategory[];
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
}

export interface ClientDashboardRecommendation {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export interface ClientActiveOrder {
  id: string;
  productName: string;
  boxes: number;
  status: OrderStatus;
  /** Hora estimada de llegada (ISO 8601 con zona). */
  estimatedArrival: string;
  /** Avance de 0 a 100. El back no lo expone todavía (ver DECISIONES 2026-10-14). */
  progress: number;
}

export interface ClientRecentOrder {
  id: string;
  /** Número visible sin "#" ("56779"). */
  number: string;
  productName: string;
  boxes: number;
  status: OrderStatus;
  address: string;
  /** Fecha del pedido (ISO 8601 con zona). */
  createdAt: string;
}
