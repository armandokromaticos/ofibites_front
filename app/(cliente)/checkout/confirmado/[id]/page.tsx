import type { Metadata } from "next";

import { PedidoConfirmado } from "../../_components/pedido-confirmado";

export const metadata: Metadata = {
  title: "Pedido confirmado · Ofibites",
};

interface PedidoConfirmadoPageProps {
  params: Promise<{ id: string }>;
}

/** "Pedido confirmado" (Figma 3465:3585) de un pedido recién creado en el checkout. */
export default async function PedidoConfirmadoPage({ params }: PedidoConfirmadoPageProps) {
  const { id } = await params;
  return <PedidoConfirmado orderId={id} />;
}
