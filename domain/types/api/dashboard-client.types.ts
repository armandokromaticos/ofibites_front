/**
 * "Indicadores" de Mi perfil (T-32a/b, Figma overview `3706:2856`, departamento `3707:3278`, usuario
 * `3707:3675`). Tipos alineados con el contrato **IMPLEMENTADO** en `gestion/CONTRATOS-API.md` ("Mi perfil —
 * Indicadores"): extiende `GET /dashboard/client` y suma 3 rutas de desglose (una por dimensión, no
 * `?dimension=`) más `GET /dashboard/client/export`.
 */

export interface OrdersPerDayPoint {
  /** Fecha en hora de Caracas, "YYYY-MM-DD". */
  date: string;
  count: number;
}

export interface RankedProductPoint {
  productId: string;
  name: string;
  quantity: number;
}

/** `GET /dashboard/client?month=AAAA-MM` (extendido en T-32a; sin mes, el mes actual). */
export interface ClientDashboardIndicatorsResponse {
  /** Total histórico del scope (sin filtrar por mes). */
  totalOrders: number;
  /** Pedidos en estados no terminales (histórico, sin desglose por sub-estado). */
  inProgressOrders: number;
  ordersPerDay: OrdersPerDayPoint[];
  dinersServed: number;
  monthInvestment: number;
  /** `null` si el mes anterior no tiene pedidos facturables con qué comparar. */
  monthInvestmentChangePercent: number | null;
  topProducts: RankedProductPoint[];
}

export type ConsumptionBreakdownDimension = "branch" | "department" | "user";

export interface BranchBreakdownRow {
  /** `null` = pedidos sin sede asignada (el back ya manda `name: "Sin sede asignada"` en ese caso). */
  branchId: string | null;
  name: string;
  orders: number;
  dinersServed: number;
  investment: number;
  avgTicket: number;
  /** vs. el mes anterior; `null` si esa sede no facturó nada entonces. */
  changePercent: number | null;
}

export interface BranchBreakdownTotals {
  orders: number;
  dinersServed: number;
  investment: number;
  avgTicket: number;
  changePercent: number | null;
}

export interface DepartmentBreakdownRow {
  /** `null` = pedidos sin departamento asignado. */
  departmentId: string | null;
  name: string;
  /** Sede con más pedidos de ese departamento en el período; `null` si no se puede determinar. */
  mainBranchName: string | null;
  orders: number;
  dinersServed: number;
  investment: number;
  percentOfTotal: number;
}

export interface DepartmentBreakdownTotals {
  orders: number;
  dinersServed: number;
  investment: number;
  percentOfTotal: number;
}

export interface UserBreakdownRow {
  userId: string;
  name: string;
  departmentName: string | null;
  branchName: string | null;
  orders: number;
  investment: number;
  /** ISO 8601. */
  lastOrderAt: string;
}

/**
 * El back expone el desglose en 3 rutas separadas (`breakdown/branches|departments|users`), cada una sin un
 * campo `dimension` en el cuerpo. El front le añade esa etiqueta al recibir la respuesta (`dashboard.service`)
 * para que la UI siga discriminando por tipo con un único componente, como si fuera una sola forma. La
 * dimensión `user` no trae `totals` (el Figma no lo pide para esa pestaña).
 */
export type ConsumptionBreakdownResponse =
  | { dimension: "branch"; rows: BranchBreakdownRow[]; totals: BranchBreakdownTotals }
  | { dimension: "department"; rows: DepartmentBreakdownRow[]; totals: DepartmentBreakdownTotals }
  | { dimension: "user"; rows: UserBreakdownRow[] };
