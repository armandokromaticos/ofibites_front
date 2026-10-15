import type { OrProductMarqueeItem } from "@/app/lib/atomic";

/**
 * Surtidos del mosaico del login v2: diez sujetos distintos, sin precios ni claims. Los nombres
 * aparecen literales en el Figma (diseno/figma/textos); la segunda línea se omite si repetiría el
 * nombre. Es decoración: no sale del catálogo de la API (el login no tiene sesión para pedirlo).
 *
 * Orden = reparto del mosaico: 3 por columna (izquierda, centro, derecha) y el décimo como cara
 * trasera de la central (ver `OrProductMarquee`).
 *
 * `public/images/login/*.webp` se derivan de los originales (que no se tocan) con el `sharp` de Next:
 * - recortes (`bebidas`, `coffee-break-box`, `dashboard-bolleria`): `.trim({ threshold: 10 })` para
 *   quitar el margen transparente, WebP calidad 86;
 * - cajas con fondo arena propio (`caja-desayuno`, `caja-bowl`): `.flatten({ background: #E8DCC6 })`
 *   y `.linear([229/232, 216/220, 188/198], 0)`, que lleva ese fondo a `surface-sand` (#E5D8BC) exacto;
 *   luego `.trim({ background: surface-sand, threshold: 6 })` y `.extend()` de un 4 % en ese color.
 */
export const LOGIN_SURTIDOS: OrProductMarqueeItem[] = [
  // Columna izquierda
  {
    id: "desayuno-ejecutivo",
    name: "Desayuno Ejecutivo",
    category: "Desayunos",
    imageSrc: "/images/login/caja-desayuno.webp",
    kind: "plate",
  },
  {
    id: "coffee-break-clasico",
    name: "Coffee Break Clásico",
    category: "Coffee break",
    imageSrc: "/images/products/gallery/cafe-croissants.png",
    kind: "photo",
  },
  {
    id: "bebidas-naturales",
    name: "Bebidas naturales",
    category: "Bebidas",
    imageSrc: "/images/login/bebidas.webp",
    kind: "cutout",
  },
  // Columna central
  {
    id: "coffee-break-ejecutivo",
    name: "Coffee Break Ejecutivo",
    category: "Coffee break",
    imageSrc: "/images/login/coffee-break-box.webp",
    kind: "cutout",
  },
  {
    id: "pasapalos",
    name: "Surtidos de pasapalos para compartir",
    category: "Desayunos",
    imageSrc: "/images/products/gallery/pasapalos-principal.png",
    kind: "photo",
  },
  {
    id: "morning-bite",
    name: "Morning Bite",
    category: "Desayunos",
    imageSrc: "/images/login/dashboard-bolleria.webp",
    kind: "cutout",
  },
  // Columna derecha
  {
    id: "coffee-break-am",
    name: "Coffee Break AM",
    category: "Coffee break",
    imageSrc: "/images/products/gallery/cafe-bolleria.png",
    kind: "photo",
  },
  {
    id: "working-lunch",
    name: "Working Lunch",
    imageSrc: "/images/login/caja-bowl.webp",
    kind: "plate",
  },
  {
    id: "coffee-break-box-premium",
    name: "Coffee Break Box premium",
    category: "Coffee break",
    imageSrc: "/images/auth/login-photo.webp",
    kind: "photo",
  },
  // Cara trasera de la central
  {
    id: "desayuno",
    name: "Desayuno",
    imageSrc: "/images/products/gallery/cafe-panes.png",
    kind: "photo",
  },
];
