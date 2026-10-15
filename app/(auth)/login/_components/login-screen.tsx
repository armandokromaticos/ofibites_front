"use client";

import { OrProductMarquee, TmAuthLayout, TmAuthShowcaseLayout } from "@/app/lib/atomic";

import { LoginForm } from "./login-form";
import { LoginVariant } from "./login-variant";
import { LOGIN_SURTIDOS } from "./surtidos";

/** v1: login del Figma (foto fija). v2: mosaico vivo de surtidos. El formulario es el mismo. */
export function LoginScreen({ variant }: { variant: LoginVariant }) {
  if (variant === "v2") {
    return (
      <TmAuthShowcaseLayout
        showcase={({ paused }) => (
          <OrProductMarquee items={LOGIN_SURTIDOS} paused={paused} className="h-full" />
        )}
      >
        <LoginForm align="start" />
      </TmAuthShowcaseLayout>
    );
  }

  return (
    <TmAuthLayout>
      <LoginForm />
    </TmAuthLayout>
  );
}
