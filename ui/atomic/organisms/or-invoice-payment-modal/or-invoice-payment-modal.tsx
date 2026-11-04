"use client";

import { FormEvent, useId, useRef, useState } from "react";

import { ModalBody, ModalContent, ModalFooter, ModalHeader, SelectItem } from "@heroui/react";
import { FileText, X } from "lucide-react";

import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PAYMENT_PROOF_ACCEPT,
  paymentProofProblem,
} from "@/domain/models";
import { PaymentMethod } from "@/domain/types";
import { enfocarPrimerCampoInvalido, formatFileSize, isDateOnly } from "@/shared/utils";
import { AtButton, AtInput, AtModal, AtSelect } from "@/ui/atomic/atoms";
import { MlFileDropzone, MlFormAlert, MlStatusNote } from "@/ui/atomic/molecules";

import { OrInvoicePaymentModalProps } from "./or-invoice-payment-modal.types";

type Campo = "method" | "paymentDate" | "reference" | "amount" | "bank" | "file";
type Errores = Partial<Record<Campo, string>>;

const CLASES_CAMPO = {
  label: "pb-1.5 text-xs font-semibold text-foreground",
  inputWrapper: "h-12 bg-content1",
  input: "text-sm font-normal",
};

/** "420,38", "420.38" o "1.250,02" → 420.38. `null` si no es un importe con hasta 2 decimales. */
function leerMonto(texto: string): number | null {
  let limpio = texto.replace(/\s|\$/g, "");
  if (limpio.includes(",")) limpio = limpio.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  return Number(limpio);
}

function montoInicial(balance: number): string {
  return balance.toFixed(2).replace(".", ",");
}

/**
 * "Registrar el pago del pedido #…" (Figma `3567:1374` y `3645:2062`): factura, monto a pagar y vencimiento de lectura;
 * método, fecha y referencia del Figma, más "Monto (USD)" precargado con el saldo (pagos parciales) y "Banco de origen
 * (opcional)" (huecos aceptados en T-06b); y el comprobante (JPG, PNG o PDF hasta 5 MB). Valida en el navegador con los
 * mismos textos que el back y entrega los valores a `onSubmit`; el error del servidor llega por `submitError` tal cual.
 * Montar con una `key` nueva por apertura para empezar de cero.
 */
export function OrInvoicePaymentModal({
  isOpen,
  onClose,
  orderNumber,
  invoiceLabel,
  balance,
  balanceLabel,
  dueDateLabel,
  maxPaymentDate,
  defaultMethod,
  defaultBank,
  notice,
  submitLabel = "Enviar comprobante",
  onSubmit,
  isSubmitting = false,
  submitError,
}: OrInvoicePaymentModalProps) {
  const ids = useId();
  const ayudaArchivoId = `${ids}-ayuda-archivo`;
  const errorArchivoId = `${ids}-error-archivo`;
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [method, setMethod] = useState<PaymentMethod | null>(defaultMethod ?? null);
  const [paymentDate, setPaymentDate] = useState(maxPaymentDate);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(() => montoInicial(balance));
  const [bank, setBank] = useState(defaultBank ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [errores, setErrores] = useState<Errores>({});

  const limpiar = (campo: Campo) => setErrores((actuales) => ({ ...actuales, [campo]: undefined }));

  const validar = (): Errores => {
    const nuevos: Errores = {};
    if (!method) nuevos.method = "Elige el método de pago que usaste";
    if (!paymentDate || !isDateOnly(paymentDate)) nuevos.paymentDate = "Escribe la fecha del pago";
    else if (paymentDate > maxPaymentDate) nuevos.paymentDate = "La fecha del pago no puede ser futura";
    const ref = reference.trim();
    if (!ref) nuevos.reference = "Escribe la referencia o el número de confirmación";
    else if (ref.length > 60) nuevos.reference = "La referencia admite hasta 60 caracteres";
    const monto = leerMonto(amount);
    if (monto === null || monto <= 0) nuevos.amount = "Escribe un monto mayor que 0, con hasta 2 decimales";
    else if (Math.round(monto * 100) > Math.round(balance * 100))
      nuevos.amount = `El monto no puede ser mayor que el saldo de la factura (${balanceLabel})`;
    if (bank.trim().length > 100) nuevos.bank = "El banco admite hasta 100 caracteres";
    if (!file) nuevos.file = "Sube el comprobante";
    else {
      const problema = paymentProofProblem(file);
      if (problema) nuevos.file = problema;
    }
    return nuevos;
  };

  const enviar = (event?: FormEvent) => {
    event?.preventDefault();
    if (isSubmitting) return;
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) {
      if (nuevos.file && Object.keys(nuevos).filter((k) => nuevos[k as Campo]).length === 1) {
        requestAnimationFrame(() => inputArchivoRef.current?.focus());
      } else {
        enfocarPrimerCampoInvalido();
      }
      return;
    }
    onSubmit({
      method: method as PaymentMethod,
      paymentDate,
      reference: reference.trim(),
      amount: leerMonto(amount) as number,
      bank: bank.trim(),
      file: file as File,
    });
  };

  const elegirArchivo = (elegido: File) => {
    setFile(elegido);
    const problema = paymentProofProblem(elegido);
    setErrores((actuales) => ({ ...actuales, file: problema ?? undefined }));
  };

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
      placement="center"
      scrollBehavior="outside"
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: "mx-0 my-8 max-w-[560px] rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent>
        <form noValidate onSubmit={enviar}>
          <ModalHeader className="flex flex-col gap-2 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
            <h2 className="font-display text-[22px] font-bold leading-7 text-foreground">
              Registrar el pago del pedido #{orderNumber}
            </h2>
            <p className="text-sm font-normal leading-[21px] text-muted">
              Sube el comprobante de tu transferencia o pago móvil. Finanzas de Ofibites lo revisa
              y marca la factura como pagada.
            </p>
          </ModalHeader>
          <ModalBody className="gap-4 px-5 pb-0 pt-4 sm:px-7">
            {notice && <MlStatusNote tone={notice.tone}>{notice.text}</MlStatusNote>}
            {submitError && (
              <MlFormAlert title="No pudimos enviar el comprobante." className="bg-danger-50">
                {submitError}
              </MlFormAlert>
            )}

            <dl className="flex flex-col gap-1.5 rounded-control bg-background px-4 py-3 text-xs leading-5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Factura</dt>
                <dd className="font-semibold text-foreground">{invoiceLabel}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Monto a pagar</dt>
                <dd className="text-[15px] font-bold tabular-nums text-foreground">{balanceLabel}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Vence</dt>
                <dd className="font-semibold text-foreground">{dueDateLabel}</dd>
              </div>
            </dl>

            <AtSelect
              name="method"
              label="Método de pago usado"
              labelPlacement="outside"
              placeholder="Elige un método"
              selectedKeys={method ? [method] : []}
              onSelectionChange={(keys) => {
                const [key] = Array.from(keys);
                setMethod(key ? (String(key) as PaymentMethod) : null);
                limpiar("method");
              }}
              isInvalid={Boolean(errores.method)}
              errorMessage={errores.method}
              isDisabled={isSubmitting}
              aria-required="true"
              classNames={{ label: "pb-1.5 text-xs font-semibold text-foreground", trigger: "h-12 min-h-12 bg-content1", value: "text-sm font-normal" }}
            >
              {PAYMENT_METHODS.map((clave) => (
                <SelectItem key={clave} textValue={PAYMENT_METHOD_LABELS[clave]}>
                  {PAYMENT_METHOD_LABELS[clave]}
                </SelectItem>
              ))}
            </AtSelect>

            <AtInput
              name="bank"
              label="Banco de origen (opcional)"
              labelPlacement="outside-top"
              placeholder="Ej. Banesco"
              value={bank}
              onValueChange={(valor) => {
                setBank(valor);
                limpiar("bank");
              }}
              maxLength={100}
              isInvalid={Boolean(errores.bank)}
              errorMessage={errores.bank}
              isReadOnly={isSubmitting}
              classNames={CLASES_CAMPO}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AtInput
                name="paymentDate"
                type="date"
                label="Fecha del pago"
                labelPlacement="outside-top"
                value={paymentDate}
                max={maxPaymentDate}
                onValueChange={(valor) => {
                  setPaymentDate(valor);
                  limpiar("paymentDate");
                }}
                aria-required="true"
                isInvalid={Boolean(errores.paymentDate)}
                errorMessage={errores.paymentDate}
                isReadOnly={isSubmitting}
                classNames={CLASES_CAMPO}
              />
              <AtInput
                name="reference"
                label="Referencia o confirmación"
                labelPlacement="outside-top"
                placeholder="Ej. 0102-88431"
                value={reference}
                onValueChange={(valor) => {
                  setReference(valor);
                  limpiar("reference");
                }}
                maxLength={60}
                autoComplete="off"
                aria-required="true"
                isInvalid={Boolean(errores.reference)}
                errorMessage={errores.reference}
                isReadOnly={isSubmitting}
                classNames={CLASES_CAMPO}
              />
            </div>

            <AtInput
              name="amount"
              label="Monto (USD)"
              labelPlacement="outside-top"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onValueChange={(valor) => {
                setAmount(valor);
                limpiar("amount");
              }}
              description="Siempre en dólares, aunque hayas pagado en bolívares. Puedes pagar una parte del saldo."
              aria-required="true"
              isInvalid={Boolean(errores.amount)}
              errorMessage={errores.amount}
              isReadOnly={isSubmitting}
              classNames={{ ...CLASES_CAMPO, description: "text-[11px] text-muted" }}
            />

            <div className="flex flex-col gap-2">
              <MlFileDropzone
                title="Arrastra el comprobante o búscalo en tu computadora"
                browseLabel={file ? "Cambiar comprobante" : "Buscar comprobante"}
                accept={PAYMENT_PROOF_ACCEPT}
                onFileSelect={elegirArchivo}
                isInvalid={Boolean(errores.file)}
                isDisabled={isSubmitting}
                describedBy={errores.file ? `${errorArchivoId} ${ayudaArchivoId}` : ayudaArchivoId}
                inputRef={inputArchivoRef}
                className="py-6"
              />
              <p id={ayudaArchivoId} className="text-center text-[11px] leading-4 text-muted">
                JPG, PNG o PDF · hasta 5 MB
              </p>
              {errores.file && (
                <p id={errorArchivoId} className="flex items-center gap-2 text-[13px] font-semibold text-secondary-600 before:size-[7px] before:shrink-0 before:rounded-full before:bg-accent before:content-['']">
                  {errores.file}
                </p>
              )}
              {file && (
                <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-content1 px-4 py-3">
                  <FileText aria-hidden="true" className="size-5 shrink-0 text-brand" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-xs font-semibold leading-5 text-foreground">{file.name}</p>
                    <p className="text-[11px] leading-4 text-muted">{formatFileSize(file.size)}</p>
                  </div>
                  <AtButton
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="default"
                    className="size-8 min-w-8 text-muted"
                    aria-label={`Quitar ${file.name}`}
                    isDisabled={isSubmitting}
                    onPress={() => {
                      setFile(null);
                      limpiar("file");
                      inputArchivoRef.current?.focus();
                    }}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </AtButton>
                </div>
              )}
            </div>

            <MlStatusNote tone="warning">
              Finanzas de Ofibites revisa el comprobante en máximo 1 día hábil. Mientras tanto tu
              pedido sigue su curso normal.
            </MlStatusNote>
          </ModalBody>
          <ModalFooter className="flex-wrap justify-end gap-3 px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
            <AtButton
              size="lg"
              variant="bordered"
              className="h-12 border-1 border-primary px-6 text-sm text-primary aria-disabled:opacity-50"
              aria-disabled={isSubmitting || undefined}
              onPress={() => {
                if (!isSubmitting) onClose();
              }}
            >
              Cancelar
            </AtButton>
            <AtButton type="submit" size="lg" className="h-12 px-6 text-sm" isLoading={isSubmitting}>
              {submitLabel}
            </AtButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </AtModal>
  );
}
