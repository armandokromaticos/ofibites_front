import {
  BranchBreakdownRow,
  BranchBreakdownTotals,
  ClientDashboardIndicatorsResponse,
  ConsumptionBreakdownDimension,
  DepartmentBreakdownRow,
  DepartmentBreakdownTotals,
  UserBreakdownRow,
} from "@/domain/types";
import { API_BASE_URL } from "@/shared/constants";
import { ApiError } from "@/shared/types";
import { authFetcher, getActiveCompanyId } from "@/shared/utils/fetch";
import { tokenManager } from "@/shared/utils/storage";

const RUTA = "/dashboard/client";

/** `?month=` solo si viene algo; vacío = mes actual (mismo criterio que el back). */
function monthQuery(month: string): string {
  return month ? `?month=${encodeURIComponent(month)}` : "";
}

function withMonth(path: string, month: string): string {
  return `${path}${monthQuery(month)}`;
}

/** Nombre de archivo de respaldo si por algún motivo el back no manda `Content-Disposition`. */
function fallbackFilename(view: ConsumptionBreakdownDimension, month: string): string {
  return `indicadores-${view}-${month || "actual"}.csv`;
}

/** Extrae el `filename` de `Content-Disposition: attachment; filename="indicadores-....csv"`. */
function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : null;
}

function descargarBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Indicadores de Mi perfil (T-32a/T-32b). Contrato **IMPLEMENTADO** en `gestion/CONTRATOS-API.md` ("Mi
 * perfil — Indicadores"): el desglose vive en 3 rutas separadas (no `?dimension=`) y el export es un CSV real
 * del servidor. `X-Company-Id` lo inyecta `authFetcher` solo (empresa activa de la sesión), igual que en
 * cualquier otro endpoint de empresa — también sirve para `breakdown/users`, que lo exige.
 */
export const dashboardService = {
  /** `GET /dashboard/client?month=AAAA-MM`. */
  getClientIndicators: (month: string): Promise<ClientDashboardIndicatorsResponse> =>
    authFetcher<ClientDashboardIndicatorsResponse>(withMonth(RUTA, month)),

  /** `GET /dashboard/client/breakdown/branches?month=AAAA-MM`. */
  getBranchBreakdown: (
    month: string,
  ): Promise<{ rows: BranchBreakdownRow[]; totals: BranchBreakdownTotals }> =>
    authFetcher(withMonth(`${RUTA}/breakdown/branches`, month)),

  /** `GET /dashboard/client/breakdown/departments?month=AAAA-MM`. */
  getDepartmentBreakdown: (
    month: string,
  ): Promise<{ rows: DepartmentBreakdownRow[]; totals: DepartmentBreakdownTotals }> =>
    authFetcher(withMonth(`${RUTA}/breakdown/departments`, month)),

  /**
   * `GET /dashboard/client/breakdown/users?month=AAAA-MM` — el back exige `X-Company-Id` y rol
   * `COMPANY_ADMIN`/`COMPANY_FINANCE` (400/403); el front además oculta la pestaña con `canViewUserBreakdown`.
   */
  getUserBreakdown: (month: string): Promise<{ rows: UserBreakdownRow[] }> =>
    authFetcher(withMonth(`${RUTA}/breakdown/users`, month)),

  /**
   * `GET /dashboard/client/export?view=branch|department|user&month=AAAA-MM`: CSV real, no JSON, así que no
   * usa `authFetcher` (siempre intenta `response.json()`) sino un `fetch` crudo con el Bearer y la empresa
   * activa a mano. Dispara la descarga con el nombre que venga en `Content-Disposition` (el back ya lo
   * compone); solo si por algún motivo no viene, usa un nombre de respaldo.
   */
  exportConsumption: async (view: ConsumptionBreakdownDimension, month: string): Promise<void> => {
    const params = new URLSearchParams({ view });
    if (month) params.set("month", month);
    const url = `${API_BASE_URL}${RUTA}/export?${params.toString()}`;
    const headers: Record<string, string> = {};
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    const companyId = getActiveCompanyId();
    if (companyId) headers["X-Company-Id"] = companyId;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const error: ApiError = { statusCode: response.status, message: response.statusText };
      throw error;
    }
    const filename =
      filenameFromContentDisposition(response.headers.get("Content-Disposition")) ??
      fallbackFilename(view, month);
    descargarBlob(await response.blob(), filename);
  },
};
