"use client";

import { useMemo } from "react";

import { QRCodeSVG } from "qrcode.react";

type OrderQRCodeProps = {
  orderId: string;
  shortCode: string;
  size?: number;
};

export function OrderQRCode({
  orderId,
  shortCode,
  size = 200,
}: OrderQRCodeProps) {
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
