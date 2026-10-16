import { CatalogItemDetail, CatalogItemKind, CatalogQuery, CatalogResponse } from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

/** Query string de `GET /catalog`: solo los parámetros con valor (los vacíos los decide el servidor). */
export function catalogQueryString(query: CatalogQuery): string {
  const params = new URLSearchParams();
  if (query.lang) params.set("lang", query.lang);
  if (query.section) params.set("section", query.section);
  if (query.tags?.length) params.set("tags", query.tags.join(","));
  if (query.filter && query.filter !== "all") params.set("filter", query.filter);
  if (query.search) params.set("search", query.search);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const catalogService = {
  /** Catálogo global (`authFetcher` envía `X-Company-Id` si hay empresa activa): categorías, preferencias y una página de ítems. */
  get: (query: CatalogQuery = {}): Promise<CatalogResponse> =>
    authFetcher<CatalogResponse>(`/catalog${catalogQueryString(query)}`),

  /** Ficha de un producto o combo (`GET /catalog/items/:kind/:id`). 404 si no existe o está inactivo. */
  getItem: (kind: CatalogItemKind, id: string, lang?: "es" | "en"): Promise<CatalogItemDetail> =>
    authFetcher<CatalogItemDetail>(`/catalog/items/${kind}/${encodeURIComponent(id)}${lang ? `?lang=${lang}` : ""}`),
};
