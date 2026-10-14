import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las rutas de solo desarrollo (catálogo /dev/ui) usan `page.dev.tsx`: el build de producción no las ve.
  pageExtensions:
    process.env.NODE_ENV === "production" ? ["tsx", "ts"] : ["tsx", "ts", "dev.tsx"],
};

export default nextConfig;
