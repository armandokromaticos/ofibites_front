import type { Metadata } from "next";

// Directo del archivo: el índice arrastra el store de sesión (cliente) a este Server Component.
import { parseEstadoQa, parsePreferenciasQa } from "@/domain/hooks/dashboard/estado-qa";

import { DashboardCliente } from "./_components/dashboard-cliente";

export const metadata: Metadata = {
  title: "Dashboard · Ofibites",
};

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * `?estado=cargando|vacio|error` fuerza un estado para QA, solo en desarrollo.
 * `?preferencias=coffee-break,bebidas|ninguna` simula las preferencias del equipo (T-45), solo en desarrollo.
 * `?tour=1` abre el tour de bienvenida (en todos los entornos; el parámetro se quita al abrirlo).
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { estado, tour, preferencias } = await searchParams;
  const esProduccion = process.env.NODE_ENV === "production";
  const estadoQa = esProduccion ? undefined : parseEstadoQa(estado);
  const preferenciasQa = esProduccion ? undefined : parsePreferenciasQa(preferencias);

  return <DashboardCliente estadoQa={estadoQa} preferenciasQa={preferenciasQa} abrirTour={tour === "1"} />;
}
