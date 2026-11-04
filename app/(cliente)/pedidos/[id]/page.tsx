import type { Metadata } from "next";

import { DetallePedido } from "./_components/detalle-pedido";

export const metadata: Metadata = {
  title: "Detalle del pedido · Ofibites",
};

interface PedidoDetallePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Detalle de un pedido (Figma `3568:1611`) con su estado de pago y factura (T-06d: `use-pago-pedido.tsx`). Sobre
 * `GET /orders/:id` real; "Repetir pedido" abre el paso de confirmación del Figma antes de llamar a
 * `POST /cart/repeat/:orderId` (ver DECISIONES T-28b). `?pagar=1` abre "Registrar el pago".
 */
export default async function PedidoDetallePage({ params }: PedidoDetallePageProps) {
  const { id } = await params;
  return <DetallePedido orderId={id} />;
}
