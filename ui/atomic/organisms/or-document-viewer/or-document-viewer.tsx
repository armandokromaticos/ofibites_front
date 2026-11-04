"use client";

import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";

import { cn, ModalBody, ModalContent, ModalHeader, Spinner } from "@heroui/react";
import { FileWarning, Minus, Plus, X } from "lucide-react";

import { AtButton, AtModal, AtStatusChip } from "@/ui/atomic/atoms";

import { OrDocumentViewerProps } from "./or-document-viewer.types";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const ZOOM_PASO = 0.25;

const CLASE_BOTON_OSCURO =
  "flex size-8 items-center justify-center rounded-full text-white transition-colors duration-(--duration-fast) hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40";

function limitar(valor: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(valor * 100) / 100));
}

/** Imagen ajustada al visor con zoom (− / % / +, rueda del ratón) y arrastre para desplazarse cuando no cabe. */
interface VisorImagenProps {
  url: string;
  alt: string;
  zoom: number;
  onZoom: (z: number) => void;
}

function VisorImagen({ url, alt, zoom, onZoom }: VisorImagenProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [caja, setCaja] = useState<{ w: number; h: number } | null>(null);
  const arrastre = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Tamaño visible del contenedor (para ajustar la imagen a lo que cabe al 100 %).
  useEffect(() => {
    const nodo = contenedorRef.current;
    if (!nodo) return;
    const observer = new ResizeObserver(([entrada]) => {
      setCaja({ w: entrada.contentRect.width, h: entrada.contentRect.height });
    });
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  // La rueda acerca y aleja. React registra `wheel` como pasivo: sin un listener propio no se puede cancelar el scroll.
  useEffect(() => {
    const nodo = contenedorRef.current;
    if (!nodo) return;
    const alGirar = (event: WheelEvent) => {
      event.preventDefault();
      onZoom(limitar(zoomRef.current + (event.deltaY < 0 ? ZOOM_PASO : -ZOOM_PASO)));
    };
    nodo.addEventListener("wheel", alGirar, { passive: false });
    return () => nodo.removeEventListener("wheel", alGirar);
  }, [onZoom]);

  const ajuste = natural && caja ? Math.min(caja.w / natural.w, caja.h / natural.h, 1) : 1;
  const ancho = natural ? natural.w * ajuste * zoom : undefined;

  const empezarArrastre = (event: PointerEvent<HTMLDivElement>) => {
    const nodo = contenedorRef.current;
    if (!nodo || event.button !== 0) return;
    arrastre.current = {
      x: event.clientX,
      y: event.clientY,
      left: nodo.scrollLeft,
      top: nodo.scrollTop,
    };
    nodo.setPointerCapture(event.pointerId);
  };
  const arrastrar = (event: PointerEvent<HTMLDivElement>) => {
    const nodo = contenedorRef.current;
    const inicio = arrastre.current;
    if (!nodo || !inicio) return;
    nodo.scrollLeft = inicio.left - (event.clientX - inicio.x);
    nodo.scrollTop = inicio.top - (event.clientY - inicio.y);
  };
  const soltar = () => {
    arrastre.current = null;
  };

  return (
    <div
      ref={contenedorRef}
      className="flex size-full cursor-grab touch-pinch-zoom overflow-auto active:cursor-grabbing"
      onPointerDown={empezarArrastre}
      onPointerMove={arrastrar}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      {/* `m-auto` centra la imagen mientras cabe y deja desplazarse por toda ella cuando la desborda. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: privado descargado con sesión, no pasa por next/image */}
      <img
        src={url}
        alt={alt}
        draggable={false}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          setNatural({ w: naturalWidth, h: naturalHeight });
        }}
        style={ancho ? { width: ancho, maxWidth: "none" } : undefined}
        className={cn("m-auto block select-none rounded-lg bg-white", !natural && "max-h-full max-w-full")}
      />
    </div>
  );
}

/**
 * Vista ampliada de un comprobante o de la factura (Figma `3639:2063`, `3629:1647`, `3639:2278`, `3642:1959`,
 * `3640:1920`, `3642:2279`, `3729:3090`): pantalla oscura con el nombre del archivo, chip de estado, "Descargar" y
 * cerrar. Las imágenes llevan zoom propio; el PDF va en un `iframe` con el visor del navegador (acordado en T-06b: el
 * Figma pinta la factura en HTML, pero el documento real es el PDF del back). Esc cierra y el foco queda atrapado.
 */
export function OrDocumentViewer({
  isOpen,
  onClose,
  title,
  subtitle,
  status,
  kind,
  url,
  isLoading = false,
  error,
  onRetry,
  onDownload,
  isDownloading = false,
  documentLabel,
  footer,
}: OrDocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const cambiarZoom = useCallback((valor: number) => setZoom(limitar(valor)), []);
  const etiqueta = documentLabel ?? title;
  const esImagen = kind === "image";

  let contenido;
  if (url && !error) {
    contenido = esImagen ? (
      <VisorImagen url={url} alt={etiqueta} zoom={zoom} onZoom={cambiarZoom} />
    ) : (
      <iframe src={url} title={etiqueta} className="mx-auto size-full max-w-[960px] rounded-lg bg-white" />
    );
  } else if (error) {
    contenido = (
      <div role="alert" className="m-auto flex max-w-sm flex-col items-center gap-3 text-center text-white">
        <FileWarning aria-hidden="true" className="size-9 text-white/70" />
        <p className="text-sm font-semibold">{error}</p>
        {onRetry && (
          <AtButton size="md" variant="bordered" className="border-1 border-white/60 text-white" onPress={onRetry}>
            Reintentar
          </AtButton>
        )}
      </div>
    );
  } else {
    contenido = (
      <div className="m-auto" role="status">
        <Spinner color="white" label={isLoading ? "Cargando el documento" : undefined} classNames={{ label: "text-white" }} />
      </div>
    );
  }

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onClose={() => setZoom(1)}
      size="full"
      hideCloseButton
      classNames={{
        base: "bg-viewer text-white",
        backdrop: "bg-black/70",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-white/10 px-4 py-3 sm:px-7">
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="truncate text-sm font-semibold leading-5 text-white">{title}</h2>
            {subtitle && <p className="truncate text-xs font-normal leading-4 text-white/75">{subtitle}</p>}
          </div>
          {status && (
            <AtStatusChip tone={status.tone} hasDot onDark>
              {status.label}
            </AtStatusChip>
          )}
          <div className="flex items-center gap-3">
            {esImagen && url && !error && (
              <div role="group" aria-label="Zoom" className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1">
                <button
                  type="button"
                  aria-label="Alejar"
                  className={CLASE_BOTON_OSCURO}
                  disabled={zoom <= ZOOM_MIN}
                  onClick={() => cambiarZoom(zoom - ZOOM_PASO)}
                >
                  <Minus aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Restablecer el zoom"
                  className="min-w-14 rounded-full px-1 text-xs font-semibold tabular-nums text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
                  onClick={() => cambiarZoom(1)}
                >
                  <span aria-live="polite">{Math.round(zoom * 100)} %</span>
                </button>
                <button
                  type="button"
                  aria-label="Acercar"
                  className={CLASE_BOTON_OSCURO}
                  disabled={zoom >= ZOOM_MAX}
                  onClick={() => cambiarZoom(zoom + ZOOM_PASO)}
                >
                  <Plus aria-hidden="true" className="size-4" />
                </button>
              </div>
            )}
            {onDownload && (
              <AtButton
                size="md"
                variant="bordered"
                className="h-10 border-1 border-white/70 px-5 text-[13px] text-white"
                onPress={onDownload}
                isLoading={isDownloading}
              >
                Descargar
              </AtButton>
            )}
            <button type="button" aria-label="Cerrar la vista ampliada" className={cn(CLASE_BOTON_OSCURO, "size-9 bg-white/10")} onClick={onClose}>
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </ModalHeader>
        <ModalBody className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-4 sm:px-8 sm:py-6">
          <div className="flex min-h-0 flex-1">{contenido}</div>
          {footer}
          <p className="text-center text-xs text-white/70">
            {esImagen
              ? "Rueda del mouse para acercar · arrastra para desplazar · Esc o el botón Cerrar para salir"
              : "Esc o el botón Cerrar para salir"}
          </p>
        </ModalBody>
      </ModalContent>
    </AtModal>
  );
}
