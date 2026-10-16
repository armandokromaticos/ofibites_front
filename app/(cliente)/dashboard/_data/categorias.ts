import { ClientDashboardCategory } from "@/domain/models";

/**
 * Banners de categoría del Dashboard: contenido de marketing fijo del front (no hay modelo en el back). Cada uno
 * enlaza a Ordenar filtrado por su id (`parseCategoriaOrdenar`).
 */
export const CATEGORIAS_DASHBOARD: ClientDashboardCategory[] = [
  {
    id: "bebidas",
    title: "Bebidas",
    subtitle: "Bebidas naturales o de contenido saludable",
    // Fotos recortadas para el banner (Figma 3220:28597): a sangre por su lado y por abajo.
    imageSrc: "/images/banners/dashboard-bebidas.png",
    imageAlt: "Tres botellas de jugo natural",
    imagePosition: "start",
    imageFit: "bleed",
  },
  {
    id: "desayunos",
    title: "Desayunos",
    subtitle: "Ideal para reuniones de 4 a 15 personas",
    imageSrc: "/images/banners/dashboard-bolleria.png",
    imageAlt: "Caja abierta con seis hojaldres rellenos",
    imagePosition: "end",
    imageFit: "bleed",
  },
];
