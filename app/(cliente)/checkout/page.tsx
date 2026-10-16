import type { Metadata } from "next";

import { CheckoutEntrega } from "./_components/checkout-entrega";

export const metadata: Metadata = {
  title: "Checkout · Ofibites",
};

/** Paso 1 del checkout, "Entrega" (Figma 3462:2094). Sin carrito o con el carrito vacío vuelve a `/carrito`. */
export default function CheckoutPage() {
  return <CheckoutEntrega />;
}
