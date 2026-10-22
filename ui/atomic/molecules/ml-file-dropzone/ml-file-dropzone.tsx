"use client";

import { DragEvent, useId, useState } from "react";

import { cn } from "@heroui/react";
import { ArrowUp } from "lucide-react";

import { MlFileDropzoneProps } from "./ml-file-dropzone.types";

/**
 * Zona para arrastrar un archivo o buscarlo en el equipo (Figma `3702:2466` y `3702:16948`). El control es un
 * `<input type="file">` nativo, visualmente oculto pero enfocable, con su `<label>` pintado como botón
 * ("Buscar en mi equipo"): con teclado se llega con Tab y Enter o Espacio abren el selector. Un clic en cualquier
 * parte de la zona también lo abre. No valida: entrega el archivo y quien la usa decide.
 */
export function MlFileDropzone({
  title,
  browseLabel,
  accept,
  onFileSelect,
  isInvalid = false,
  isDisabled = false,
  id,
  describedBy,
  inputRef,
  className,
}: MlFileDropzoneProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    const file = event.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center",
        "transition-colors duration-(--duration-fast) ease-out",
        isInvalid ? "border-accent bg-danger-50" : "border-brand-soft bg-background/60",
        isDragging && !isDisabled && "border-primary bg-brand-soft/30",
        isDisabled ? "opacity-60" : "cursor-pointer",
        className,
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isDisabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={(event) => {
        // El label ya abre el selector: sin esta salida, se abriría dos veces.
        if (isDisabled || (event.target as Element).closest("label, input")) return;
        document.getElementById(inputId)?.click();
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mb-2 flex size-14 items-center justify-center rounded-full",
          isInvalid ? "bg-accent/15 text-secondary-600" : "bg-brand-soft/40 text-brand",
        )}
      >
        <ArrowUp className="size-5" strokeWidth={2.5} />
      </span>
      <p className="text-sm font-semibold leading-5 text-foreground">{title}</p>
      <p aria-hidden="true" className="text-xs leading-4 text-muted">
        o
      </p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={isDisabled}
        aria-describedby={describedBy}
        aria-invalid={isInvalid || undefined}
        className="peer sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Vaciar el valor deja volver a elegir el mismo archivo (si no, no hay `change`).
          event.target.value = "";
          if (file) onFileSelect(file);
        }}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex h-10 items-center rounded-full border border-primary bg-content1 px-5 text-[13px] font-semibold text-primary",
          "transition-colors duration-(--duration-instant) ease-out hover:bg-primary/5",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
          isDisabled ? "pointer-events-none" : "cursor-pointer",
        )}
      >
        {browseLabel}
      </label>
    </div>
  );
}
