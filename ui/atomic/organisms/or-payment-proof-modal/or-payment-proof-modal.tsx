"use client";

import { cn, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@heroui/react";
import { FileText, ImageOff, X } from "lucide-react";

import { AtButton, AtModal, AtStatusChip } from "@/ui/atomic/atoms";
import { MlFormAlert, MlStatusNote } from "@/ui/atomic/molecules";

import { OrPaymentProofModalProps } from "./or-payment-proof-modal.types";

function Miniatura({ file }: { file: OrPaymentProofModalProps["file"] }) {
  if (file.kind === "image" && file.previewUrl && !file.hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob: privado descargado con sesión, no pasa por next/image
      <img src={file.previewUrl} alt={`Vista previa de ${file.name}`} className="max-h-[220px] w-full rounded-lg object-contain" />
    );
  }
  if (file.kind === "image" && file.isLoading) {
    return <Spinner size="sm" color="current" label="Cargando la vista previa" classNames={{ label: "text-xs text-muted" }} />;
  }
  return (
    <span aria-hidden="true" className="flex h-[72px] w-[58px] items-center justify-center rounded-md border-2 border-strength-medium bg-content1 text-strength-medium">
      {file.hasError ? <ImageOff className="size-6" /> : <FileText className="size-6" />}
    </span>
  );
}

/**
 * "Comprobante de pago" (Figma `3633:4195` validado, `3627:1530` en revisión, `3627:1793` rechazado): miniatura con
 * "Ampliar" y "Descargar", datos del pago, nota según el estado y las acciones del pie. Todo llega por props: quien lo
 * usa descarga el archivo con sesión y le pasa la `blob:` URL.
 */
export function OrPaymentProofModal({
  isOpen,
  onClose,
  status,
  subtitle,
  file,
  rows,
  note,
  onExpand,
  onDownload,
  isDownloading = false,
  primaryAction,
  dangerAction,
  error,
}: OrPaymentProofModalProps) {
  const ocupado = Boolean(primaryAction?.isLoading || dangerAction?.isLoading);

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !ocupado) onClose();
      }}
      placement="center"
      scrollBehavior="outside"
      isDismissable={!ocupado}
      isKeyboardDismissDisabled={ocupado}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: "mx-0 my-8 max-w-[720px] rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-start gap-4 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-[22px] font-bold leading-7 text-foreground">Comprobante de pago</h2>
              <AtStatusChip tone={status.tone} hasDot>
                {status.label}
              </AtStatusChip>
            </div>
            <p className="text-[13px] font-normal leading-5 text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            disabled={ocupado}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition-colors duration-(--duration-fast) hover:bg-track focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </ModalHeader>

        <ModalBody className="gap-5 px-5 pb-0 pt-5 sm:px-7">
          {error && <MlFormAlert className="bg-danger-50">{error}</MlFormAlert>}
          <div className="grid gap-5 sm:grid-cols-[250px_minmax(0,1fr)]">
            <div className="flex flex-col gap-3">
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-surface-sand bg-background px-4 py-5 text-center">
                <Miniatura file={file} />
                <p className="w-full truncate text-[11px] leading-4 text-muted" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[11px] leading-4 text-muted">{file.metaLabel}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <AtButton
                  size="md"
                  variant="bordered"
                  className="h-10 border-1 border-primary text-[13px] text-primary"
                  onPress={onExpand}
                  aria-label={`Ampliar ${file.name}`}
                >
                  Ampliar
                </AtButton>
                <AtButton
                  size="md"
                  variant="bordered"
                  className="h-10 border-1 border-primary text-[13px] text-primary"
                  onPress={onDownload}
                  isLoading={isDownloading}
                  aria-label={`Descargar ${file.name}`}
                >
                  Descargar
                </AtButton>
              </div>
            </div>
            <dl className="flex flex-col divide-y divide-surface-sand self-start text-xs leading-5">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 px-1 py-3 sm:px-4">
                  <dt className="shrink-0 text-muted">{row.label}</dt>
                  <dd
                    className={cn(
                      "text-right font-semibold text-foreground",
                      row.emphasis && "text-base font-bold tabular-nums",
                      row.emphasis === "danger" && "text-secondary-700",
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {note && <MlStatusNote tone={note.tone}>{note.content}</MlStatusNote>}
        </ModalBody>

        <ModalFooter className="flex-wrap items-center gap-3 px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
          {dangerAction && (
            <AtButton
              size="md"
              variant="light"
              className="h-11 px-2 text-[13px] text-secondary-700 sm:mr-auto"
              onPress={dangerAction.onPress}
              isLoading={dangerAction.isLoading}
            >
              {dangerAction.label}
            </AtButton>
          )}
          <div className="ml-auto flex flex-wrap justify-end gap-3">
            <AtButton
              size="lg"
              variant="bordered"
              className="h-12 border-1 border-primary px-6 text-sm text-primary"
              onPress={onClose}
              isDisabled={ocupado}
            >
              Cerrar
            </AtButton>
            {primaryAction && (
              <AtButton
                size="lg"
                className={cn("h-12 px-6 text-sm", primaryAction.tone === "accent" && "bg-secondary-600 text-white")}
                onPress={primaryAction.onPress}
                isLoading={primaryAction.isLoading}
              >
                {primaryAction.label}
              </AtButton>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </AtModal>
  );
}
