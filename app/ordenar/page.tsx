import type { Metadata } from "next";

import { parseCategoriaOrdenar } from "../dashboard/navegacion-cliente";

import { OrdenarProvisional } from "./ordenar-provisional";

export const metadata: Metadata = {
  title: "Ordenar · Ofibites",
};

interface OrdenarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Provisional: la pantalla real llega con T-19.
/** `?categoria=bebidas|desayunos` (desde las cards del dashboard). Un valor desconocido se ignora. */
export default async function OrdenarPage({ searchParams }: OrdenarPageProps) {
  const { categoria } = await searchParams;

  return <OrdenarProvisional categoria={parseCategoriaOrdenar(categoria)} />;
}
