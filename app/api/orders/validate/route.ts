import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL } from "@/shared/constants";

type BackendValidationResponse = {
  valid?: boolean;
  message?: string;
  orderId?: string;
  status?: string;
  id?: string;
};

function buildAuthHeaders(request: NextRequest): HeadersInit {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return {};
  }

  return {
    Authorization: authorization,
  };
}

export async function GET(request: NextRequest) {
  const shortCode = request.nextUrl.searchParams.get("shortCode")?.trim();

  if (!shortCode) {
    return NextResponse.json(
      {
        valid: false,
        message: "shortCode es requerido",
      },
      { status: 400 },
    );
  }

  const headers = buildAuthHeaders(request);
  const encoded = encodeURIComponent(shortCode);

  const upstreamUrls = [
    `${API_BASE_URL}/orders/validate?shortCode=${encoded}`,
    `${API_BASE_URL}/orders/code/${encoded}`,
  ];

  const UPSTREAM_TIMEOUT_MS = 5_000;

  let unauthorizedStatus: 401 | 403 | null = null;
  let upstreamErrorStatus: number | null = null;

  for (const url of upstreamUrls) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const body = (await response.json()) as BackendValidationResponse;

        if (typeof body.valid === "boolean") {
          return NextResponse.json(
            {
              valid: body.valid,
              message: body.message ?? (body.valid ? "Orden válida." : "Orden no válida."),
              orderId: body.orderId,
              status: body.status,
            },
            { status: 200 },
          );
        }

        return NextResponse.json(
          {
            valid: true,
            message: "Orden válida.",
            orderId: body.id ?? body.orderId,
            status: body.status,
          },
          { status: 200 },
        );
      }

      if (response.status === 401 || response.status === 403) {
        unauthorizedStatus = response.status;
      } else if (response.status === 404) {
        continue;
      } else {
        upstreamErrorStatus = response.status;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === "AbortError") {
        return NextResponse.json(
          {
            valid: false,
            message: "El backend de órdenes no respondió a tiempo.",
          },
          { status: 504 },
        );
      }

      return NextResponse.json(
        {
          valid: false,
          message: "No se pudo conectar con el backend de órdenes.",
        },
        { status: 502 },
      );
    }
  }

  if (unauthorizedStatus) {
    return NextResponse.json(
      {
        valid: false,
        message: "No autorizado para validar órdenes.",
      },
      { status: unauthorizedStatus },
    );
  }

  if (upstreamErrorStatus) {
    return NextResponse.json(
      {
        valid: false,
        message: "Error inesperado del backend de órdenes.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      valid: false,
      message: "Orden no encontrada.",
    },
    { status: 200 },
  );
}
