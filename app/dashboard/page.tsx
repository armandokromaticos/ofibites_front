import type { Metadata } from "next";

import { DashboardCliente } from "./dashboard-cliente";
import { parseEstadoQa } from "./datos-ejemplo";

export const metadata: Metadata = {
  title: "Dashboard · Ofibites",
};

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** `?estado=cargando|vacio|error` fuerza un estado para QA, solo en desarrollo. */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { estado } = await searchParams;
  const estadoQa = process.env.NODE_ENV === "production" ? undefined : parseEstadoQa(estado);

  return <DashboardCliente estadoQa={estadoQa} />;
}
