"use client";

import { cn, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Check } from "lucide-react";

import { modalMotionProps } from "@/shared/motion";
import { AtButton, AtModal } from "@/ui/atomic/atoms";

import { OrStatusModalProps } from "./or-status-modal.types";

/**
 * Modal de resultado centrado (Figma "Perfil actualizado" `3704:2622`, "Contraseña actualizada" `3654:2160` y
 * "La contraseña actual no es correcta" `3704:2765`): icono redondo, título Playfair 22, descripción, nota
 * opcional y uno o dos botones a todo el ancho. El foco entra en el modal y vuelve al botón que lo abrió.
 */
export function OrStatusModal({
  isOpen,
  onClose,
  tone,
  title,
  description,
  note,
  primaryAction,
  secondaryAction,
  onExited,
}: OrStatusModalProps) {
  const isError = tone === "error";
  const primary = primaryAction ?? { label: "Entendido", onPress: onClose };

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="center"
      size="md"
      hideCloseButton
      motionProps={{
        ...modalMotionProps,
        onAnimationComplete: (definition) => {
          if (definition === "exit") onExited?.();
        },
      }}
      classNames={{
        wrapper: "px-4",
        base: "mx-0 max-w-[480px] rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent role={isError ? "alertdialog" : "dialog"}>
        <ModalHeader className="flex flex-col items-center gap-4 px-8 pb-2 pt-8 text-center">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              isError ? "bg-accent/15 text-secondary-600" : "bg-brand-soft/50 text-primary",
            )}
          >
            {isError ? <span className="text-2xl font-bold leading-none">!</span> : <Check className="size-6" strokeWidth={2.5} />}
          </span>
          <span className="font-display text-[22px] font-bold leading-7 text-foreground">{title}</span>
        </ModalHeader>
        {(description || note) && (
          <ModalBody className="flex flex-col items-center gap-3 px-8 py-1 text-center">
            {description && <p className="text-[13px] leading-5 text-ghost-foreground">{description}</p>}
            {note &&
              (isError ? (
                <p className="flex w-full items-start gap-2.5 rounded-2xl bg-background px-4 py-3 text-left text-xs leading-[18px] text-foreground">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {note}
                </p>
              ) : (
                <p className="text-[11px] leading-4 text-subtle">{note}</p>
              ))}
          </ModalBody>
        )}
        <ModalFooter
          className={cn(
            "flex flex-col-reverse gap-3 px-8 pb-8 pt-5 sm:flex-row",
            secondaryAction && "mx-8 mt-3 border-t border-divider px-0",
          )}
        >
          {secondaryAction && (
            <AtButton size="lg" variant="bordered" className="h-12 flex-1 border-primary text-sm text-primary" onPress={secondaryAction.onPress}>
              {secondaryAction.label}
            </AtButton>
          )}
          <AtButton size="lg" className="h-12 flex-1 text-sm" onPress={primary.onPress}>
            {primary.label}
          </AtButton>
        </ModalFooter>
      </ModalContent>
    </AtModal>
  );
}
