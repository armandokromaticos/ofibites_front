// Datos de QA del detalle del pedido y del editor "Repetir pedido" (T-38d), solo en desarrollo: las páginas leen
// `?qa=` desde `searchParams` y lo anulan en producción (mismo patrón que `?estado=` del Dashboard y de
// "Pedidos realizados"). Sirven para ver el Figma (3632:1686, 3634:1842, 3628:1608, 3729:3090, 3730:3130) mientras
// el back de T-38c no está desplegado. Los importes salen del Figma; la vista previa imita la regla del servidor
// (precios de hoy, IVA 16 %, envío 0 desde $150) solo para QA: en la app real los calcula siempre el back.

import {
  CartSummary,
  InvoicePayment,
  Order,
  OrderInvoice,
  OrderItem,
  OrderStatusHistoryEntry,
  RepeatCartResponse,
  RepeatOrderRequest,
  RepeatPreviewLine,
  RepeatPreviewResponse,
} from "@/domain/types";

/** Variantes del detalle: las 4 de pago del Figma, un pedido anterior al historial y uno cancelado. */
export type EscenarioQaPedido = "aprobado" | "pendiente" | "rechazado" | "credito" | "viejo" | "cancelado";

const ESCENARIOS_PEDIDO: readonly EscenarioQaPedido[] = [
  "aprobado",
  "pendiente",
  "rechazado",
  "credito",
  "viejo",
  "cancelado",
];

export function parseEscenarioQaPedido(value: unknown): EscenarioQaPedido | undefined {
  return ESCENARIOS_PEDIDO.find((escenario) => escenario === value);
}

/** Variantes del editor de repetir: precios iguales, un precio que subió, una línea agotada, nada disponible y estados. */
export type EscenarioQaRepetir = "normal" | "subio" | "agotado" | "nada" | "cargando" | "error";

const ESCENARIOS_REPETIR: readonly EscenarioQaRepetir[] = ["normal", "subio", "agotado", "nada", "cargando", "error"];

export function parseEscenarioQaRepetir(value: unknown): EscenarioQaRepetir | undefined {
  return ESCENARIOS_REPETIR.find((escenario) => escenario === value);
}

const centavos = (valor: number) => Math.round(valor * 100) / 100;

function linea(
  id: string,
  datos: Pick<OrderItem, "kind" | "name" | "sizeLabel" | "sizeDescription" | "description" | "servings" | "quantity"> & {
    unitPrice: number;
  },
): OrderItem {
  return {
    id,
    productId: `qa-producto-${id}`,
    productSizeId: datos.sizeLabel ? `qa-tamano-${id}` : null,
    comboId: null,
    image: null,
    modifiers: [],
    ...datos,
    subtotal: centavos(datos.unitPrice * datos.quantity),
  };
}

const LINEAS_FIGMA: OrderItem[] = [
  linea("qa-linea-1", {
    kind: "box",
    name: "Coffee Break Clásico",
    sizeLabel: "caja individual",
    sizeDescription: null,
    description: "Tequeños de queso, pastelito criollo, mini sándwich y servilleta Ofibites",
    servings: 1,
    quantity: 40,
    unitPrice: 22,
  }),
  linea("qa-linea-2", {
    kind: "complement",
    name: "Mini pastelitos surtidos",
    sizeLabel: "bandeja de 10",
    sizeDescription: "Bandeja para compartir · 10 piezas",
    description: "Pastelitos de queso, carne y pollo.",
    servings: null,
    quantity: 10,
    unitPrice: 6,
  }),
  linea("qa-linea-3", {
    kind: "complement",
    name: "Jugo de parchita",
    sizeLabel: "botella 250 ml",
    sizeDescription: "Botella individual · 250 ml",
    description: null,
    servings: null,
    quantity: 40,
    unitPrice: 2.44,
  }),
  linea("qa-linea-4", {
    kind: "complement",
    name: "Café de filtro",
    sizeLabel: "taza adicional",
    sizeDescription: "Taza adicional por persona",
    description: null,
    servings: null,
    quantity: 40,
    unitPrice: 1,
  }),
];

const PAGO_BASE: Omit<InvoicePayment, "status" | "reviewedAt" | "rejectionReason"> = {
  id: "qa-pago-1",
  method: "MOBILE_PAYMENT",
  bank: "Banesco",
  reference: "00218843",
  amount: 1250.02,
  paymentDate: "2026-09-26T00:00:00.000Z",
  submittedAt: "2026-09-26T18:02:00.000Z",
  submittedBy: { id: "qa-usuario-1", name: "María Gabriela Pérez" },
  proof: { fileName: "pago-movil.jpg", mimeType: "image/jpeg", sizeBytes: 182_000 },
};

function factura(escenario: EscenarioQaPedido): OrderInvoice | null {
  if (escenario === "viejo" || escenario === "cancelado") return null;
  const base: OrderInvoice = {
    id: "qa-factura-1",
    invoiceNumber: "F-2026-001243",
    status: "PENDING",
    paymentStatus: "PENDING",
    issuedAt: "2026-09-24T13:15:40.000Z",
    dueDate: "2026-09-26T00:00:00.000Z",
    creditDays: 0,
    isCredit: false,
    isOverdue: false,
    daysUntilDue: 2,
    total: 1250.02,
    amountPaid: 0,
    balance: 1250.02,
    paidAt: null,
    hasFiscalPdf: false,
    fiscalNumber: null,
    latestPayment: null,
  };
  if (escenario === "aprobado") {
    return {
      ...base,
      status: "PAID",
      paymentStatus: "PAID",
      daysUntilDue: null,
      amountPaid: 1250.02,
      balance: 0,
      paidAt: "2026-09-27T13:40:00.000Z",
      latestPayment: { ...PAGO_BASE, status: "APPROVED", reviewedAt: "2026-09-27T13:40:00.000Z", rejectionReason: null },
    };
  }
  if (escenario === "pendiente") {
    return {
      ...base,
      paymentStatus: "IN_REVIEW",
      latestPayment: { ...PAGO_BASE, status: "PENDING_REVIEW", reviewedAt: null, rejectionReason: null },
    };
  }
  if (escenario === "rechazado") {
    return {
      ...base,
      paymentStatus: "REJECTED",
      latestPayment: {
        ...PAGO_BASE,
        status: "REJECTED",
        reviewedAt: "2026-09-27T13:40:00.000Z",
        rejectionReason: "El monto del comprobante no coincide con el de la factura.",
      },
    };
  }
  return {
    ...base,
    invoiceNumber: "F-2026-001245",
    issuedAt: "2026-10-07T14:00:00.000Z",
    dueDate: "2026-10-26T00:00:00.000Z",
    creditDays: 30,
    isCredit: true,
    daysUntilDue: 9,
  };
}

const HISTORIAL_ENTREGADO: OrderStatusHistoryEntry[] = [
  { status: "CREATED", statusGroup: "received", at: "2026-09-24T13:15:00.000Z", estimated: false },
  { status: "CONFIRMED", statusGroup: "scheduled", at: "2026-09-24T13:15:40.000Z", estimated: false },
  { status: "IN_PREPARATION", statusGroup: "scheduled", at: "2026-09-25T22:00:00.000Z", estimated: false },
  { status: "IN_TRANSIT", statusGroup: "in_transit", at: "2026-09-26T15:40:00.000Z", estimated: false },
  { status: "DELIVERED", statusGroup: "delivered", at: "2026-09-26T16:24:00.000Z", estimated: false },
];

/** Pedido de ejemplo del Figma para la variante pedida, con el id de la URL. */
export function pedidoQa(escenario: EscenarioQaPedido, orderId: string): Order {
  const credito = escenario === "credito";
  const viejo = escenario === "viejo";
  const subtotal = 1077.6;
  const tax = viejo ? 0 : 172.42;
  const base: Order = {
    id: orderId,
    userId: "qa-usuario-1",
    couponId: null,
    companyId: "qa-empresa",
    branchId: null,
    departmentId: "qa-departamento-1",
    createdById: "qa-usuario-1",
    deliveryAddressId: "qa-sede-1",
    deliveryDate: credito ? "2026-09-30T00:00:00.000Z" : "2026-09-26T00:00:00.000Z",
    deliveryTime: credito ? "08:30" : "12:30",
    notes: null,
    priority: "MEDIUM",
    status: "DELIVERED",
    statusGroup: "delivered",
    subtotal,
    discount: 0,
    tax,
    shipping: 0,
    total: centavos(subtotal + tax),
    orderNumber: credito ? "001244" : "001243",
    receiverName: "Yelitza Ramos",
    receiverPhone: "+58 212 555 3311",
    addressDetail: "piso 8",
    addressReference: null,
    createdAt: credito ? "2026-09-26T14:42:00.000Z" : "2026-09-24T13:15:00.000Z",
    updatedAt: "2026-09-26T16:24:00.000Z",
    items: LINEAS_FIGMA,
    invoice: factura(escenario),
    taxRate: viejo ? 0 : 0.16,
    diners: 40,
    user: credito
      ? { id: "qa-usuario-2", name: "Luis Alberto Márquez" }
      : { id: "qa-usuario-1", name: "María Gabriela Pérez" },
    department: credito ? { id: "qa-departamento-2", name: "Operaciones" } : { id: "qa-departamento-1", name: "Recursos Humanos" },
    statusHistory: HISTORIAL_ENTREGADO,
  };
  if (credito) {
    return {
      ...base,
      status: "CONFIRMED",
      statusGroup: "scheduled",
      statusHistory: [
        { status: "CREATED", statusGroup: "received", at: "2026-09-26T14:42:00.000Z", estimated: false },
        { status: "CONFIRMED", statusGroup: "scheduled", at: "2026-09-26T14:42:30.000Z", estimated: false },
      ],
    };
  }
  if (viejo) {
    // Backfill de T-38c: CREATED exacto y el estado actual en `updatedAt`, estimado; los intermedios, sin fila.
    return {
      ...base,
      statusHistory: [
        { status: "CREATED", statusGroup: "received", at: "2026-09-24T13:15:00.000Z", estimated: false },
        { status: "DELIVERED", statusGroup: "delivered", at: "2026-09-26T16:24:00.000Z", estimated: true },
      ],
    };
  }
  if (escenario === "cancelado") {
    return {
      ...base,
      status: "CANCELLED",
      statusGroup: "cancelled",
      statusHistory: [
        { status: "CREATED", statusGroup: "received", at: "2026-09-24T13:15:00.000Z", estimated: false },
        { status: "CANCELLED", statusGroup: "cancelled", at: "2026-09-24T15:02:00.000Z", estimated: false },
      ],
    };
  }
  return base;
}

/** Precio de hoy de cada línea en el escenario (`null` = ya no está disponible). */
function precioHoy(escenario: EscenarioQaRepetir, item: OrderItem): number | null {
  if (escenario === "nada") return null;
  if (escenario === "agotado" && item.id === "qa-linea-3") return null;
  if (escenario === "subio" && item.id === "qa-linea-1") return 23.5;
  return item.unitPrice;
}

/** Vista previa simulada sobre el pedido de ejemplo (misma forma que `POST /cart/repeat/:orderId/preview`). */
export function vistaPreviaQa(
  escenario: EscenarioQaRepetir,
  orderId: string,
  body?: RepeatOrderRequest,
): RepeatPreviewResponse {
  const order = pedidoQa("aprobado", orderId);
  const elegidas = body?.items
    ? new Map(body.items.map((item) => [item.orderItemId, item.quantity]))
    : null;
  const lines: RepeatPreviewLine[] = (order.items ?? []).map((item) => {
    const included = elegidas ? elegidas.has(item.id) : true;
    const quantity = included ? (elegidas?.get(item.id) ?? item.quantity) : 0;
    const actual = precioHoy(escenario, item);
    const disponible = actual !== null;
    return {
      orderItemId: item.id,
      productId: item.productId,
      productSizeId: item.productSizeId,
      comboId: item.comboId,
      kind: item.kind,
      name: item.name,
      image: item.image,
      sizeLabel: item.sizeLabel,
      sizeDescription: item.sizeDescription,
      description: item.description,
      servings: item.servings,
      included,
      orderQuantity: item.quantity,
      quantity,
      orderUnitPrice: item.unitPrice ?? 0,
      currentUnitPrice: actual,
      priceChanged: disponible && actual !== item.unitPrice,
      subtotal: disponible && included ? centavos(actual * quantity) : null,
      isAvailable: disponible,
      unavailableCode: disponible ? null : "UNAVAILABLE",
      unavailableReason: disponible ? null : "Ya no está disponible",
    };
  });
  const cuentan = lines.filter((line) => line.included && line.isAvailable);
  const subtotal = centavos(cuentan.reduce((total, line) => total + (line.subtotal ?? 0), 0));
  const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 5;
  const tax = centavos(subtotal * 0.16);
  const summary: CartSummary = {
    subtotal,
    discount: 0,
    taxRate: 0.16,
    tax,
    shipping,
    freeShippingThreshold: 150,
    total: centavos(subtotal + tax + shipping),
  };
  const cajas = cuentan.filter((line) => line.kind === "box");
  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      deliveryAddressId: order.deliveryAddressId,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      diners: order.diners,
      total: order.total,
      addressDetail: order.addressDetail,
      addressReference: order.addressReference,
    },
    lines,
    diners: cajas.length
      ? cajas.reduce((total, line) => total + (line.servings ?? 0) * line.quantity, 0)
      : null,
    summary,
    priceChangedCount: cuentan.filter((line) => line.priceChanged).length,
  };
}

/** Respuesta simulada del repetir: `cart` en `null` para no pisar el carrito real de la caché. */
export function repetirQa(
  escenario: EscenarioQaRepetir,
  orderId: string,
  body: RepeatOrderRequest,
): Omit<RepeatCartResponse, "cart"> & { cart: null } {
  const preview = vistaPreviaQa(escenario, orderId, body);
  const elegidas = preview.lines.filter((line) => line.included);
  return {
    cart: null,
    added: elegidas.filter((line) => line.isAvailable).length,
    skipped: elegidas
      .filter((line) => !line.isAvailable)
      .map((line) => ({
        productId: line.productId,
        comboId: line.comboId,
        name: line.name,
        reason: line.unavailableReason ?? "Ya no está disponible",
      })),
  };
}

/** Espera simulada de red (la vista previa con debounce se ve recalcular). */
export function esperaQa<T>(valor: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}
