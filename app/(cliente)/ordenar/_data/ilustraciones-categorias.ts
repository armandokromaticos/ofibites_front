// Ilustraciones de las categorías de Ordenar (Figma 3067:17606). El catálogo (`GET /catalog`) no trae imagen
// de sección: el front la pone por `slug` (nota del contrato), con una por defecto para slugs nuevos.

/** Valor de la categoría virtual "Todos" en el selector (no es un slug del catálogo). */
export const CATEGORIA_TODOS = "todos";

const ILUSTRACION_POR_DEFECTO = "/images/categories/croissant-relleno.png";

const ILUSTRACIONES: Record<string, string> = {
  [CATEGORIA_TODOS]: "/images/categories/croissant-relleno.png",
  "recomendados-de-la-semana": "/images/categories/bagel-salmon.png",
  "coffee-break": "/images/categories/croissant-almendras.png",
  "working-lunch": "/images/categories/ensalada.png",
  desayunos: "/images/categories/sandwich.png",
  bebidas: "/images/categories/bebida.png",
};

export function ilustracionCategoria(slug: string): string {
  return ILUSTRACIONES[slug] ?? ILUSTRACION_POR_DEFECTO;
}
