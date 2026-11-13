import { formatPrice } from "@/shared/utils";

export interface ProductoARepetir {
  id: string;
  nombre: string;
  cantidad: number;
  /** Precio unitario del pedido original; `null` si el rol no ve precios. */
  precioUnitario: number | null;
}

/**
 * Lista "Productos" del modal "Repetir pedido" (Figma 3568:1770): card crema de radio 12 con una fila blanca por
 * línea ("40 ×" en gris, nombre y precio unitario a la derecha) separadas por líneas `surface-sand`. Con muchas
 * líneas hace scroll dentro del modal. El precio es el del pedido original: el carrito recalcula con el actual.
 */
export function ProductosARepetir({ productos }: { productos: ProductoARepetir[] }) {
  if (productos.length === 0) return null;
  return (
    <ul
      aria-label="Productos que se cargarán en el carrito"
      className="max-h-[240px] divide-y divide-surface-sand overflow-y-auto rounded-xl bg-surface-cream"
    >
      {productos.map((producto) => (
        <li key={producto.id} className="flex items-center gap-2.5 bg-content1 px-4 py-3">
          <span className="shrink-0 text-xs font-semibold tabular-nums text-subtle">{producto.cantidad} ×</span>
          <span className="min-w-0 flex-1 truncate text-[13px] leading-4 text-foreground">{producto.nombre}</span>
          {producto.precioUnitario !== null && (
            <span className="shrink-0 text-[13px] font-semibold leading-4 tabular-nums text-foreground">
              {formatPrice(producto.precioUnitario)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
