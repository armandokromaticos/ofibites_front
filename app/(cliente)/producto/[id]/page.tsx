import type { Metadata } from "next";

import { parseEstadoQaFicha } from "@/domain/hooks/catalog";

import { parseTipoFicha } from "../../_navegacion";

import { FichaProducto } from "./_components/ficha-producto";

export const metadata: Metadata = {
  title: "Detalle del producto · Ofibites",
};

interface ProductoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Ficha de un ítem del catálogo (Figma 3097:28706), a la que lleva el "+" de Ordenar y de las recomendaciones.
 * `?tipo=combo` indica que el id es de un `Combo` (si no, de un `Product`). `?estado=cargando|error` fuerza un
 * estado para QA, solo en desarrollo; el 404 se ve con un id que no existe.
 */
export default async function ProductoPage({ params, searchParams }: ProductoPageProps) {
  const [{ id }, { tipo, estado }] = await Promise.all([params, searchParams]);
  const estadoQa = process.env.NODE_ENV === "production" ? undefined : parseEstadoQaFicha(estado);

  return <FichaProducto id={id} kind={parseTipoFicha(tipo)} estadoQa={estadoQa} />;
}
