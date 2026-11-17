import type { Metadata } from "next";

// Directo del archivo: el índice arrastra el store de sesión (cliente) a este Server Component.
import { parseEscenarioQaPedido } from "@/domain/hooks/orders/pedido-qa";

import { DetallePedido } from "./_components/detalle-pedido";

export const metadata: Metadata = {
  title: "Detalle del pedido · Ofibites",
};

interface PedidoDetallePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Detalle de un pedido (Figma `3632:1686`, `3634:1842`, `3628:1608`, `3729:3090`) con su estado de pago y factura
 * (T-06d: `use-pago-pedido.tsx`) y los datos de T-38 (comensales, cajas y complementos, seguimiento). "Repetir
 * pedido" lleva a `/pedidos/<id>/repetir`. `?pagar=1` abre "Registrar el pago". En desarrollo,
 * `?qa=aprobado|pendiente|rechazado|credito|viejo|cancelado` pinta el pedido de ejemplo del Figma.
 */
export default async function PedidoDetallePage({ params, searchParams }: PedidoDetallePageProps) {
  const { id } = await params;
  const { qa } = await searchParams;
  const escenario = process.env.NODE_ENV === "production" ? undefined : parseEscenarioQaPedido(qa);
  return <DetallePedido orderId={id} qa={escenario} />;
}
