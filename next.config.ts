import type { NextConfig } from "next";

// Host de Supabase Storage para next/image; sin la variable, cualquier proyecto de Supabase.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "**.supabase.co";

const nextConfig: NextConfig = {
  // Las rutas de solo desarrollo (catálogo /dev/ui) usan `page.dev.tsx`: el build de producción no las ve.
  pageExtensions:
    process.env.NODE_ENV === "production" ? ["tsx", "ts"] : ["tsx", "ts", "dev.tsx"],
  experimental: {
    // T-17: transiciones entre rutas con <ViewTransition> de React (el canary que trae Next 16).
    viewTransition: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
