"use client";

import { useMemo } from "react";

import { QRCodeSVG } from "qrcode.react";

import { OrOrderQrCodeProps } from "./or-order-qr-code.types";

/** QR de una orden: codifica solo `{ orderId, shortCode }` (el formato que lee `OrQrScanner`). */
export function OrOrderQrCode({
  orderId,
  shortCode,
  size = 200,
}: OrOrderQrCodeProps) {
  const qrPayload = useMemo(
    () => JSON.stringify({ orderId, shortCode }),
    [orderId, shortCode],
  );

  return (
    <div className="inline-flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <QRCodeSVG value={qrPayload} size={size} marginSize={4} level="M" />
      <p className="text-sm text-gray-600">
        Código: <span className="font-semibold">{shortCode}</span>
      </p>
    </div>
  );
}
