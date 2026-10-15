export type LoginVariant = "v1" | "v2";

const VARIANTS: readonly LoginVariant[] = ["v1", "v2"];

function isLoginVariant(value: unknown): value is LoginVariant {
  return VARIANTS.includes(value as LoginVariant);
}

/**
 * Variante del login (T-17, reversible):
 * 1. `?login=v1|v2` en la URL la fuerza (para comparar).
 * 2. Si no, `NEXT_PUBLIC_LOGIN_VARIANT` (`v1` | `v2`), que se fija en el build.
 * 3. Sin variable o con otro valor → `v1`, el login del Figma.
 */
export function resolveLoginVariant(override: string | string[] | undefined): LoginVariant {
  const forced = Array.isArray(override) ? override[0] : override;
  if (isLoginVariant(forced)) return forced;
  const configured = process.env.NEXT_PUBLIC_LOGIN_VARIANT;
  return isLoginVariant(configured) ? configured : "v1";
}
