"use client";

import { useEffect, useId, useRef, useState } from "react";

import { OrQrScannerPayload, OrQrScannerProps } from "./or-qr-scanner.types";

type ScannerResult = {
  state: "idle" | "loading" | "valid" | "invalid" | "error";
  message: string;
};

function getScanErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo leer o validar el QR.";
}

function parseQrPayload(decodedText: string): OrQrScannerPayload {
  const parsed = JSON.parse(decodedText) as Partial<OrQrScannerPayload>;

  if (
    !parsed ||
    typeof parsed.orderId !== "string" ||
    typeof parsed.shortCode !== "string"
  ) {
    throw new Error("Formato de QR inválido");
  }

  return {
    orderId: parsed.orderId,
    shortCode: parsed.shortCode,
  };
}

/**
 * Escáner de QR de órdenes con la cámara (`html5-qrcode`). Lee `{ orderId, shortCode }` y valida la orden con
 * `onValidate` (la llamada a la API la pone quien lo usa).
 */
export function OrQrScanner({ onValidate, onScanSuccess }: OrQrScannerProps) {
  const scannerElementId = useId().replace(/:/g, "");
  const html5QrcodeRef = useRef<{
    stop: () => Promise<void>;
    clear: () => Promise<void>;
    start: (
      cameraIdOrConfig: string | { facingMode: string },
      configuration: { fps?: number; qrbox?: { width: number; height: number } },
      qrCodeSuccessCallback: (decodedText: string) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void,
    ) => Promise<void>;
  } | null>(null);
  const hasScannedRef = useRef(false);
  // Callbacks en refs: una función nueva en cada render del padre no reinicia la cámara.
  const onValidateRef = useRef(onValidate);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onValidateRef.current = onValidate;
    onScanSuccessRef.current = onScanSuccess;
  }, [onValidate, onScanSuccess]);

  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<ScannerResult>({
    state: "idle",
    message: "Escanea un código QR para validar la orden.",
  });

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!isMounted) {
          return;
        }

        const scanner = new Html5Qrcode(scannerElementId);
        html5QrcodeRef.current = scanner as unknown as typeof html5QrcodeRef.current;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (hasScannedRef.current) {
              return;
            }

            hasScannedRef.current = true;
            setResult({ state: "loading", message: "Validando orden..." });

            try {
              const payload = parseQrPayload(decodedText);

              const validation = await onValidateRef.current(payload.shortCode);

              if (validation.valid) {
                setResult({
                  state: "valid",
                  message: validation.message ?? "Orden válida.",
                });

                onScanSuccessRef.current?.({
                  orderId: validation.orderId ?? payload.orderId,
                  shortCode: payload.shortCode,
                });
              } else {
                setResult({
                  state: "invalid",
                  message: validation.message ?? "La orden no es válida.",
                });
              }
            } catch (error) {
              const message = getScanErrorMessage(error);

              setResult({ state: "error", message });
            }
          },
          () => {
            return;
          },
        );

        setIsReady(true);
      } catch {
        setResult({
          state: "error",
          message: "No fue posible iniciar la cámara.",
        });
      }
    };

    void startScanner();

    return () => {
      isMounted = false;

      const scanner = html5QrcodeRef.current;
      if (!scanner) {
        return;
      }

      void scanner
        .stop()
        .catch(() => {
          return;
        })
        .finally(() => {
          void scanner.clear().catch(() => {
            return;
          });
        });
    };
  }, [scannerElementId]);

  const resetScan = () => {
    hasScannedRef.current = false;
    setResult({
      state: "idle",
      message: "Escanea un código QR para validar la orden.",
    });
  };

  const statusColor =
    result.state === "valid"
      ? "text-green-700"
      : result.state === "invalid" || result.state === "error"
        ? "text-red-700"
        : "text-gray-700";

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4">
      <div id={scannerElementId} className="mx-auto w-full overflow-hidden rounded-lg" />

      <p className={`mt-4 text-sm ${statusColor}`}>{result.message}</p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={resetScan}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={!isReady}
        >
          Escanear otro
        </button>
      </div>
    </div>
  );
}
