import { CatalogItem } from "@/domain/types";
import { formatPriceRange } from "@/shared/utils";
import { MlCarouselRow, OrCatalogCard } from "@/ui/atomic";

import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../../_data/imagenes";
import { rutaProducto } from "../../../_navegacion";

/** "Nuestra recomendación para ti" (Figma 3151:2767): fila deslizable de cards del catálogo con flechas. */
export function RecomendacionesFicha({ items }: { items: CatalogItem[] }) {
  return (
    <section aria-labelledby="ficha-recomendaciones" className="flex flex-col gap-6 xl:gap-[37px]">
      <h2
        id="ficha-recomendaciones"
        className="text-balance text-center font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-[28px]"
      >
        Nuestra recomendación para ti
      </h2>
      <MlCarouselRow
        label="Recomendaciones"
        items={items.map((item) => (
          <OrCatalogCard
            key={`${item.kind}-${item.id}`}
            className="h-full"
            name={item.name}
            description={item.description}
            // La foto es ilustrativa: el nombre ya dice qué es.
            imageSrc={item.image ?? IMAGEN_PRODUCTO_POR_DEFECTO}
            imageAlt=""
            priceLabel={formatPriceRange(item.priceFrom, item.priceTo)}
            href={rutaProducto(item.id, item.kind)}
            isFeatured={item.isFeatured}
            isOnSale={item.isOnSale}
          />
        ))}
      />
    </section>
  );
}
