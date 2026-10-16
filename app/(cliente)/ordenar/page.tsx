import type { Metadata } from "next";

import { parseEstadoQaCatalogo } from "@/domain/hooks/catalog";

import { OrdenarCatalogo } from "./_components/ordenar-catalogo";

export const metadata: Metadata = {
  title: "Ordenar · Ofibites",
};

interface OrdenarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Catálogo del cliente. Los filtros (`?categoria=`, `?tags=`, `?filtro=`, `?q=`, `?pagina=`) los
 * lee el componente desde la URL. `?estado=cargando|vacio|error` fuerza un estado para QA, solo en desarrollo.
 */
export default async function OrdenarPage({ searchParams }: OrdenarPageProps) {
  const { estado } = await searchParams;
  const estadoQa = process.env.NODE_ENV === "production" ? undefined : parseEstadoQaCatalogo(estado);

  return <OrdenarCatalogo estadoQa={estadoQa} />;
}
