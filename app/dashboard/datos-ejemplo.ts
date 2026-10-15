// Datos de ejemplo del Dashboard del cliente (T-04). Ninguno viene de la API todavía:
// ver gestion/DECISIONES.md (2026-10-14). Para conectar, el `queryFn` de `useClientDashboard`
// pasa a ser el servicio y este archivo se borra.
import { ClientDashboard } from "@/domain/models";

/** Estados de QA que se fuerzan con `?estado=` (solo en desarrollo). */
export type EstadoQaDashboard = "cargando" | "vacio" | "error";

const ESTADOS_QA: readonly EstadoQaDashboard[] = ["cargando", "vacio", "error"];

export function parseEstadoQa(value: unknown): EstadoQaDashboard | undefined {
  return ESTADOS_QA.find((estado) => estado === value);
}

/** Retardo simulado de la red, para que el esqueleto se vea un momento. */
const RETARDO_MS = 600;

const DASHBOARD_EJEMPLO: ClientDashboard = {
  // TODO: conectar API (T-04). Saldrá del usuario autenticado (auth store / perfil).
  user: {
    displayName: "María Gabriela",
    shortName: "Ma. Gabriela",
    role: "Compradora",
    avatarSrc: "/images/sample/avatar.webp",
  },

  // TODO: conectar API (T-04). Promociones del banner principal: no hay modelo en el back.
  // Solo la primera está en el Figma; las otras dos rellenan el indicador de 3 puntos.
  promotions: [
    {
      id: "coffee-break-ejecutivo",
      title: "Coffee Break Ejecutivo",
      subtitle: "Ideal para reuniones de 4 a 15 personas",
      imageSrc: "/images/products/coffee-break-box.webp",
      imageAlt: "Caja de coffee break con bagels, sándwiches y canapés",
      ctaLabel: "Ordenar ahora",
      ctaHref: "/ordenar",
    },
    {
      id: "morning-bite",
      title: "Morning Bite",
      subtitle: "Empieza la jornada con opciones frescas para todo el equipo",
      imageSrc: "/images/products/morning-bite.webp",
      imageAlt: "Caja Morning Bite con croissant, sándwiches, magdalenas, fruta y café",
      ctaLabel: "Ordenar ahora",
      ctaHref: "/ordenar",
    },
    {
      id: "bebidas-naturales",
      title: "Bebidas naturales",
      subtitle: "Jugos y bebidas saludables para acompañar cada pedido",
      imageSrc: "/images/products/bebidas.png",
      imageAlt: "Tres botellas de jugo natural",
      ctaLabel: "Ordenar ahora",
      ctaHref: "/ordenar",
    },
  ],

  // TODO: conectar API (T-04). Categorías destacadas (en el back: tags o sections, por confirmar).
  categories: [
    {
      id: "bebidas",
      title: "Bebidas",
      subtitle: "Bebidas naturales o de contenido saludable",
      imageSrc: "/images/products/bebidas.png",
      imageAlt: "Tres botellas de jugo natural",
      imagePosition: "start",
    },
    {
      id: "desayunos",
      title: "Desayunos",
      subtitle: "Ideal para reuniones de 4 a 15 personas",
      // No hay foto de desayunos (el Figma usa una caja de hojaldres): la más cercana es Morning Bite.
      imageSrc: "/images/products/morning-bite.webp",
      imageAlt: "Caja de desayuno con croissant, sándwiches, magdalenas, fruta y café",
      imagePosition: "end",
    },
  ],

  // TODO: conectar API (T-04). Recomendaciones "Según tus preferencias": no hay endpoint.
  recommendations: [
    // Los 6 productos de la entrega de diseño (ofibites-dashboard.html), con su categoría y descripción.
    // Fotos: recortes de products, cajas igualadas a surface-sand de T-17 (images/login) y una foto a sangre.
    {
      id: "morning-bite",
      name: "Morning Bite",
      description: "Comienza la jornada con opciones frescas, energéticas y listas para compartir.",
      category: "desayunos",
      imageSrc: "/images/products/morning-bite.webp",
      imageAlt: "Caja Morning Bite con croissant, sándwiches, magdalenas, fruta y café",
    },
    {
      id: "recharge-bite",
      name: "Recharge Bite",
      description: "Una pausa a media tarde con dulces, salados y café para recargar al equipo.",
      category: "coffee",
      imageSrc: "/images/products/gallery/cafe-bolleria.png",
      imageAlt: "Bollería dulce y una taza de café sobre una mesa de madera",
      imageKind: "photo",
    },
    {
      id: "desayuno-ejecutivo",
      name: "Desayuno Ejecutivo",
      description: "Croissants, quiches y fruta fresca para reuniones de directorio.",
      category: "desayunos",
      imageSrc: "/images/login/caja-desayuno.webp",
      imageKind: "plate",
      imageAlt: "Caja de desayuno con croissant, quiche, magdalena, sándwiches, fruta y café",
    },
    {
      id: "coffee-break-ejecutivo",
      name: "Coffee Break Ejecutivo",
      description: "Mini sándwiches, bagels y canapés para reuniones de 4 a 15 personas.",
      category: "coffee",
      imageSrc: "/images/products/coffee-break-box.webp",
      imageAlt: "Caja de coffee break con bagels, sándwiches y canapés",
    },
    {
      id: "pausa-saludable",
      name: "Pausa Saludable",
      description: "Fruta picada, yogurt con granola y jugos naturales para equipos que cuidan su energía.",
      category: "bebidas",
      imageSrc: "/images/login/caja-bowl.webp",
      imageKind: "plate",
      imageAlt: "Caja con bowl de pollo y quinoa, vaso de fruta picada y jugo verde",
    },
    {
      id: "pack-de-jugos",
      name: "Pack de jugos",
      description: "Jugos naturales prensados en frío, ideales para acompañar cualquier box.",
      category: "bebidas",
      imageSrc: "/images/products/bebidas.png",
      imageAlt: "Tres botellas de jugo natural",
    },
  ],

  // TODO: conectar API (T-04). Pedido en curso: el back tiene el grupo "en curso", pero no la
  // hora estimada de llegada ni el avance.
  activeOrder: {
    id: "56801",
    productName: "Morning bites",
    boxes: 10,
    status: "IN_TRANSIT",
    estimatedArrival: "2026-10-14T10:30:00-04:00",
    progress: 54,
  },

  // TODO: conectar API (T-04). Últimas órdenes del usuario (o de la empresa: por decidir).
  recentOrders: [
    {
      id: "56779",
      number: "56779",
      productName: "Morning bites",
      boxes: 8,
      status: "DELIVERED",
      address: "Av. El Bosque, Torre Principal",
      createdAt: "2026-09-04T08:15:00-04:00",
    },
    {
      id: "56789",
      number: "56789",
      productName: "Morning bites",
      boxes: 14,
      status: "DELIVERED",
      address: "Av. El Bosque, Torre Principal",
      createdAt: "2026-09-02T08:40:00-04:00",
    },
    {
      id: "45689",
      number: "45689",
      productName: "Recharge bites",
      boxes: 9,
      status: "DELIVERED",
      address: "Av. El Bosque, Torre Principal",
      createdAt: "2026-09-02T14:05:00-04:00",
    },
    {
      id: "57892",
      number: "57892",
      productName: "Recharge bites",
      boxes: 9,
      status: "DELIVERED",
      address: "Av. El Bosque, Torre Principal",
      createdAt: "2026-08-30T09:30:00-04:00",
    },
  ],
};

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** En `?estado=error` fallan los 2 primeros intentos (el inicial y el reintento automático); "Reintentar" carga. */
let intentosConError = 0;

/**
 * `queryFn` de ejemplo para `useClientDashboard`.
 * TODO: conectar API (T-04). Sustituir por el servicio cuando exista el endpoint.
 */
export function crearQueryFnDeEjemplo(estado?: EstadoQaDashboard): () => Promise<ClientDashboard> {
  // Fuera de `?estado=error` se reinicia el contador, para que volver a ese estado vuelva a fallar.
  if (estado !== "error") intentosConError = 0;

  return async () => {
    if (estado === "cargando") return new Promise<never>(() => {});

    await esperar(RETARDO_MS);

    if (estado === "error" && intentosConError < 2) {
      intentosConError += 1;
      throw new Error("Error simulado del Dashboard (?estado=error)");
    }
    if (estado === "vacio") return { ...DASHBOARD_EJEMPLO, activeOrder: null, recentOrders: [] };
    return DASHBOARD_EJEMPLO;
  };
}
