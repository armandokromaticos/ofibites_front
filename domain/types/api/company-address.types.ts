// Direcciones de una empresa: `GET /api/companies/:companyId/addresses` (CLIENT miembro activo de la empresa).
// Alineado con `CompanyAddressResponseDto` del back (`src/core/application/dto/company-addresses/`).
// `contactName`/`contactPhone`/`isPrimary` y `GET .../addresses/:id/blocking-orders` son de T-31a (back),
// IMPLEMENTADO en `CONTRATOS-API.md` el 2026-10-22; requiere aplicar a mano en Supabase la migración
// `prisma/migrations/20261022_direcciones_contacto/migration.sql` (ver BITACORA) antes de probar contra el back real.

export interface CompanyAddress {
  id: string;
  companyId: string;
  /** Nombre corto ("Oficina principal"). */
  label: string;
  line1: string;
  line2: string | null;
  reference: string | null;
  city: string;
  state: string | null;
  country: string;
  zip: string | null;
  isBilling: boolean;
  isShipping: boolean;
  /** T-31a: "Quién recibe" del Figma `3657:2154`. */
  contactName: string | null;
  /** T-31a: "Teléfono de contacto", texto libre (sin validación de formato, como `User.phone`). */
  contactPhone: string | null;
  /** T-31a: "Marcar como sede principal" (una sola por empresa; el back mantiene el invariante al guardar). */
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Body de `POST /companies/:companyId/addresses` (`CreateCompanyAddressDto`). Solo COMPANY_ADMIN de la empresa (o
 * SUPER_ADMIN / OPS_ADMIN de plataforma); el resto recibe 403.
 */
export interface CreateCompanyAddressRequest {
  /** ≤ 150. */
  label: string;
  /** ≤ 255. */
  line1: string;
  line2?: string;
  /** ≤ 500. */
  reference?: string;
  /** ≤ 150. */
  city: string;
  state?: string;
  /** ≤ 150. */
  country: string;
  zip?: string;
  isBilling?: boolean;
  /** Por defecto `true` en el back. */
  isShipping?: boolean;
  /** T-31a: requerido, recortado, ≤ 150. */
  contactName: string;
  /** T-31a: requerido, recortado, ≤ 30. */
  contactPhone: string;
  /** T-31a: opcional, default `false`. */
  isPrimary?: boolean;
}

/**
 * Body de `PATCH /companies/:companyId/addresses/:id` (`UpdateCompanyAddressDto`). Todos opcionales; los que
 * admiten `null` lo borran. `contactName`/`contactPhone` son la excepción (T-31a, mismo patrón que `label`):
 * si se envían, no pueden ir vacíos ni `null` (400) — se omiten para no tocarlos.
 */
export interface UpdateCompanyAddressRequest {
  label?: string;
  line1?: string;
  line2?: string | null;
  reference?: string | null;
  city?: string;
  state?: string | null;
  country?: string;
  zip?: string | null;
  isBilling?: boolean;
  isShipping?: boolean;
  /** T-31a: ≤ 150, no vacío si se envía. */
  contactName?: string;
  /** T-31a: ≤ 30, no vacío si se envía. */
  contactPhone?: string;
  /** T-31a. */
  isPrimary?: boolean;
}

/**
 * Un pedido en curso que usa la dirección (`GET /companies/:companyId/addresses/:id/blocking-orders`, T-31a,
 * IMPLEMENTADO): avisa en el modal de "Eliminar sede" (Figma `3659:2271`) antes de intentar el `DELETE`, que
 * sigue siendo el gate real (409 si de todos modos hay pedidos asociados).
 */
export interface CompanyAddressBlockingOrder {
  orderNumber: string;
  /** ISO 8601 (medianoche UTC de la fecha de entrega); `null` solo en pedidos muy antiguos sin fecha. */
  deliveryDate: string | null;
}
