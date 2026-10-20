import type { Metadata } from "next";

// Directo del archivo: el índice arrastra el store de sesión (cliente) a este Server Component.
import { parseEstadoQaPedidos } from "@/domain/hooks/orders/estado-qa";

import { PedidosCliente } from "./_components/pedidos-cliente";

export const metadata: Metadata = {
  title: "Pedidos realizados · Ofibites",
};

interface PedidosPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** `?estado=cargando|vacio|error` fuerza un estado para QA, solo en desarrollo (como `/dashboard`). */
export default async function PedidosPage({ searchParams }: PedidosPageProps) {
  const { estado } = await searchParams;
  const estadoQa = process.env.NODE_ENV === "production" ? undefined : parseEstadoQaPedidos(estado);

  return <PedidosCliente estadoQa={estadoQa} />;
}
