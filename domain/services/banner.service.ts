import { Banner, BannerQuery } from "@/domain/types";
import { fetcher } from "@/shared/utils/fetch";

export const bannerService = {
  /** Endpoint público (sin token ni `X-Company-Id`). `active: true` deja solo los vigentes. */
  list: ({ section, active }: BannerQuery = {}): Promise<Banner[]> => {
    const params = new URLSearchParams();
    if (section) params.set("section", section);
    if (active) params.set("active", "true");
    const qs = params.toString();
    return fetcher<Banner[]>(`/banners${qs ? `?${qs}` : ""}`);
  },
};
