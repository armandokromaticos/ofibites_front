import type { Metadata } from "next";

import { CheckoutRevision } from "../_components/checkout-revision";

export const metadata: Metadata = {
  title: "Revisa tu pedido · Ofibites",
};

/** Paso 2 del checkout, "Revisión" (fase 1, en lugar del pago del Figma 3465:2846). Sin el paso 1 vuelve a él. */
export default function CheckoutRevisionPage() {
  return <CheckoutRevision />;
}
