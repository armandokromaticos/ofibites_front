import { useQuery } from "@tanstack/react-query";

import {
  RECOMMENDATION_CATEGORY_SECTIONS,
  toAddressNames,
  toCatalogNames,
  toClientDashboardUser,
  toDashboardOrders,
  toPromotions,
  toRecommendations,
} from "@/domain/adapters";
import { ClientDashboard, ClientRecommendationCategory } from "@/domain/models";
import { bannerService, catalogService, companyAddressService, orderService } from "@/domain/services";
import { useAuthStore } from "@/domain/stores";
import { CatalogItem } from "@/domain/types";

import { conEstadoQaDashboard, EstadoQaDashboard } from "./estado-qa";

export const CLIENT_DASHBOARD_QUERY_KEY = ["client-dashboard"] as const;

/** Sección del carrusel principal en `GET /banners`. */
const SECCION_BANNERS = "home-carousel";

/** Máximo de `pageSize` de `GET /catalog` (más responde 400). */
const CATALOG_PAGE_SIZE = 48;

/** Ítems de una sección del catálogo. Si la sección no existe (404) o falla, sin ítems: no rompe el Dashboard. */
const itemsDeSeccion = (section: string): Promise<CatalogItem[]> =>
  catalogService
    .get({ section, pageSize: CATALOG_PAGE_SIZE })
    .then((respuesta) => respuesta.items.data)
    .catch(() => []);

/**
 * Compone el Dashboard con los endpoints existentes (no hay uno propio), todo en paralelo:
 * - promociones: `GET /banners?section=home-carousel&active=true` (público).
 * - recomendaciones: `GET /catalog?section=` de desayunos, coffee-break y bebidas.
 * - pedidos: `GET /orders` (con `X-Company-Id`), nombrados con el catálogo y las direcciones de la empresa.
 * Sin empresa activa, sin pedidos. El usuario sale de la sesión.
 */
async function getClientDashboard(companyId: string | null): Promise<ClientDashboard> {
  const categorias = Object.keys(RECOMMENDATION_CATEGORY_SECTIONS) as ClientRecommendationCategory[];
  const [banners, catalogo, porSeccion, orders, addresses] = await Promise.all([
    // Si falla, el Dashboard sale sin promociones.
    bannerService.list({ section: SECCION_BANNERS, active: true }).catch(() => []),
    // Solo para nombrar los pedidos: si falla, se llaman "Pedido".
    catalogService
      .get({ pageSize: CATALOG_PAGE_SIZE })
      .then((respuesta) => respuesta.items.data)
      .catch(() => []),
    Promise.all(categorias.map((c) => itemsDeSeccion(RECOMMENDATION_CATEGORY_SECTIONS[c]))),
    companyId ? orderService.list() : Promise.resolve([]),
    // Un rol sin permiso (403) deja los pedidos sin dirección.
    companyId ? companyAddressService.list(companyId).catch(() => []) : Promise.resolve([]),
  ]);

  const porCategoria = Object.fromEntries(
    categorias.map((categoria, i) => [categoria, porSeccion[i]]),
  ) as Record<ClientRecommendationCategory, CatalogItem[]>;
  const { user, memberships } = useAuthStore.getState();

  return {
    user: toClientDashboardUser(user, memberships, companyId),
    promotions: toPromotions(banners),
    recommendations: toRecommendations(porCategoria),
    ...toDashboardOrders(orders, toCatalogNames(catalogo, ...porSeccion), toAddressNames(addresses)),
  };
}

interface UseClientDashboardOptions {
  /** Fuerza un estado de QA (solo desarrollo, lo filtra `app/(cliente)/dashboard/page.tsx`). */
  qaState?: EstadoQaDashboard;
}

/** Dashboard del cliente de la empresa activa (la clave lleva su id: cada empresa tiene sus pedidos). */
export function useClientDashboard({ qaState }: UseClientDashboardOptions = {}) {
  const companyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [...CLIENT_DASHBOARD_QUERY_KEY, companyId, qaState ?? "real"],
    queryFn: conEstadoQaDashboard(qaState, () => getClientDashboard(companyId)),
    // En QA no se reutiliza un éxito cacheado: cada visita a `?estado=` vuelve a simular el estado.
    ...(qaState && { gcTime: 0, staleTime: 0 }),
  });
}
