// Banners de marketing: `GET /api/banners` (público). Alineado con `BannerResponseDto` del back
// (`src/core/application/dto/banners/banner-response.dto.ts`).

/** Query de `GET /banners`. `section` es un texto libre (`home-carousel` = carrusel del Dashboard). */
export interface BannerQuery {
  section?: string;
  /** `true`: solo los activos (y dentro de su rango de fechas, si lo tienen). */
  active?: boolean;
}

export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string | null;
  imageMobileUrl: string | null;
  altText: string;
  linkUrl: string | null;
  section: string;
  order: number;
  backgroundColor: string | null;
  /** ISO 8601. */
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
