// Sedes de una empresa: `GET /api/companies/:companyId/branches` (CLIENT miembro activo de la empresa).
// Alineado con `BranchResponseDto` del back (`src/core/application/dto/branches/branch-response.dto.ts`).
// Usado por "Pedidos realizados" (T-28b) para resolver `Order.branchId` a un nombre (filtro "Sede" y columna).

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
