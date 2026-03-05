"use client";

import { useEffect, useId, useRef, useState } from "react";

import { tokenManager } from "@/shared/utils/storage";

type QrPayload = {
  orderId: string;
  shortCode: string;
};

type ValidationResponse = {
  valid: boolean;
  message?: string;
  orderId?: string;
  status?: string;
};

type ScannerResult = {
  state: "idle" | "loading" | "valid" | "invalid" | "error";
  message: string;
};

type QRScannerProps = {
  onScanSuccess?: (payload: QrPayload) => void;
};

function getValidationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("failed to fetch")) {
      return "No se pudo conectar con la validación. Verifica que el frontend responda en /api/orders/validate y que el backend esté activo.";
    }

    if (error.name === "AbortError") {
      return "La validación tardó demasiado. Intenta de nuevo y revisa la conexión del servidor.";
    }

    return error.message;
  }

  return "No se pudo leer o validar el QR.";
}

async function validateOrderByShortCode(shortCode: string): Promise<ValidationResponse> {
  const apiUrl =
    typeof window === "undefined"
      ? `/api/orders/validate?shortCode=${encodeURIComponent(shortCode)}`
      : `${window.location.origin}/api/orders/validate?shortCode=${encodeURIComponent(shortCode)}`;

  const token = tokenManager.getAccessToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  const body = (await response.json().catch(() => ({}))) as ValidationResponse;

  if (!response.ok) {
    throw new Error(body.message ?? "No se pudo validar la orden.");
  }

  return body;
}

function parseQrPayload(decodedText: string): QrPayload {
  const parsed = JSON.parse(decodedText) as Partial<QrPayload>;

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

export function QRScanner({ onScanSuccess }: QRScannerProps) {
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

              const validation = await validateOrderByShortCode(payload.shortCode);

              if (validation.valid) {
                setResult({
                  state: "valid",
                  message: validation.message ?? "Orden válida.",
                });

                onScanSuccess?.({
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
              const message = getValidationErrorMessage(error);

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
  }, [onScanSuccess, scannerElementId]);

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
