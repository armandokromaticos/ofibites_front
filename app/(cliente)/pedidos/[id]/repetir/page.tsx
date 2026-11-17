import type { Metadata } from "next";

// Directo del archivo: el índice arrastra el store de sesión (cliente) a este Server Component.
import { parseEscenarioQaRepetir } from "@/domain/hooks/orders/pedido-qa";

import { RepetirPedido } from "./_components/repetir-pedido";

export const metadata: Metadata = {
  title: "Repetir pedido · Ofibites",
};

interface RepetirPedidoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Editor "Repetir pedido" (Figma `3730:3130`, `3731:3396`; T-38d). En desarrollo,
 * `?qa=normal|subio|agotado|nada|cargando|error` usa datos de ejemplo sin llamar al back.
 */
export default async function RepetirPedidoPage({ params, searchParams }: RepetirPedidoPageProps) {
  const { id } = await params;
  const { qa } = await searchParams;
  const escenario = process.env.NODE_ENV === "production" ? undefined : parseEscenarioQaRepetir(qa);
  return <RepetirPedido orderId={id} qa={escenario} />;
}
