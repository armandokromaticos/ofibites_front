"use client";

import { useEffect, useId, useRef, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Minus, Plus, X } from "lucide-react";

import {
  checkImageFile,
  cropImageToSquare,
  formatFileSize,
  ImageFileProblem,
  ImageFileRules,
} from "@/shared/utils/image";
import { AtButton, AtModal, AtSlider } from "@/ui/atomic/atoms";
import { MlFileDropzone, MlFormAlert } from "@/ui/atomic/molecules";

import { OrAvatarUploadModalProps } from "./or-avatar-upload-modal.types";

/** Contrato `POST /auth/me/avatar` (T-30c): JPG/PNG, máx. 2.000.000 bytes. El mínimo de 200 px es del Figma. */
const REGLAS: ImageFileRules = {
  mimeTypes: ["image/jpeg", "image/png"],
  extensions: ["jpg", "jpeg", "png"],
  maxBytes: 2_000_000,
  minSide: 200,
};
const ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";
/** Lado del cuadrado que se sube (DECISIONES 2026-10-22). */
const LADO_SALIDA = 512;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_PASO = 0.1;
/** Vistas previas de "Así se verá" (px): tarjeta de perfil, top bar, lista. */
const VISTAS_PREVIAS = [64, 48, 32];

type Paso = "elegir" | "recortar";

interface ImagenValida {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ImagenRechazada {
  file: File;
  problems: ImageFileProblem[];
}

/** Motivo concreto (alerta) y resumen corto (fila del archivo), como en el Figma `3702:16948`. */
function describirRechazo({ file, problems }: ImagenRechazada): { detalle: string; resumen: string } {
  const peso = formatFileSize(file.size);
  const formato = problems.find((p) => p.kind === "format");
  const pesado = problems.some((p) => p.kind === "size");
  const dims = problems.find((p) => p.kind === "dimensions");

  if (problems.some((p) => p.kind === "unreadable")) {
    return {
      detalle: "No pudimos abrir la imagen: puede estar dañada o no ser un JPG o PNG de verdad. Prueba con otra.",
      resumen: `${peso} · no se pudo abrir`,
    };
  }
  if (formato?.kind === "format") {
    return {
      detalle: pesado
        ? `El archivo pesa ${peso} y está en formato ${formato.format}. Conviértelo a JPG o PNG y que pese menos de 2 MB.`
        : `El archivo está en formato ${formato.format}. Conviértelo a JPG o PNG.`,
      resumen: `${peso} · formato no soportado`,
    };
  }
  const frases: string[] = [];
  const resumen: string[] = [peso];
  if (pesado) {
    frases.push(`El archivo pesa ${peso}; elige una imagen de menos de 2 MB.`);
    resumen.push("supera los 2 MB");
  }
  if (dims?.kind === "dimensions") {
    frases.push(
      `La imagen mide ${dims.width} × ${dims.height} px; tiene que medir al menos ${REGLAS.minSide} × ${REGLAS.minSide} px.`,
    );
    resumen.push("muy pequeña");
  }
  return { detalle: frases.join(" "), resumen: resumen.join(" · ") };
}

/** Recorte circular visto a `size` px, a partir del área en porcentajes de la imagen. */
function VistaPrevia({ src, area, size }: { src: string; area: Area | null; size: number }) {
  const ancho = area ? (size * 100) / area.width : size;
  const alto = area ? (size * 100) / area.height : size;
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full bg-surface-sand ring-1 ring-divider"
      style={{ width: size, height: size }}
    >
      {area && (
        // eslint-disable-next-line @next/next/no-img-element -- blob: local del recorte, no pasa por next/image
        <img
          src={src}
          alt=""
          className="absolute max-w-none"
          style={{
            width: ancho,
            height: alto,
            left: -(area.x / 100) * ancho,
            top: -(area.y / 100) * alto,
          }}
        />
      )}
    </span>
  );
}

/**
 * "Subir foto de perfil" (Figma `3702:2466`, no válido `3702:16948`) y "Ajusta tu foto" (`3702:2613`) en un solo
 * modal de dos pasos:
 * 1. Elegir: arrastrar o buscar la imagen. Se valida en el navegador (formato por MIME y extensión, peso del
 *    original ≤ 2 MB y mínimo 200 × 200 px leído al decodificarla); un rechazo explica el motivo concreto en una
 *    alerta que se anuncia, marca la zona en rojo y deja "Continuar" inhabilitado.
 * 2. Recortar: círculo con `react-easy-crop` (arrastrar, rueda, flechas sobre el área), zoom con slider y − / +,
 *    y tres vistas previas. "Guardar foto" exporta el cuadrado de 512 px y llama a `onSave`.
 * Mientras se prepara o se sube, no se cierra (ni Esc ni clic fuera) y los botones quedan quietos. El foco va al
 * título al pasar a recortar y al botón "Buscar en mi equipo" al volver; al cerrar vuelve a quien abrió el modal.
 * Montar con una `key` nueva por apertura para empezar siempre desde cero.
 */
export function OrAvatarUploadModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  saveError,
  onEdit,
}: OrAvatarUploadModalProps) {
  const ids = useId();
  const ayudaId = `${ids}-ayuda`;
  const errorId = `${ids}-error`;

  const [paso, setPaso] = useState<Paso>("elegir");
  const [imagen, setImagen] = useState<ImagenValida | null>(null);
  const [rechazo, setRechazo] = useState<ImagenRechazada | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [areaPct, setAreaPct] = useState<Area | null>(null);
  const [areaPx, setAreaPx] = useState<Area | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const tituloRecorteRef = useRef<HTMLHeadingElement>(null);
  /** A dónde va el foco tras cambiar de paso (se aplica cuando el paso ya se pintó). */
  const focoPendiente = useRef<"titulo" | "input" | null>(null);
  /** Última validación lanzada: descarta la de un archivo anterior que termine después. */
  const validacion = useRef(0);
  /** URL `blob:` viva, para liberarla al cambiar de imagen o al desmontar. */
  const urlViva = useRef<string | null>(null);

  const isBusy = isPreparing || isSaving;

  useEffect(() => {
    return () => {
      if (urlViva.current) URL.revokeObjectURL(urlViva.current);
    };
  }, []);

  useEffect(() => {
    const destino = focoPendiente.current;
    if (!destino) return;
    focoPendiente.current = null;
    if (destino === "titulo") tituloRecorteRef.current?.focus();
    else inputRef.current?.focus();
  }, [paso]);

  const cambiarUrl = (url: string | null) => {
    if (urlViva.current) URL.revokeObjectURL(urlViva.current);
    urlViva.current = url;
  };

  const elegirArchivo = async (file: File) => {
    if (isBusy) return;
    const turno = ++validacion.current;
    setIsChecking(true);
    onEdit?.();
    const resultado = await checkImageFile(file, REGLAS);
    if (turno !== validacion.current) return;
    setIsChecking(false);
    if (resultado.ok) {
      const url = URL.createObjectURL(file);
      cambiarUrl(url);
      setImagen({ file, url, width: resultado.width, height: resultado.height });
      setRechazo(null);
      setCrop({ x: 0, y: 0 });
      setZoom(ZOOM_MIN);
      setAreaPct(null);
      setAreaPx(null);
    } else {
      cambiarUrl(null);
      setImagen(null);
      setRechazo({ file, problems: resultado.problems });
    }
  };

  const quitarArchivo = () => {
    validacion.current += 1;
    setIsChecking(false);
    cambiarUrl(null);
    setImagen(null);
    setRechazo(null);
    inputRef.current?.focus();
  };

  const continuar = () => {
    if (!imagen || isChecking) return;
    focoPendiente.current = "titulo";
    setPrepareError(null);
    setPaso("recortar");
  };

  const cambiarImagen = () => {
    if (isBusy) return;
    onEdit?.();
    setPrepareError(null);
    focoPendiente.current = "input";
    setPaso("elegir");
  };

  const guardar = async () => {
    if (!imagen || !areaPx || isBusy) return;
    setIsPreparing(true);
    setPrepareError(null);
    onEdit?.();
    try {
      const archivo = await cropImageToSquare(imagen.url, areaPx, {
        size: LADO_SALIDA,
        sourceType: imagen.file.type,
        fileName: "avatar",
      });
      if (archivo.size > REGLAS.maxBytes) {
        setPrepareError("La foto recortada sigue pesando más de 2 MB. Prueba con otra imagen.");
        return;
      }
      onSave(archivo);
    } catch {
      setPrepareError("No pudimos preparar la foto en tu navegador. Prueba de nuevo o con otra imagen.");
    } finally {
      setIsPreparing(false);
    }
  };

  const cambiarZoom = (valor: number) => setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, valor)));

  const descripcionRechazo = rechazo ? describirRechazo(rechazo) : null;
  const errorRecorte = prepareError ?? saveError ?? null;

  return (
    <AtModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isBusy) onClose();
      }}
      placement="center"
      scrollBehavior="outside"
      isDismissable={!isBusy}
      isKeyboardDismissDisabled={isBusy}
      hideCloseButton
      classNames={{
        wrapper: "px-4",
        base: "mx-0 my-8 max-w-[560px] rounded-card bg-content1 shadow-popover",
        backdrop: "bg-primary/25 backdrop-blur-[2px]",
      }}
    >
      <ModalContent>
        {paso === "elegir" ? (
          <>
            <ModalHeader className="flex flex-col gap-1 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
              <h2 className="font-display text-[22px] font-bold leading-7 text-foreground">Subir foto de perfil</h2>
              <p className="text-xs font-normal leading-4 text-muted">
                Se muestra en tu perfil, en la barra superior y en el menú lateral.
              </p>
            </ModalHeader>
            <ModalBody className="gap-4 px-5 pb-0 pt-4 sm:px-7">
              <div className="border-t border-divider" />
              {descripcionRechazo && (
                <MlFormAlert id={errorId} title="No pudimos usar ese archivo." className="bg-danger-50">
                  {descripcionRechazo.detalle}
                </MlFormAlert>
              )}
              <MlFileDropzone
                title={rechazo ? "Arrastra otra imagen" : "Arrastra la imagen aquí"}
                browseLabel="Buscar en mi equipo"
                accept={ACCEPT}
                onFileSelect={(file) => void elegirArchivo(file)}
                isInvalid={Boolean(rechazo)}
                describedBy={rechazo ? `${errorId} ${ayudaId}` : ayudaId}
                inputRef={inputRef}
              />
              {(imagen || rechazo) && (
                <div
                  className={
                    rechazo
                      ? "flex items-center gap-3 rounded-2xl border border-accent bg-content1 px-4 py-3"
                      : "flex items-center gap-3 rounded-2xl border border-divider bg-content1 px-4 py-3"
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      rechazo
                        ? "text-[10px] font-semibold text-secondary-600"
                        : "text-[10px] font-semibold text-brand"
                    }
                  >
                    IMG
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-xs font-semibold leading-5 text-foreground">
                      {(imagen ?? rechazo)!.file.name}
                    </p>
                    <p
                      className={
                        rechazo ? "text-[11px] leading-4 text-secondary-600" : "text-[11px] leading-4 text-muted"
                      }
                    >
                      {descripcionRechazo
                        ? descripcionRechazo.resumen
                        : imagen &&
                          `${formatFileSize(imagen.file.size)} · ${imagen.width} × ${imagen.height} px · lista para ajustar`}
                    </p>
                  </div>
                  <AtButton
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="default"
                    className="size-8 min-w-8 text-muted"
                    aria-label={`Quitar ${(imagen ?? rechazo)!.file.name}`}
                    onPress={quitarArchivo}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </AtButton>
                </div>
              )}
              <p id={ayudaId} className="text-[11px] leading-4 text-muted">
                JPG o PNG · máximo 2 MB · mínimo {REGLAS.minSide} × {REGLAS.minSide} px
              </p>
              {isChecking && (
                <p role="status" className="sr-only">
                  Revisando la imagen…
                </p>
              )}
            </ModalBody>
            <ModalFooter className="mt-4 flex-col-reverse gap-3 border-t border-divider px-5 pb-6 pt-4 sm:mx-7 sm:flex-row sm:items-center sm:px-0 sm:pb-7">
              <p className="text-xs leading-4 text-muted sm:mr-auto">También puedes quedarte con tus iniciales.</p>
              <div className="flex justify-end gap-3">
                <AtButton
                  size="lg"
                  variant="bordered"
                  className="h-12 border-primary px-6 text-sm text-primary"
                  onPress={onClose}
                >
                  Cancelar
                </AtButton>
                <AtButton
                  size="lg"
                  className="h-12 px-6 text-sm aria-disabled:opacity-50"
                  aria-disabled={!imagen || isChecking || undefined}
                  isLoading={isChecking}
                  onPress={continuar}
                >
                  Continuar
                </AtButton>
              </div>
            </ModalFooter>
          </>
        ) : (
          imagen && (
            <>
              <ModalHeader className="flex flex-col gap-1 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
                <h2
                  ref={tituloRecorteRef}
                  tabIndex={-1}
                  className="font-display text-[22px] font-bold leading-7 text-foreground outline-none"
                >
                  Ajusta tu foto
                </h2>
                <p className="text-xs font-normal leading-4 text-muted">
                  Mueve y acerca la imagen hasta que la cara quede dentro del círculo.
                </p>
              </ModalHeader>
              <ModalBody className="gap-4 px-5 pb-0 pt-4 sm:px-7">
                <div className="border-t border-divider" />
                {errorRecorte && (
                  <MlFormAlert title="No pudimos guardar tu foto." className="bg-danger-50">
                    {errorRecorte}
                  </MlFormAlert>
                )}
                <div className="relative h-[260px] overflow-hidden rounded-2xl bg-primary sm:h-[300px]">
                  <Cropper
                    image={imagen.url}
                    crop={crop}
                    zoom={zoom}
                    minZoom={ZOOM_MIN}
                    maxZoom={ZOOM_MAX}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={(punto) => {
                      if (!isBusy) setCrop(punto);
                    }}
                    onZoomChange={(valor) => {
                      if (!isBusy) cambiarZoom(valor);
                    }}
                    onCropAreaChange={(pct, px) => {
                      setAreaPct(pct);
                      setAreaPx(px);
                    }}
                    mediaProps={{ alt: "" }}
                    cropperProps={{
                      role: "group",
                      "aria-roledescription": "área de recorte",
                      "aria-label": "Recorte de la foto. Usa las flechas para mover la imagen.",
                    }}
                    classes={{ cropAreaClassName: "!border-2 !border-white focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-white" }}
                  />
                </div>
                <AtSlider
                  label="Zoom"
                  aria-label="Zoom de la foto"
                  minValue={ZOOM_MIN}
                  maxValue={ZOOM_MAX}
                  step={0.01}
                  value={zoom}
                  isDisabled={isBusy}
                  onChange={(valor) => cambiarZoom(Array.isArray(valor) ? valor[0] : valor)}
                  getValue={(valor) => `${Math.round((Array.isArray(valor) ? valor[0] : valor) * 100)} %`}
                  classNames={{ label: "sr-only", value: "sr-only" }}
                  startContent={
                    <AtButton
                      isIconOnly
                      size="xs"
                      variant="light"
                      color="default"
                      className="size-7 min-w-7 text-foreground"
                      aria-label="Alejar"
                      isDisabled={isBusy || zoom <= ZOOM_MIN}
                      onPress={() => cambiarZoom(zoom - ZOOM_PASO)}
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </AtButton>
                  }
                  endContent={
                    <AtButton
                      isIconOnly
                      size="xs"
                      variant="light"
                      color="default"
                      className="size-7 min-w-7 text-foreground"
                      aria-label="Acercar"
                      isDisabled={isBusy || zoom >= ZOOM_MAX}
                      onPress={() => cambiarZoom(zoom + ZOOM_PASO)}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </AtButton>
                  }
                />
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-background/60 px-4 py-3">
                  <p className="text-xs font-semibold leading-4 text-foreground">Así se verá</p>
                  <div className="flex items-center gap-3" aria-hidden="true">
                    {VISTAS_PREVIAS.map((size) => (
                      <VistaPrevia key={size} src={imagen.url} area={areaPct} size={size} />
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="mt-4 flex-wrap gap-3 border-t border-divider px-5 pb-6 pt-4 sm:mx-7 sm:px-0 sm:pb-7">
                <AtButton
                  size="lg"
                  variant="bordered"
                  className="h-12 border-primary px-6 text-sm text-primary aria-disabled:opacity-50 sm:mr-auto"
                  aria-disabled={isBusy || undefined}
                  onPress={cambiarImagen}
                >
                  Cambiar imagen
                </AtButton>
                <div className="ml-auto flex gap-3">
                  <AtButton
                    size="lg"
                    variant="bordered"
                    className="h-12 border-primary px-6 text-sm text-primary aria-disabled:opacity-50"
                    aria-disabled={isBusy || undefined}
                    onPress={() => {
                      if (!isBusy) onClose();
                    }}
                  >
                    Cancelar
                  </AtButton>
                  <AtButton
                    size="lg"
                    className="h-12 px-6 text-sm"
                    isLoading={isBusy}
                    onPress={() => void guardar()}
                  >
                    {isSaving ? "Guardando…" : "Guardar foto"}
                  </AtButton>
                </div>
              </ModalFooter>
            </>
          )
        )}
      </ModalContent>
    </AtModal>
  );
}
