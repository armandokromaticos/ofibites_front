"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  useCanReportPayments,
  useCreditLine,
  useDownloadInvoice,
  useDownloadPaymentProof,
  useInvoicePdf,
  useObjectUrl,
  usePaymentProof,
  useSubmitInvoicePayment,
  useWithdrawInvoicePayment,
} from "@/domain/hooks/invoices";
import {
  dueDistanceLabel,
  invoiceDisplayNumber,
  invoiceFileName,
  isInvoicePayable,
  PAYMENT_METHOD_LABELS,
  PAYMENT_RECORD_STATUS_VIEW,
  paymentStatusDetailView,
  PaymentStatusView,
} from "@/domain/models";
import { useAuthStore } from "@/domain/stores";
import { Order } from "@/domain/types";
import { caracasNow, formatFileSize, formatPrice, getApiErrorMessage } from "@/shared/utils";
import {
  AtButton,
  AtSkeleton,
  MlCreditLineCard,
  MlNoticeBannerProps,
  MlStatusNote,
  MlStatusNoteTone,
  OrConfirmModal,
  OrDocumentViewer,
  OrInvoicePaymentModal,
  OrInvoicePaymentModalValues,
  OrPaymentProofModal,
  OrPaymentProofModalRow,
} from "@/ui/atomic";

import { rutaPedido } from "../../../_navegacion";
import {
  comprobanteVigente,
  cuando,
  cuandoCorto,
  desdeHace,
  diaMes,
  diaMesPura,
  esHoy,
  esPdf,
  fechaPura,
  hora,
  mensajeErrorPago,
  rutaVolverSegura,
} from "../../_data/textos-pago";

type Modal = "pagar" | "comprobante" | "visor-comprobante" | "visor-factura" | "cancelar-envio" | null;

/** Acción de la cabecera del pedido (junto a "Repetir pedido"). */
export interface AccionCabeceraPago {
  label: string;
  onPress: () => void;
  variant: "primary" | "bordered" | "accent";
}

const AVISO_ID = "pedido-aviso-pago";
const CLASE_ENLACE =
  "self-center rounded-sm text-xs font-semibold text-strength-medium-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

function enfocar(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

/**
 * Estado de pago del detalle del pedido (T-06d): aviso de cabecera, chip, acción de la cabecera, "Método de pago",
 * bloque de pago del total (nota, línea de crédito y acciones) y los modales (comprobante, vistas ampliadas, registrar
 * el pago y cancelar el envío). Figma: aprobado `3632:1686`, por confirmar `3634:1842`, rechazado `3628:1608`, crédito
 * `3724:3013`, crédito vencido `3726:3051` y pagar factura `3567:1374`/`3645:2062`. Sin factura (pedido sin confirmar,
 * anterior a T-06 u `OPERATOR`) no pinta nada.
 * `?pagar=1` abre el formulario al entrar (menú "···" de la lista y aviso del carrito); `?volver=/carrito` ofrece volver.
 */
export function usePagoPedido(order: Order | undefined) {
  const invoice = order?.invoice ?? null;
  const numero = order ? (order.orderNumber ?? order.id.slice(-8).toUpperCase()) : "";
  const ultimo = comprobanteVigente(invoice);
  const puedePagar = useCanReportPayments();
  const companyName = useAuthStore(
    (state) => state.memberships.find((m) => m.companyId === state.activeCompanyId)?.companyName ?? null,
  );
  const searchParams = useSearchParams();
  const volver = rutaVolverSegura(searchParams.get("volver"));
  const pagable = Boolean(invoice && puedePagar && isInvoicePayable(invoice));

  // `?pagar=1` abre "Registrar el pago" una sola vez, si la factura admite pago y el usuario puede pagar. El pedido
  // llega después del primer render: la petición se guarda y se resuelve en cuanto hay datos (sin efecto).
  const [pagoPedido, setPagoPedido] = useState(() => searchParams.get("pagar") === "1");
  if (pagoPedido && order && !pagable) setPagoPedido(false);
  const [modalElegido, setModalElegido] = useState<Modal>(null);
  const modal: Modal = modalElegido ?? (pagoPedido && pagable ? "pagar" : null);
  const setModal = (siguiente: Modal) => {
    setPagoPedido(false);
    setModalElegido(siguiente);
  };
  // El visor se abre encima del modal del comprobante: al cerrarlo se vuelve a él.
  const [visorDesdeComprobante, setVisorDesdeComprobante] = useState(false);
  const [aperturaPago, setAperturaPago] = useState(0);
  const [hoy] = useState(() => caracasNow().date);
  const [aviso, setAviso] = useState<{ tone: MlStatusNoteTone; texto: string } | null>(null);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const creditLineQuery = useCreditLine({ enabled: Boolean(invoice?.isCredit) });
  const submit = useSubmitInvoicePayment();
  const withdraw = useWithdrawInvoicePayment();
  const descargarFactura = useDownloadInvoice();
  const descargarComprobante = useDownloadPaymentProof();

  const verComprobante = modal === "comprobante" || modal === "visor-comprobante";
  // Los archivos privados solo se descargan al abrir el comprobante o la factura.
  const proofQuery = usePaymentProof(invoice?.id, ultimo?.id, {
    enabled: Boolean(ultimo) && verComprobante,
  });
  const pdfQuery = useInvoicePdf(invoice?.id, { enabled: modal === "visor-factura" });
  const proofUrl = useObjectUrl(proofQuery.data?.blob);
  const pdfUrl = useObjectUrl(pdfQuery.data?.blob);

  if (!order || !invoice) {
    return {
      invoice: null,
      chip: null,
      banner: null,
      accionCabecera: null,
      metodoPago: null,
      resumen: null,
      aviso: null,
      modales: null,
    } as const;
  }

  const numeroFactura = invoiceDisplayNumber(invoice);
  const chip: PaymentStatusView = paymentStatusDetailView(invoice);
  const estado = invoice.paymentStatus;
  const parcial = invoice.status === "PENDING" && invoice.amountPaid > 0;
  const vencida = fechaPura(invoice.dueDate);
  /** Vencida con el último comprobante rechazado (el derivado dice `OVERDUE`). */
  const rechazadoVencida = estado === "OVERDUE" && ultimo?.status === "REJECTED";

  const quitarPagarDeLaUrl = () => {
    if (searchParams.get("pagar") === null) return;
    // `null` como estado: Next no trata la entrada como suya y `useSearchParams` no se queda con el valor viejo.
    const query = new URLSearchParams(searchParams.toString());
    query.delete("pagar");
    const resto = query.toString();
    window.history.replaceState(null, "", `${rutaPedido(order.id)}${resto ? `?${resto}` : ""}`);
  };

  const abrirPago = () => {
    setErrorPago(null);
    setErrorAccion(null);
    setAperturaPago((n) => n + 1);
    setModal("pagar");
  };
  const abrirComprobante = () => {
    setErrorAccion(null);
    setModal("comprobante");
  };
  const abrirFactura = () => {
    setErrorAccion(null);
    setVisorDesdeComprobante(false);
    setModal("visor-factura");
  };
  const cerrar = () => {
    if (modal === "pagar") quitarPagarDeLaUrl();
    if ((modal === "visor-comprobante" || modal === "visor-factura") && visorDesdeComprobante) {
      setVisorDesdeComprobante(false);
      setModal("comprobante");
      return;
    }
    setModal(null);
  };

  const bajarFactura = () => {
    setErrorAccion(null);
    descargarFactura.mutateAsync(invoice).catch((err: unknown) => {
      setErrorAccion(getApiErrorMessage(err, "No pudimos descargar la factura. Inténtalo de nuevo."));
      if (!modal) enfocar(AVISO_ID);
    });
  };
  const bajarComprobante = () => {
    if (!ultimo) return;
    setErrorAccion(null);
    descargarComprobante
      .mutateAsync({ invoiceId: invoice.id, paymentId: ultimo.id, fileName: ultimo.proof.fileName })
      .catch((err: unknown) => setErrorAccion(getApiErrorMessage(err, "No pudimos descargar el comprobante. Inténtalo de nuevo.")));
  };

  const enviarPago = (valores: OrInvoicePaymentModalValues) => {
    if (submit.isPending) return;
    setErrorPago(null);
    const reemplaza = estado === "IN_REVIEW" && ultimo?.status === "PENDING_REVIEW" ? ultimo.id : undefined;
    submit
      .mutateAsync({
        invoiceId: invoice.id,
        orderId: order.id,
        body: {
          method: valores.method,
          paymentDate: valores.paymentDate,
          reference: valores.reference,
          amount: valores.amount,
          bank: valores.bank || undefined,
          file: valores.file,
          replacesPaymentId: reemplaza,
        },
      })
      .then(() => {
        quitarPagarDeLaUrl();
        setModal(null);
        setAviso({
          tone: "success",
          texto: reemplaza
            ? "Enviamos el nuevo comprobante y cancelamos el anterior. Finanzas lo revisa en máximo 1 día hábil."
            : "Recibimos tu comprobante. Finanzas lo revisa en máximo 1 día hábil; te avisamos por la campana.",
        });
        enfocar(AVISO_ID);
      })
      .catch((err: unknown) => setErrorPago(mensajeErrorPago(err)));
  };

  const cancelarEnvio = () => {
    if (!ultimo || withdraw.isPending) return;
    withdraw
      .mutateAsync({ invoiceId: invoice.id, orderId: order.id, paymentId: ultimo.id })
      .then(() => {
        setModal(null);
        setAviso({ tone: "neutral", texto: "Cancelaste el envío del comprobante. La factura vuelve a estar pendiente de pago." });
        enfocar(AVISO_ID);
      })
      .catch((err: unknown) => {
        setModal(null);
        setAviso({ tone: "danger", texto: getApiErrorMessage(err, "No pudimos cancelar el envío. Inténtalo de nuevo.") });
        enfocar(AVISO_ID);
      });
  };

  // --- Aviso de cabecera (banner) -------------------------------------------------------------------------------
  let banner: MlNoticeBannerProps | null = null;
  if (estado === "PAID") {
    const recibido = ultimo?.status === "APPROVED" ? ultimo : null;
    banner = {
      tone: "success",
      title: "Finanzas confirmó tu pago",
      children: [
        recibido
          ? `Recibimos ${formatPrice(invoice.amountPaid)} el ${diaMesPura(recibido.paymentDate)} por ${PAYMENT_METHOD_LABELS[recibido.method]}.`
          : `Recibimos ${formatPrice(invoice.amountPaid)}.`,
        invoice.paidAt
          ? `La factura ${numeroFactura} quedó saldada el ${diaMes(invoice.paidAt)} a las ${hora(invoice.paidAt)}.`
          : `La factura ${numeroFactura} quedó saldada.`,
      ].join(" "),
    };
  } else if (estado === "IN_REVIEW" && ultimo) {
    banner = {
      tone: "warning",
      title: "Recibimos tu comprobante, falta que finanzas lo confirme",
      children: [
        `Enviado ${cuando(ultimo.submittedAt)} por ${formatPrice(ultimo.amount)} · Ref. ${ultimo.reference}.`,
        "Te avisamos en máximo 1 día hábil. Tu pedido sigue su curso normal.",
        invoice.isOverdue ? `La factura venció el ${vencida}: hasta que se confirme el pago tu empresa no puede crear pedidos nuevos.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      actions: [
        { label: "Ver comprobante", onPress: abrirComprobante, variant: "bordered" },
        ...(puedePagar
          ? [{ label: "Cancelar envío", onPress: () => setModal("cancelar-envio"), variant: "danger-bordered" as const }]
          : []),
      ],
    };
  } else if (estado === "REJECTED" && ultimo) {
    banner = {
      tone: "danger",
      title: "Finanzas rechazó tu comprobante de pago",
      children: [
        ultimo.rejectionReason ? `${ultimo.rejectionReason.replace(/\.$/, "")}.` : "",
        ultimo.reviewedAt ? `Revisado el ${diaMes(ultimo.reviewedAt)} a las ${hora(ultimo.reviewedAt)}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      actions: [
        { label: "Ver comprobante", onPress: abrirComprobante, variant: "bordered" },
        ...(pagable ? [{ label: "Subir otro comprobante", onPress: abrirPago, variant: "accent" as const }] : []),
      ],
    };
  } else if (estado === "OVERDUE") {
    const atraso = invoice.daysUntilDue !== null ? `, ${dueDistanceLabel(invoice.daysUntilDue)}` : "";
    banner = {
      tone: "danger",
      title: "La factura de este pedido está vencida",
      children: [
        `${numeroFactura} venció el ${vencida}${atraso}. Mientras siga vencida tu empresa no puede crear pedidos nuevos.`,
        // `OVERDUE` tapa a `REJECTED` en el estado derivado: el motivo del último rechazo no se pierde.
        rechazadoVencida
          ? `Finanzas rechazó tu último comprobante${ultimo?.rejectionReason ? `: ${ultimo.rejectionReason.replace(/\.$/, "")}` : ""}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      actions: rechazadoVencida ? [{ label: "Ver comprobante", onPress: abrirComprobante, variant: "bordered" }] : [],
    };
  } else if (estado === "PENDING" && invoice.isCredit) {
    banner = {
      tone: "credit",
      title: "Este pedido se cargó a tu línea de crédito",
      children: `La factura ${numeroFactura} vence el ${vencida}. No hace falta subir comprobante: se paga al vencimiento.`,
    };
  }

  // --- Acción de la cabecera ------------------------------------------------------------------------------------
  let accionCabecera: AccionCabeceraPago | null = null;
  if (estado === "PAID") {
    accionCabecera = ultimo
      ? { label: "Ver comprobante", onPress: abrirComprobante, variant: "bordered" }
      : { label: "Ver factura", onPress: abrirFactura, variant: "bordered" };
  } else if (estado === "IN_REVIEW") {
    accionCabecera = { label: "Ver comprobante", onPress: abrirComprobante, variant: "primary" };
  } else if (estado === "REJECTED" && pagable) {
    accionCabecera = { label: "Subir comprobante", onPress: abrirPago, variant: "primary" };
  } else if (estado === "PENDING" && !invoice.isCredit && pagable) {
    accionCabecera = { label: "Pagar factura", onPress: abrirPago, variant: "primary" };
  } else {
    accionCabecera = { label: "Ver factura", onPress: abrirFactura, variant: "bordered" };
  }

  // --- "Método de pago" (hueco del contrato, punto 10) ----------------------------------------------------------
  const metodoPago = ultimo
    ? PAYMENT_METHOD_LABELS[ultimo.method]
    : invoice.isCredit
      ? `Crédito corporativo · ${invoice.creditDays} días`
      : "Contado";

  // --- Bloque de pago del total del pedido ---------------------------------------------------------------------
  const restoParcial = parcial ? ` Pagado ${formatPrice(invoice.amountPaid)} · saldo ${formatPrice(invoice.balance)}.` : "";
  let nota: { tone: MlStatusNoteTone; title: string; texto: string };
  switch (estado) {
    case "PAID":
      nota = {
        tone: "success",
        title: "Pago completado",
        texto:
          ultimo?.status === "APPROVED" && ultimo.reviewedAt
            ? `Validado por Finanzas el ${diaMes(ultimo.reviewedAt)} · Ref. ${ultimo.reference}`
            : invoice.paidAt
              ? `Saldada el ${diaMes(invoice.paidAt)}`
              : `Factura ${numeroFactura}`,
      };
      break;
    case "IN_REVIEW":
      nota = {
        tone: "warning",
        title: "Pago por confirmar",
        texto: ultimo
          ? `Comprobante enviado ${esHoy(ultimo.submittedAt) ? "hoy" : `el ${diaMes(ultimo.submittedAt)}`} · respuesta en 1 día hábil`
          : "Respuesta en 1 día hábil",
      };
      break;
    case "REJECTED":
      nota = {
        tone: "danger",
        title: "Comprobante rechazado",
        texto: `${ultimo?.reviewedAt ? `Revisado el ${diaMes(ultimo.reviewedAt)} · ` : ""}la factura vence el ${diaMesPura(invoice.dueDate)}`,
      };
      break;
    case "OVERDUE":
      nota = {
        tone: "danger",
        title: "Factura vencida",
        texto: `${numeroFactura} · venció el ${vencida}${
          invoice.daysUntilDue !== null && invoice.daysUntilDue < 0
            ? ` · ${Math.abs(invoice.daysUntilDue)} ${Math.abs(invoice.daysUntilDue) === 1 ? "día" : "días"} de atraso`
            : ""
        }${rechazadoVencida ? " · comprobante rechazado" : ""}`,
      };
      break;
    case "VOID":
      nota = { tone: "neutral", title: "Factura anulada", texto: `${numeroFactura} · el pedido se canceló y la factura no se cobra.` };
      break;
    default:
      nota = invoice.isCredit
        ? {
            tone: "warning",
            title: "Factura a crédito",
            texto: `${numeroFactura} · vence el ${vencida}${invoice.daysUntilDue !== null ? ` · ${dueDistanceLabel(invoice.daysUntilDue)}` : ""}`,
          }
        : { tone: "danger", title: "Pago pendiente", texto: `Vence el ${vencida}` };
  }

  const creditLine = creditLineQuery.data?.creditLine ?? null;
  let lineaCredito: ReactNode = null;
  if (invoice.isCredit && estado !== "PAID" && estado !== "VOID") {
    if (creditLineQuery.isPending) {
      lineaCredito = <AtSkeleton className="h-[150px] rounded-control" />;
    } else if (creditLine) {
      const bloqueada = creditLine.isBlocked;
      lineaCredito = (
        <MlCreditLineCard
          companyName={companyName}
          committedLabel={formatPrice(creditLine.committed)}
          availableLabel={
            creditLine.available === null ? null : formatPrice(bloqueada ? 0 : creditLine.available)
          }
          limitLabel={creditLine.creditLimit === null ? null : formatPrice(creditLine.creditLimit)}
          usedRatio={creditLine.creditLimit ? creditLine.committed / creditLine.creditLimit : null}
          isBlocked={bloqueada}
          note={
            bloqueada
              ? "El cupo se libera apenas Finanzas registre el pago de la factura vencida."
              : "El cupo se libera cuando Finanzas registra el pago de la factura."
          }
        />
      );
    }
  }

  // Botón principal del bloque y enlaces bajo él, según el estado (Figma).
  let botonResumen: ReactNode = null;
  const enlaces: { label: string; onPress: () => void }[] = [];
  if (estado === "PAID") {
    if (ultimo) enlaces.push({ label: "Ver comprobante de pago", onPress: abrirComprobante });
  } else if (estado === "IN_REVIEW") {
    botonResumen = (
      <AtButton size="lg" variant="bordered" className="h-[52px] w-full border-1 border-primary text-sm text-primary" onPress={abrirComprobante}>
        Ver comprobante enviado
      </AtButton>
    );
    if (puedePagar) enlaces.push({ label: "Enviar otro comprobante", onPress: abrirPago });
  } else if (estado === "REJECTED") {
    if (pagable) {
      botonResumen = (
        <AtButton size="lg" className="h-[52px] w-full bg-secondary-600 text-sm text-white" onPress={abrirPago}>
          Subir otro comprobante
        </AtButton>
      );
    }
    if (ultimo) enlaces.push({ label: "Ver comprobante rechazado", onPress: abrirComprobante });
  } else if (estado === "OVERDUE" && pagable) {
    botonResumen = (
      <AtButton size="lg" className="h-[52px] w-full bg-secondary-600 text-sm text-white" onPress={abrirPago}>
        Pagar factura vencida
      </AtButton>
    );
    if (rechazadoVencida) enlaces.push({ label: "Ver comprobante rechazado", onPress: abrirComprobante });
  } else if (estado === "OVERDUE" && rechazadoVencida) {
    enlaces.push({ label: "Ver comprobante rechazado", onPress: abrirComprobante });
  } else if (estado === "PENDING" && pagable) {
    botonResumen = invoice.isCredit ? (
      <AtButton size="lg" variant="bordered" className="h-[52px] w-full border-1 border-primary text-sm text-primary" onPress={abrirPago}>
        Pagar antes del vencimiento
      </AtButton>
    ) : (
      <AtButton size="lg" className="h-[52px] w-full text-sm" onPress={abrirPago}>
        Pagar factura
      </AtButton>
    );
  }
  enlaces.push({ label: "Ver factura", onPress: abrirFactura });

  const resumen = (
    <>
      <MlStatusNote tone={nota.tone} title={nota.title}>
        {nota.texto}
        {restoParcial}
      </MlStatusNote>
      {lineaCredito}
      {botonResumen}
      <div className="flex flex-col items-center gap-2">
        {enlaces.map((enlace) => (
          <button key={enlace.label} type="button" className={CLASE_ENLACE} onClick={enlace.onPress}>
            {enlace.label}
          </button>
        ))}
        <button type="button" className={CLASE_ENLACE} onClick={bajarFactura} disabled={descargarFactura.isPending}>
          {descargarFactura.isPending ? "Descargando la factura…" : "Descargar factura (PDF)"}
        </button>
      </div>
    </>
  );

  // --- Aviso tras una acción (enviar, cancelar, error de descarga) --------------------------------------------
  const textoAviso = aviso ?? (errorAccion && !modal ? { tone: "danger" as const, texto: errorAccion } : null);
  const avisoNode = textoAviso ? (
    <div id={AVISO_ID} tabIndex={-1} role={textoAviso.tone === "danger" ? "alert" : "status"} className="outline-none">
      <MlStatusNote tone={textoAviso.tone}>
        {textoAviso.texto}
        {volver && textoAviso.tone === "success" && (
          <>
            {" "}
            <Link href={volver} className="font-semibold text-brand underline underline-offset-2">
              {volver === "/carrito" ? "Volver al carrito" : "Volver"}
            </Link>
          </>
        )}
      </MlStatusNote>
    </div>
  ) : null;

  // --- Modales --------------------------------------------------------------------------------------------------
  let filasComprobante: OrPaymentProofModalRow[] = [];
  let notaComprobante: { tone: "success" | "warning" | "danger"; content: ReactNode } | undefined;
  let accionComprobante: { label: string; onPress: () => void; tone?: "primary" | "accent"; isLoading?: boolean } | undefined;
  if (ultimo) {
    const subio = { label: "Lo subió", value: `${ultimo.submittedBy.name} · ${cuandoCorto(ultimo.submittedAt)}` };
    const comunes: OrPaymentProofModalRow[] = [
      { label: "Método", value: PAYMENT_METHOD_LABELS[ultimo.method] },
      ...(ultimo.bank ? [{ label: "Banco", value: ultimo.bank }] : []),
      { label: "Fecha del pago", value: fechaPura(ultimo.paymentDate) },
      { label: "Referencia", value: ultimo.reference },
    ];
    if (ultimo.status === "APPROVED") {
      filasComprobante = [
        { label: "Monto pagado", value: formatPrice(ultimo.amount), emphasis: "amount" },
        ...comunes,
        subio,
        ...(ultimo.reviewedAt ? [{ label: "Lo validó", value: `Finanzas Ofibites · ${cuandoCorto(ultimo.reviewedAt)}` }] : []),
      ];
      notaComprobante = {
        tone: "success",
        content:
          invoice.status === "PAID"
            ? "La factura quedó marcada como pagada. El comprobante se archiva en el pedido y lo pueden consultar tú y el equipo de finanzas."
            : `Finanzas aprobó este pago. La factura sigue con un saldo de ${formatPrice(invoice.balance)}.`,
      };
      accionComprobante = { label: "Descargar factura", onPress: bajarFactura, isLoading: descargarFactura.isPending };
    } else if (ultimo.status === "PENDING_REVIEW") {
      filasComprobante = [
        { label: "Monto declarado", value: formatPrice(ultimo.amount), emphasis: "amount" },
        ...comunes,
        subio,
        { label: "Estado", value: `En revisión desde ${desdeHace(ultimo.submittedAt)}` },
      ];
      notaComprobante = {
        tone: "warning",
        content: "Finanzas responde en máximo 1 día hábil. Mientras tanto la factura sigue pendiente y tu pedido sigue su curso normal.",
      };
      if (puedePagar) accionComprobante = { label: "Enviar otro comprobante", onPress: abrirPago };
    } else if (ultimo.status === "REJECTED") {
      const cuadra = Math.round(ultimo.amount * 100) === Math.round(invoice.total * 100);
      filasComprobante = [
        { label: "Monto declarado", value: formatPrice(ultimo.amount), emphasis: cuadra ? "amount" : "danger" },
        { label: "Monto de la factura", value: formatPrice(invoice.total) },
        ...comunes.filter((fila) => fila.label !== "Fecha del pago"),
        subio,
        ...(ultimo.reviewedAt ? [{ label: "Lo revisó", value: `Finanzas Ofibites · ${cuandoCorto(ultimo.reviewedAt)}` }] : []),
      ];
      notaComprobante = {
        tone: "danger",
        content: (
          <>
            {ultimo.rejectionReason && (
              <>
                <strong className="font-semibold">Motivo del rechazo:</strong> {ultimo.rejectionReason.replace(/\.$/, "")}.{" "}
              </>
            )}
            {invoice.status === "PENDING" ? `Tu factura sigue pendiente y vence el ${vencida}.` : ""}
          </>
        ),
      };
      if (pagable) accionComprobante = { label: "Subir otro comprobante", onPress: abrirPago, tone: "accent" };
    }
  }

  const noticePago =
    (estado === "REJECTED" || rechazadoVencida) && ultimo?.reviewedAt
      ? {
          tone: "danger" as const,
          text: `El comprobante enviado el ${diaMes(ultimo.submittedAt)} fue rechazado el ${diaMes(ultimo.reviewedAt)}. Esta factura sigue pendiente de pago.`,
        }
      : estado === "IN_REVIEW" && ultimo
        ? {
            tone: "warning" as const,
            text: `Este comprobante reemplaza al que está en revisión (Ref. ${ultimo.reference}). Si el envío falla, el anterior sigue en revisión.`,
          }
        : undefined;

  const modales = (
    <>
      <OrInvoicePaymentModal
        key={aperturaPago}
        isOpen={modal === "pagar"}
        onClose={cerrar}
        orderNumber={numero}
        invoiceLabel={numeroFactura}
        balance={invoice.balance}
        balanceLabel={formatPrice(invoice.balance)}
        dueDateLabel={vencida}
        maxPaymentDate={hoy}
        defaultMethod={estado === "REJECTED" || estado === "IN_REVIEW" ? ultimo?.method : undefined}
        defaultBank={estado === "REJECTED" || estado === "IN_REVIEW" ? ultimo?.bank : undefined}
        notice={noticePago}
        onSubmit={enviarPago}
        isSubmitting={submit.isPending}
        submitError={errorPago}
      />

      {ultimo && (
        <OrPaymentProofModal
          isOpen={modal === "comprobante" || (modal === "visor-comprobante" && visorDesdeComprobante)}
          onClose={() => setModal(null)}
          status={PAYMENT_RECORD_STATUS_VIEW[ultimo.status]}
          subtitle={`Pedido #${numero} · Factura ${numeroFactura}`}
          file={{
            name: ultimo.proof.fileName,
            metaLabel: `${formatFileSize(ultimo.proof.sizeBytes)} · subido ${esHoy(ultimo.submittedAt) ? "hoy" : `el ${diaMes(ultimo.submittedAt)}`}`,
            kind: esPdf(ultimo.proof.mimeType) ? "pdf" : "image",
            previewUrl: proofUrl,
            isLoading: proofQuery.isPending,
            hasError: proofQuery.isError,
          }}
          rows={filasComprobante}
          note={notaComprobante}
          onExpand={() => {
            setVisorDesdeComprobante(true);
            setModal("visor-comprobante");
          }}
          onDownload={bajarComprobante}
          isDownloading={descargarComprobante.isPending}
          primaryAction={accionComprobante}
          dangerAction={
            ultimo.status === "PENDING_REVIEW" && puedePagar
              ? { label: "Cancelar envío", onPress: () => setModal("cancelar-envio") }
              : undefined
          }
          error={modal === "comprobante" ? errorAccion : null}
        />
      )}

      {ultimo && (
        <OrDocumentViewer
          isOpen={modal === "visor-comprobante"}
          onClose={cerrar}
          title={ultimo.proof.fileName}
          subtitle={`Pedido #${numero} · subido por ${ultimo.submittedBy.name} el ${diaMes(ultimo.submittedAt)}`}
          status={PAYMENT_RECORD_STATUS_VIEW[ultimo.status]}
          kind={esPdf(ultimo.proof.mimeType) ? "pdf" : "image"}
          url={proofUrl}
          isLoading={proofQuery.isPending}
          error={proofQuery.isError ? "No pudimos cargar el comprobante." : null}
          onRetry={() => void proofQuery.refetch()}
          onDownload={bajarComprobante}
          isDownloading={descargarComprobante.isPending}
          documentLabel={`Comprobante de pago del pedido #${numero}`}
          footer={
            errorAccion && modal === "visor-comprobante" ? (
              <p role="alert" className="text-center text-sm font-semibold text-white">
                {errorAccion}
              </p>
            ) : null
          }
        />
      )}

      <OrDocumentViewer
        isOpen={modal === "visor-factura"}
        onClose={cerrar}
        title={invoiceFileName(invoice)}
        subtitle={`Pedido #${numero} · emitida el ${diaMes(invoice.issuedAt)}${invoice.hasFiscalPdf ? " · factura fiscal" : " · proforma"}`}
        status={chip}
        kind="pdf"
        url={pdfUrl}
        isLoading={pdfQuery.isPending}
        error={pdfQuery.isError ? "No pudimos cargar la factura." : null}
        onRetry={() => void pdfQuery.refetch()}
        onDownload={bajarFactura}
        isDownloading={descargarFactura.isPending}
        documentLabel={`Factura ${numeroFactura} del pedido #${numero}`}
        footer={
          errorAccion && modal === "visor-factura" ? (
            <p role="alert" className="text-center text-sm font-semibold text-white">
              {errorAccion}
            </p>
          ) : null
        }
      />

      <OrConfirmModal
        isOpen={modal === "cancelar-envio"}
        onClose={() => setModal(null)}
        onConfirm={cancelarEnvio}
        isConfirming={withdraw.isPending}
        isDestructive
        title="¿Cancelar el envío del comprobante?"
        description="Finanzas ya no lo revisará y la factura vuelve a quedar pendiente de pago. Puedes enviar otro cuando quieras."
        confirmLabel="Cancelar envío"
        cancelLabel="Mantenerlo"
      />
    </>
  );

  return {
    invoice,
    chip,
    banner,
    accionCabecera,
    metodoPago,
    resumen,
    aviso: avisoNode,
    modales,
  } as const;
}
