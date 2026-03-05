"use client";

import { useState } from "react";

import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/shared/config";

export function Providers(
  { children }: { children: React.ReactNode }
) {
  const [queryClient] = useState(
    () => createQueryClient()
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </QueryClientProvider>
  );
}
