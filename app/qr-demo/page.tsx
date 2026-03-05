"use client";

import { useState } from "react";

import { OrderQRCode } from "@/app/components/qr/OrderQRCode";
import { QRScanner } from "@/app/components/qr/QRScanner";

type LastScan = {
  orderId: string;
  shortCode: string;
};

const demoOrder = {
  id: "65c685d8-099c-4058-916e-d4b04d097b86",
  shortCode: "2KZXUX",
};

export default function QrDemoPage() {
  const [lastScan, setLastScan] = useState<LastScan | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Generación de QR de Orden
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            El QR solo contiene <strong>orderId</strong> y <strong>shortCode</strong>.
          </p>

          <div className="mt-6">
            <OrderQRCode orderId={demoOrder.id} shortCode={demoOrder.shortCode} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Escáner QR
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Se valida siempre contra backend vía
            {" "}
            <code className="rounded bg-gray-100 px-1 py-0.5">GET /api/orders/validate?shortCode=...</code>
          </p>

          <div className="mt-6">
            <QRScanner onScanSuccess={setLastScan} />
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <p className="font-semibold">Último contenido leído:</p>
            {lastScan ? (
              <pre className="mt-2 overflow-auto text-xs">
                {JSON.stringify(lastScan, null, 2)}
              </pre>
            ) : (
              <p className="mt-2">Sin lecturas todavía.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
