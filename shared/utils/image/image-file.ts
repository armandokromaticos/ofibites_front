/**
 * Validación y recorte de imágenes en el navegador (foto de perfil, T-30d). Sin dependencias de React ni de la API.
 */

export interface ImageFileRules {
  /** MIME admitidos (`image/jpeg`, `image/png`). */
  mimeTypes: readonly string[];
  /** Extensiones admitidas, en minúscula y sin punto. */
  extensions: readonly string[];
  /** Peso máximo del archivo original, en bytes. */
  maxBytes: number;
  /** Lado mínimo, en píxeles (ancho y alto). */
  minSide: number;
}

/** Por qué no sirve un archivo. Puede haber más de un motivo (pesa mucho y además es HEIC). */
export type ImageFileProblem =
  | { kind: "format"; format: string }
  | { kind: "size"; bytes: number }
  | { kind: "dimensions"; width: number; height: number }
  | { kind: "unreadable" };

export type ImageFileCheck =
  | { ok: true; width: number; height: number }
  | { ok: false; problems: ImageFileProblem[] };

function extensionDe(name: string): string {
  const punto = name.lastIndexOf(".");
  return punto === -1 ? "" : name.slice(punto + 1).toLowerCase();
}

/** "HEIC", "WEBP", "GIF"…: la extensión o, sin ella, el subtipo del MIME. */
export function imageFormatLabel(file: File): string {
  const ext = extensionDe(file.name);
  if (ext) return ext.toUpperCase();
  const subtipo = file.type.split("/")[1];
  return subtipo ? subtipo.toUpperCase() : "desconocido";
}

/**
 * Formato por MIME y extensión: la extensión tiene que estar admitida y el MIME también (algunos navegadores dejan el
 * MIME vacío; entonces manda la extensión). Un HEIC renombrado a `.jpg` pasa este filtro, pero no se puede decodificar
 * y cae en `unreadable`.
 */
function formatoValido(file: File, rules: ImageFileRules): boolean {
  const ext = extensionDe(file.name);
  const mimeOk = file.type === "" || rules.mimeTypes.includes(file.type.toLowerCase());
  return rules.extensions.includes(ext) && mimeOk;
}

/** Ancho y alto ya orientados (EXIF), como los pinta `<img>`. `null` si el navegador no puede decodificarla. */
export async function readImageDimensions(
  file: Blob,
): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dims;
    } catch {
      return null;
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Formato, peso y dimensiones mínimas. Las dimensiones solo se leen si el formato es válido. */
export async function checkImageFile(file: File, rules: ImageFileRules): Promise<ImageFileCheck> {
  const problems: ImageFileProblem[] = [];
  const formatOk = formatoValido(file, rules);
  if (!formatOk) problems.push({ kind: "format", format: imageFormatLabel(file) });
  if (file.size > rules.maxBytes) problems.push({ kind: "size", bytes: file.size });
  if (!formatOk) return { ok: false, problems };

  const dims = await readImageDimensions(file);
  if (!dims) return { ok: false, problems: [...problems, { kind: "unreadable" }] };
  if (dims.width < rules.minSide || dims.height < rules.minSide) {
    problems.push({ kind: "dimensions", width: dims.width, height: dims.height });
  }
  return problems.length > 0 ? { ok: false, problems } : { ok: true, ...dims };
}

/** "4,8 MB", "850 KB": en base 1000, como el límite del contrato (2 MB = 2.000.000 bytes). */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toLocaleString("es-VE", { maximumFractionDigits: 1 })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1000)).toLocaleString("es-VE")} KB`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function tieneTransparencia(ctx: CanvasRenderingContext2D, size: number): boolean {
  const { data } = ctx.getImageData(0, 0, size, size);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function canvasABlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo exportar la imagen"))), type, quality);
  });
}

/**
 * Recorta `area` (píxeles de la imagen ya orientada) de `src` y la escala a un cuadrado de `size` px.
 * Sale en JPEG (calidad 0,9) salvo que el original sea PNG y el recorte tenga transparencia: entonces PNG, para no
 * rellenar de negro el fondo transparente.
 */
export async function cropImageToSquare(
  src: string,
  area: PixelArea,
  { size, sourceType, fileName }: { size: number; sourceType: string; fileName: string },
): Promise<File> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no permite dibujar en canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);

  const comoPng = sourceType === "image/png" && tieneTransparencia(ctx, size);
  const type = comoPng ? "image/png" : "image/jpeg";
  const blob = await canvasABlob(canvas, type, comoPng ? undefined : 0.9);
  return new File([blob], `${fileName}.${comoPng ? "png" : "jpg"}`, { type });
}
