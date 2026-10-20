// Departamentos de una empresa: `GET /api/companies/:companyId/departments` (CLIENT miembro activo de la empresa).
// Alineado con `DepartmentResponseDto` del back (`src/core/application/dto/departments/department-response.dto.ts`).
// Usado por "Pedidos realizados" (T-28b) para resolver `Order.departmentId` a un nombre (columna "Departamento").

export interface Department {
  id: string;
  companyId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
