import { useEffect, useMemo } from "react";

/** Object URLs vivos por `Blob`, con cuántos componentes los usan (miniatura y vista ampliada a la vez). */
const vivos = new Map<Blob, { url: string; usos: number }>();

function liberarSiNadieLoUsa(blob: Blob): void {
  const entrada = vivos.get(blob);
  if (!entrada || entrada.usos > 0) return;
  URL.revokeObjectURL(entrada.url);
  vivos.delete(blob);
}

/**
 * `blob:` URL de un archivo descargado con sesión (PDF de la factura, comprobante), para un `<img>` o un `<iframe>`.
 * Se libera cuando ningún componente la usa. La liberación espera un tic: en StrictMode el efecto se desmonta y se
 * vuelve a montar con la misma URL, y revocarla en medio la dejaría rota.
 */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const url = useMemo(() => {
    if (!blob || typeof URL === "undefined") return null;
    let entrada = vivos.get(blob);
    if (!entrada) {
      entrada = { url: URL.createObjectURL(blob), usos: 0 };
      vivos.set(blob, entrada);
    }
    return entrada.url;
  }, [blob]);

  useEffect(() => {
    if (!blob || !url) return;
    const entrada = vivos.get(blob);
    if (entrada) entrada.usos += 1;
    return () => {
      const actual = vivos.get(blob);
      if (actual) actual.usos -= 1;
      setTimeout(() => liberarSiNadieLoUsa(blob), 0);
    };
  }, [blob, url]);

  return url;
}
