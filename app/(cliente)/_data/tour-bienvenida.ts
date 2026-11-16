import type { TourId } from "@/domain/stores";
import type { CompanyRole } from "@/domain/types";
import type { OrGuidedTourStep } from "@/ui/atomic";

export const TOUR_BIENVENIDA: TourId = "bienvenida-cliente";

/** Roles de empresa que ven el tour de bienvenida (T-39): comprador y administrador. Finanzas, no. */
export const ROLES_TOUR_BIENVENIDA: readonly CompanyRole[] = ["COMPANY_BUYER", "COMPANY_ADMIN"];

/** Valores de `data-tour` que usa el recorrido de bienvenida (layout del cliente y dashboard). */
export const OBJETIVOS_TOUR = {
  /** Riel del sidebar (≥ 768 px). */
  menuLateral: "menu-lateral",
  /** Hamburguesa de la top bar (< 768 px, el sidebar es un drawer). */
  menuMovil: "menu-movil",
  /** "Hacer pedido" de la tarjeta de saludo. */
  realizarPedido: "realizar-pedido",
  /** Sección "Según tus preferencias". */
  recomendados: "recomendados",
} as const;

/** Textos de T-39 (`gestion/textos-plataforma.md`, sección 3; Figma Tour 3503:4852). */
export const PASOS_TOUR_BIENVENIDA: OrGuidedTourStep[] = [
  {
    target: [OBJETIVOS_TOUR.menuLateral, OBJETIVOS_TOUR.menuMovil],
    title: "Todo empieza en el menú lateral",
    description: "Desde aquí llegas a cada sección de la plataforma.",
    placement: "right",
    padding: 0,
  },
  {
    target: OBJETIVOS_TOUR.realizarPedido,
    title: "Tu próximo pedido empieza aquí",
    description: "Explora el catálogo, elige la cantidad y arma el pedido a tu medida.",
    placement: "bottom",
  },
  {
    target: OBJETIVOS_TOUR.recomendados,
    title: "Ideas para tu primer pedido",
    description: "Descubre surtidos pensados para cada momento del día.",
    placement: "top",
    padding: 16,
  },
];
