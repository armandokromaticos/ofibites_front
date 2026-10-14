/** Soluciones de interés (enum `RegistrationSolution` del back). Orden de los chips. */
export const REGISTRATION_SOLUTIONS = [
  "COFFEE_BREAK",
  "WORKING_LUNCH",
  "SNACKS",
  "DESSERTS",
  "BEVERAGES",
] as const;
export type RegistrationSolution = (typeof REGISTRATION_SOLUTIONS)[number];

/** Textos en español de `RegistrationSolution` (los pone el front, ver el contrato). */
export const REGISTRATION_SOLUTION_LABELS: Record<RegistrationSolution, string> = {
  COFFEE_BREAK: "Coffee break",
  WORKING_LUNCH: "Working lunch",
  SNACKS: "Para picar",
  DESSERTS: "Postres",
  BEVERAGES: "Bebidas",
};

/** Frecuencia estimada de pedidos (enum `OrderFrequency` del back). */
export const ORDER_FREQUENCIES = [
  "DAILY",
  "SEVERAL_TIMES_A_WEEK",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "OCCASIONAL",
] as const;
export type OrderFrequency = (typeof ORDER_FREQUENCIES)[number];

export const ORDER_FREQUENCY_LABELS: Record<OrderFrequency, string> = {
  DAILY: "Diaria",
  SEVERAL_TIMES_A_WEEK: "Varias veces por semana",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  OCCASIONAL: "Ocasional",
};

/** Personas por pedido (enum `PeoplePerOrderRange` del back). */
export const PEOPLE_PER_ORDER_RANGES = [
  "FROM_1_TO_10",
  "FROM_11_TO_25",
  "FROM_26_TO_50",
  "FROM_51_TO_100",
  "MORE_THAN_100",
] as const;
export type PeoplePerOrderRange = (typeof PEOPLE_PER_ORDER_RANGES)[number];

export const PEOPLE_PER_ORDER_LABELS: Record<PeoplePerOrderRange, string> = {
  FROM_1_TO_10: "1 a 10",
  FROM_11_TO_25: "11 a 25",
  FROM_26_TO_50: "26 a 50",
  FROM_51_TO_100: "51 a 100",
  MORE_THAN_100: "Más de 100",
};

/** `POST /api/company-requests` (público). Ver gestion/CONTRATOS-API.md. */
export interface CreateCompanyRequest {
  /** Razón social. Máx. 200. */
  legalName: string;
  /** RIF. Máx. 50. */
  taxId: string;
  /** Máx. 150. */
  contactName: string;
  /** Email válido. Máx. 150. */
  contactEmail: string;
  /** Máx. 50. */
  contactPhone: string;
  /** Cargo. Opcional, máx. 100. */
  position?: string;
  /** Entero de 1 a 1.000.000. Opcional. Se envía como número, nunca como string. */
  employeeCount?: number;
  /** Necesidad general. Obligatorio, máx. 500; no puede quedar vacío tras el `trim`. */
  generalNeed: string;
  /** Al menos 1, sin repetidos. */
  interestedSolutions: RegistrationSolution[];
  orderFrequency: OrderFrequency;
  peoplePerOrder: PeoplePerOrderRange;
  /** Opcional, máx. 1000. No se envía la clave si va vacío. */
  additionalComments?: string;
}

export type CompanyRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CompanyRequestResponse {
  id: string;
  legalName: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  position: string | null;
  employeeCount: number | null;
  /** Las solicitudes anteriores a T-11 no tienen necesidades: `null` y `[]`. */
  generalNeed: string | null;
  interestedSolutions: RegistrationSolution[];
  orderFrequency: OrderFrequency | null;
  peoplePerOrder: PeoplePerOrderRange | null;
  additionalComments: string | null;
  status: CompanyRequestStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  approvedCompanyId: string | null;
  createdAt: string;
  updatedAt: string;
}
