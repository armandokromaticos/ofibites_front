/** Línea del carrito lista para pintar (resumen de la top bar y página `/carrito`). */
export interface CartLineModel {
  id: string;
  kind: "product" | "combo";
  /** Id del producto o combo en el catálogo (para enlazar su ficha). */
  catalogId: string;
  name: string;
  /** Imagen principal; `null` si no tiene (la vista pone la imagen por defecto). */
  imageSrc: string | null;
  quantity: number;
  /** Personas del tamaño ("8 personas") o el nombre del tamaño; `null` si no aplica. */
  servingsLabel: string | null;
  /** Precio unitario vigente del servidor (sin modificadores, como `CartItem.unitPrice`). */
  unitPrice: number;
  /** La línea lleva modificadores: `unitPrice` no los incluye, así que no se muestra como "por unidad". */
  hasModifiers: boolean;
  /** `false`: hoy no se podría añadir (producto, tamaño o extras desactivados). El carrito la sigue cotizando. */
  isAvailable: boolean;
  /** Subtotal de la línea calculado por el servidor. */
  subtotal: number;
}
