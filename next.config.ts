import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las rutas de solo desarrollo (catálogo /dev/ui) usan `page.dev.tsx`: el build de producción no las ve.
  pageExtensions:
    process.env.NODE_ENV === "production" ? ["tsx", "ts"] : ["tsx", "ts", "dev.tsx"],
  experimental: {
    // T-17: transiciones entre rutas con <ViewTransition> de React (el canary que trae Next 16).
    viewTransition: true,
  },
};

export default nextConfig;
