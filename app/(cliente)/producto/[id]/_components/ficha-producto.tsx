"use client";

import { PackageX, RefreshCw } from "lucide-react";

import { EstadoQaFicha, useCatalogItem } from "@/domain/hooks/catalog";
import { CatalogItemDetail } from "@/domain/types";
import { isApiError } from "@/shared/utils";
import { MlEmptyState, MlProductGallery } from "@/ui/atomic";

import { IMAGEN_PRODUCTO_POR_DEFECTO } from "../../../_data/imagenes";
import { RUTA_ORDENAR, TipoFicha } from "../../../_navegacion";

import { BannerFinal } from "./banner-final";
import { FichaEsqueleto } from "./ficha-esqueleto";
import { PanelCompra } from "./panel-compra";
import { RecomendacionesFicha } from "./recomendaciones-ficha";

interface FichaProductoProps {
  id: string;
  kind: TipoFicha;
  estadoQa?: EstadoQaFicha;
}

/** 400 (id mal formado) o 404 (inexistente o inactivo): para el cliente, el producto ya no está. */
function esNoDisponible(error: unknown): boolean {
  return isApiError(error) && (error.statusCode === 404 || error.statusCode === 400);
}

/**
 * Ficha del producto o combo: galería + panel de compra (Figma 3097:28706), recomendaciones y banner final.
 * Sidebar y top bar ("Detalle del producto", Ordenar activo) los pone el layout de `(cliente)`.
 */
export function FichaProducto({ id, kind, estadoQa }: FichaProductoProps) {
  const { data, isPending, isError, error, refetch, isFetching } = useCatalogItem(kind, id, {
    qaState: estadoQa,
  });

  if (isPending) return <FichaEsqueleto />;

  if (isError) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-xl rounded-card bg-content1">
          {esNoDisponible(error) ? (
            <MlEmptyState
              headingLevel={2}
              icon={<PackageX />}
              title="Este producto ya no está disponible"
              description="Puede que lo hayamos retirado del catálogo. Encuentra otras opciones para tu equipo en Ordenar."
              actionLabel="Volver a Ordenar"
              actionHref={RUTA_ORDENAR}
            />
          ) : (
            <MlEmptyState
              headingLevel={2}
              tone="error"
              icon={<RefreshCw />}
              title="No pudimos cargar el producto"
              description="Revisa tu conexión e inténtalo de nuevo."
              actionLabel="Reintentar"
              onAction={() => void refetch()}
              isActionLoading={isFetching}
            />
          )}
        </div>
      </div>
    );
  }

  return <FichaContenido item={data} />;
}

function FichaContenido({ item }: { item: CatalogItemDetail }) {
  return (
    <div className="mx-auto flex w-full max-w-[1296px] flex-col gap-12 xl:gap-[60px]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,585fr)_minmax(0,681fr)] lg:items-start xl:gap-[29px]">
        <MlProductGallery
          images={item.images}
          productName={item.name}
          fallbackSrc={IMAGEN_PRODUCTO_POR_DEFECTO}
          preload
        />
        <PanelCompra item={item} imagenCaja={item.images[0] ?? IMAGEN_PRODUCTO_POR_DEFECTO} />
      </div>

      {item.recommendations.length > 0 && <RecomendacionesFicha items={item.recommendations} />}

      <BannerFinal />
    </div>
  );
}
