import {
  CompanyMember,
  InviteCompanyMemberRequest,
  ResendMemberInviteResponse,
  ResetMemberPasswordResponse,
  UpdateCompanyMemberRequest,
} from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

// `companyId` va en el path (no en `X-Company-Id`, aunque `authFetcher` igual lo envíe de más: el back lo ignora
// aquí, ver `PlatformOrCompanyRoleGuard.extractCompanyId`, que prioriza el param de ruta).
const ruta = (companyId: string) => `/companies/${encodeURIComponent(companyId)}/members`;
const rutaMiembro = (companyId: string, id: string) => `${ruta(companyId)}/${encodeURIComponent(id)}`;

export const companyMemberService = {
  /** `GET /companies/:companyId/members`: sin paginar ni filtrar en servidor (mismo patrón que T-28b). */
  list: (companyId: string): Promise<CompanyMember[]> => authFetcher<CompanyMember[]>(ruta(companyId)),

  /** `GET /companies/:companyId/members/:id`: un miembro (404 si no existe o es de otra empresa). */
  get: (companyId: string, id: string): Promise<CompanyMember> =>
    authFetcher<CompanyMember>(rutaMiembro(companyId, id)),

  /** `POST /companies/:companyId/members/invite`: crea el `User` y envía la invitación por Supabase. */
  invite: (companyId: string, body: InviteCompanyMemberRequest): Promise<CompanyMember> =>
    authFetcher<CompanyMember>(`${ruta(companyId)}/invite`, { method: "POST", body: JSON.stringify(body) }),

  /** `PATCH /companies/:companyId/members/:id`: editar, desactivar (`{ isActive: false }`) o reactivar. */
  update: (companyId: string, id: string, body: UpdateCompanyMemberRequest): Promise<CompanyMember> =>
    authFetcher<CompanyMember>(rutaMiembro(companyId, id), { method: "PATCH", body: JSON.stringify(body) }),

  /** `POST .../:id/resend-invite`: solo para miembros pendientes (`lastSeenAt === null`). */
  resendInvite: (companyId: string, id: string): Promise<ResendMemberInviteResponse> =>
    authFetcher<ResendMemberInviteResponse>(`${rutaMiembro(companyId, id)}/resend-invite`, { method: "POST" }),

  /** `POST .../:id/reset-password` (T-29a). Solo para miembros con cuenta activa (no pendientes). */
  resetPassword: (companyId: string, id: string): Promise<ResetMemberPasswordResponse> =>
    authFetcher<ResetMemberPasswordResponse>(`${rutaMiembro(companyId, id)}/reset-password`, { method: "POST" }),
};
