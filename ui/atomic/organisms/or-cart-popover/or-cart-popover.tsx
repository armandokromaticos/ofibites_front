"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ArrowRight, ShoppingCart } from "lucide-react";

import { AtButton, AtIconButton, AtPopover, AtSkeleton } from "@/ui/atomic/atoms";
import { MlCartLine, MlEmptyState, MlPopoverHeader } from "@/ui/atomic/molecules";

import { OrCartPopoverProps } from "./or-cart-popover.types";

function unidades(count: number): string {
  return `${count} ${count === 1 ? "producto" : "productos"}`;
}

/**
 * Carrito de la top bar: botón con contador y popover "Tu pedido" (líneas con "Quitar", "Vaciar" con
 * confirmación en el propio panel y "Ver carrito"). Los datos y las acciones llegan por props.
 */
export function OrCartPopover({
  count = 0,
  status,
  lines,
  cartHref,
  browseHref,
  onRetry,
  isRetrying = false,
  onRemoveLine,
  removingLineId = null,
  onClear,
  isClearing = false,
  actionError = null,
  isOpen: isOpenProp,
  onOpenChange,
  id = "cart-popover",
}: OrCartPopoverProps) {
  const [isOpenState, setIsOpenState] = useState(false);
  const isOpen = isOpenProp ?? isOpenState;
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const cancelClearRef = useRef<HTMLButtonElement>(null);
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRef = useRef<HTMLDivElement>(null);
  // Al quitar una línea su botón desaparece: el foco pasa a la línea que ocupa su sitio (o al título).
  const focusAfterRemove = useRef<number | null>(null);
  // Al cancelar la confirmación, el foco vuelve a "Vaciar" (que se vuelve a pintar).
  const focusClearButton = useRef(false);
  const focusTitleAfterClear = useRef(false);

  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;
  const confirmId = `${id}-confirm`;
  const hasLines = status === "ready" && lines.length > 0;
  const showConfirm = isConfirmingClear && hasLines;

  const setOpen = (open: boolean) => {
    if (isOpenProp === undefined) setIsOpenState(open);
    if (!open) setIsConfirmingClear(false);
    onOpenChange?.(open);
  };

  useEffect(() => {
    const title = panelRef.current?.querySelector<HTMLElement>(`#${titleId}`);
    // Vaciado: el botón de la confirmación desaparece con las líneas; el foco va al título del panel.
    if (focusTitleAfterClear.current && !isClearing) {
      focusTitleAfterClear.current = false;
      if (lines.length === 0) title?.focus();
    }
    const index = focusAfterRemove.current;
    if (index === null || removingLineId) return;
    focusAfterRemove.current = null;
    const next = lines[Math.min(index, lines.length - 1)];
    const target = next ? removeButtonRefs.current.get(next.id) : null;
    (target ?? title)?.focus();
  }, [lines, removingLineId, isClearing, titleId]);

  useEffect(() => {
    if (showConfirm) {
      cancelClearRef.current?.focus();
    } else if (focusClearButton.current) {
      focusClearButton.current = false;
      clearButtonRef.current?.focus();
    }
  }, [showConfirm]);

  // Un enlace del panel navega: se cierra (la top bar no se re-monta entre rutas).
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a[href]")) setOpen(false);
  };

  return (
    <AtPopover
      isOpen={isOpen}
      onOpenChange={setOpen}
      aria-labelledby={titleId}
      panelId={panelId}
      trigger={
        <AtIconButton
          aria-label={count ? `Carrito, ${unidades(count)}` : "Carrito"}
          aria-controls={isOpen ? panelId : undefined}
          badgeContent={count}
        >
          <ShoppingCart aria-hidden="true" />
        </AtIconButton>
      }
    >
      <div ref={panelRef} onClickCapture={closeOnLink} className="flex flex-col">
        <MlPopoverHeader
          title="Tu pedido"
          titleId={titleId}
          actionRef={clearButtonRef}
          action={
            hasLines && onClear && !showConfirm
              ? {
                  label: "Vaciar",
                  "aria-label": "Vaciar el carrito",
                  onPress: () => setIsConfirmingClear(true),
                }
              : undefined
          }
        />

        {status === "loading" && (
          <div role="status" aria-label="Cargando tu pedido" className="flex flex-col gap-2">
            {[0, 1].map((key) => (
              <div key={key} className="flex items-center gap-2.5 rounded-control bg-background p-2">
                <AtSkeleton className="h-8 w-11 rounded-md" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <AtSkeleton className="h-3 w-3/4 rounded-full" />
                  <AtSkeleton className="h-2.5 w-1/3 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <MlEmptyState
            size="sm"
            tone="error"
            title="No pudimos cargar tu pedido"
            description="Revisa tu conexión e inténtalo de nuevo."
            actionLabel={onRetry ? "Reintentar" : undefined}
            onAction={onRetry}
            isActionLoading={isRetrying}
          />
        )}

        {status === "unavailable" && (
          <MlEmptyState
            size="sm"
            title="Sin carrito en esta empresa"
            description="Tu usuario no puede hacer pedidos para la empresa activa. Si crees que es un error, habla con el administrador de tu empresa."
          />
        )}

        {status === "ready" && lines.length === 0 && (
          <MlEmptyState
            size="sm"
            title="Aún no agregas nada"
            description="Explora el menú y arma tu pedido."
            actionLabel="Explorar el menú"
            actionHref={browseHref}
          />
        )}

        {hasLines && (
          <ul
            aria-label="Productos del pedido"
            className="-mx-1 flex max-h-[260px] flex-col gap-2 overflow-y-auto px-1 py-0.5"
          >
            {lines.map((line, index) => (
              <li key={line.id}>
                <MlCartLine
                  name={line.name}
                  imageSrc={line.imageSrc}
                  detail={line.detail}
                  isRemoving={removingLineId === line.id}
                  isRemoveDisabled={removingLineId !== null && removingLineId !== line.id}
                  removeButtonRef={(element) => {
                    if (element) removeButtonRefs.current.set(line.id, element);
                    else removeButtonRefs.current.delete(line.id);
                  }}
                  onRemove={
                    onRemoveLine
                      ? () => {
                          focusAfterRemove.current = index;
                          onRemoveLine(line.id);
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}

        {actionError && (
          <p role="alert" className="mt-3 rounded-control bg-danger-50 px-3 py-2 text-xs leading-5 text-danger-700">
            {actionError}
          </p>
        )}

        {showConfirm && (
          <div role="group" aria-labelledby={confirmId} className="mt-3 rounded-control bg-background p-3">
            <p id={confirmId} className="text-[13px] leading-5 text-foreground">
              <span className="font-semibold">¿Vaciar el carrito?</span> Se quitarán todos los productos del pedido de
              tu empresa.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <AtButton
                ref={cancelClearRef}
                size="sm"
                variant="light"
                color="default"
                className="text-ghost-foreground"
                onPress={() => {
                  focusClearButton.current = true;
                  setIsConfirmingClear(false);
                }}
                isDisabled={isClearing}
              >
                Cancelar
              </AtButton>
              <AtButton size="sm" color="danger" className="bg-danger-700" onPress={() => {
                  focusTitleAfterClear.current = true;
                  onClear?.();
                }}
                isLoading={isClearing}
              >
                Vaciar carrito
              </AtButton>
            </div>
          </div>
        )}

        {hasLines && !showConfirm && (
          <AtButton as={Link} href={cartHref} size="md" className="mt-3 h-[38px] w-full">
            Ver carrito
            <ArrowRight aria-hidden="true" className="size-4" />
          </AtButton>
        )}
      </div>
    </AtPopover>
  );
}
