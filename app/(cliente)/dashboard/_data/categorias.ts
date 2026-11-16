import { ClientDashboardCategory } from "@/domain/models";

/**
 * Banners de categoría del Dashboard: contenido de marketing fijo del front (no hay modelo en el back). Cada uno
 * enlaza a Ordenar filtrado por su id (`parseCategoriaOrdenar`).
 */
export const CATEGORIAS_DASHBOARD: ClientDashboardCategory[] = [
  {
    id: "bebidas",
    title: "Bebidas",
    subtitle: "Naturales, frescas y listas para disfrutar.",
    // Fotos recortadas para el banner (Figma 3220:28597): a sangre por su lado y por abajo.
    imageSrc: "/images/banners/dashboard-bebidas.png",
    imageAlt: "Tres botellas de jugo natural",
    imagePosition: "start",
    imageFit: "bleed",
    backgroundSrc: "/images/banners/dashboard-bebidas-bg.png",
  },
  {
    id: "desayunos",
    title: "Working Lunch",
    subtitle: "Almuerzos que sí dan ganas de repetir",
    imageSrc: "/images/banners/dashboard-bolleria.png",
    imageAlt: "Caja abierta con seis hojaldres rellenos",
    imagePosition: "end",
    imageFit: "bleed",
    backgroundSrc: "/images/banners/dashboard-bolleria-bg.png",
  },
];
