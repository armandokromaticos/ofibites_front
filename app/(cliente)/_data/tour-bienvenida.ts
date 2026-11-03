import type { TourId } from "@/domain/stores";
import type { OrGuidedTourStep } from "@/ui/atomic";

export const TOUR_BIENVENIDA: TourId = "bienvenida-cliente";

/** Valores de `data-tour` que usa el recorrido de bienvenida (layout del cliente y dashboard). */
export const OBJETIVOS_TOUR = {
  /** Riel del sidebar (≥ 768 px). */
  menuLateral: "menu-lateral",
  /** Hamburguesa de la top bar (< 768 px, el sidebar es un drawer). */
  menuMovil: "menu-movil",
  /** "Realizar pedido" de la tarjeta de saludo. */
  realizarPedido: "realizar-pedido",
  /** Sección "Según tus preferencias". */
  recomendados: "recomendados",
} as const;

/** Textos literales del Figma (Tour, nodo 3503:4852; `diseno/figma/textos/tour.md`). */
export const PASOS_TOUR_BIENVENIDA: OrGuidedTourStep[] = [
  {
    target: [OBJETIVOS_TOUR.menuLateral, OBJETIVOS_TOUR.menuMovil],
    title: "Menú de navegación",
    description: "Muévete entre Inicio, Ordenar, Pedidos, Facturas y Usuarios desde este menú lateral.",
    placement: "right",
    padding: 0,
  },
  {
    target: OBJETIVOS_TOUR.realizarPedido,
    title: "Haz un pedido",
    description: "Empieza un pedido nuevo del catálogo y disfruta la experiencia Ofibites.",
    placement: "bottom",
  },
  {
    target: OBJETIVOS_TOUR.recomendados,
    title: "Recomendados para ti",
    description: "Descubre boxes sugeridos para cada momento de la oficina, listos para añadir al carrito.",
    placement: "top",
    padding: 16,
  },
];
