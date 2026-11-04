"use client";

import { useState } from "react";

import {
  AtButton,
  AtStatusChip,
  MlCreditLineCard,
  MlNoticeBanner,
  MlStatusNote,
  OrDocumentViewer,
  OrInvoicePaymentModal,
  OrPaymentProofModal,
} from "@/ui/atomic";

type Abierto = "comprobante" | "pagar" | "visor" | null;

/** Piezas de facturas y pagos (T-06d) con datos de muestra del catálogo, sin API. */
export function PagosDemo() {
  const [abierto, setAbierto] = useState<Abierto>(null);
  const [apertura, setApertura] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <AtStatusChip tone="success">Completado</AtStatusChip>
        <AtStatusChip tone="danger">Pendiente</AtStatusChip>
        <AtStatusChip tone="warning">Pago por confirmar</AtStatusChip>
        <AtStatusChip tone="danger">Comprobante rechazado</AtStatusChip>
        <AtStatusChip tone="neutral">Anulada</AtStatusChip>
        <AtStatusChip tone="success" hasDot>
          Validado
        </AtStatusChip>
        <AtStatusChip tone="info">Recibido</AtStatusChip>
        <AtStatusChip tone="sand">Programado</AtStatusChip>
        <AtStatusChip tone="olive">En tránsito</AtStatusChip>
      </div>

      <MlNoticeBanner tone="success" title="Finanzas confirmó tu pago">
        Recibimos $1.250,02 el 26/09 por Pago Móvil. La factura F-2026-0007 quedó saldada el 27/09 a las
        9:40 a. m.
      </MlNoticeBanner>
      <MlNoticeBanner
        tone="warning"
        title="Recibimos tu comprobante, falta que finanzas lo confirme"
        actions={[
          { label: "Ver comprobante", onPress: () => setAbierto("comprobante") },
          { label: "Cancelar envío", onPress: () => undefined, variant: "danger-bordered" },
        ]}
      >
        Enviado hoy a las 10:02 a. m. por $420,38 · Ref. 0102-88431. Te avisamos en máximo 1 día hábil.
      </MlNoticeBanner>
      <MlNoticeBanner
        tone="danger"
        title="Tienes una factura vencida (#F-2026-0042, $340)."
        actions={[{ label: "Pagar factura ahora", onPress: () => setAbierto("pagar"), variant: "accent" }]}
      >
        No podemos programar pedidos nuevos hasta regularizarla.
      </MlNoticeBanner>
      <MlNoticeBanner tone="credit" title="Este pedido se cargó a tu línea de crédito">
        La factura F-2026-0045 vence el 06/11/2026. No hace falta subir comprobante: se paga al
        vencimiento.
      </MlNoticeBanner>

      <div className="grid max-w-[720px] gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-card bg-content1 p-5">
          <MlStatusNote tone="warning" title="Factura a crédito">
            F-2026-0045 · vence el 06/11/2026 · faltan 29 días
          </MlStatusNote>
          <MlCreditLineCard
            companyName="Andina C.A."
            committedLabel="$3.980,20"
            availableLabel="$4.019,80"
            limitLabel="$8.000"
            usedRatio={0.5}
            note="El cupo se libera cuando Finanzas registra el pago de la factura."
          />
        </div>
        <div className="flex flex-col gap-3 rounded-card bg-content1 p-5">
          <MlStatusNote tone="danger" title="Factura vencida">
            F-2026-0045 · venció el 06/11/2026 · 4 días de atraso
          </MlStatusNote>
          <MlCreditLineCard
            companyName="Andina C.A."
            committedLabel="$3.980,20"
            availableLabel="$0"
            limitLabel="$8.000"
            usedRatio={0.5}
            isBlocked
            note="El cupo se libera apenas Finanzas registre el pago de la factura vencida."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <AtButton size="md" onPress={() => setAbierto("comprobante")}>
          OrPaymentProofModal
        </AtButton>
        <AtButton
          size="md"
          onPress={() => {
            setApertura((n) => n + 1);
            setAbierto("pagar");
          }}
        >
          OrInvoicePaymentModal
        </AtButton>
        <AtButton size="md" onPress={() => setAbierto("visor")}>
          OrDocumentViewer (sin archivo)
        </AtButton>
      </div>

      <OrPaymentProofModal
        isOpen={abierto === "comprobante"}
        onClose={() => setAbierto(null)}
        status={{ label: "En revisión", tone: "warning" }}
        subtitle="Pedido #OF-2026-0107 · Factura F-2026-0007"
        file={{ name: "comprobante-pago-0107.jpg", metaLabel: "980 KB · subido hoy", kind: "image", previewUrl: null }}
        rows={[
          { label: "Monto declarado", value: "$420,38", emphasis: "amount" },
          { label: "Método", value: "Transferencia en divisas" },
          { label: "Fecha del pago", value: "27/09/2026" },
          { label: "Referencia", value: "0102-88431" },
          { label: "Lo subió", value: "Luis Alberto Márquez · hoy, 10:02 a. m." },
          { label: "Estado", value: "En revisión desde hace 3 horas" },
        ]}
        note={{
          tone: "warning",
          content: "Finanzas responde en máximo 1 día hábil. Mientras tanto la factura sigue pendiente.",
        }}
        onExpand={() => setAbierto("visor")}
        onDownload={() => undefined}
        primaryAction={{ label: "Enviar otro comprobante", onPress: () => setAbierto("pagar") }}
        dangerAction={{ label: "Cancelar envío", onPress: () => setAbierto(null) }}
      />
      <OrInvoicePaymentModal
        key={apertura}
        isOpen={abierto === "pagar"}
        onClose={() => setAbierto(null)}
        orderNumber="OF-2026-0107"
        invoiceLabel="F-2026-0007"
        balance={420.38}
        balanceLabel="$420,38"
        dueDateLabel="26/10/2026"
        maxPaymentDate="2026-11-04"
        onSubmit={() => setAbierto(null)}
      />
      <OrDocumentViewer
        isOpen={abierto === "visor"}
        onClose={() => setAbierto(null)}
        title="comprobante-pago-0107.jpg"
        subtitle="Pedido #OF-2026-0107 · subido por Luis Alberto Márquez el 27/09"
        status={{ label: "Por confirmar", tone: "warning" }}
        kind="image"
        url={null}
        error="Vista de muestra: aquí se ve el archivo descargado con sesión."
        onDownload={() => undefined}
      />
    </div>
  );
}
