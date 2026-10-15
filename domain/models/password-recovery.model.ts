/**
 * Enlace de recuperación de Supabase al llegar a `/reset-password` (decisión 2026-10-15):
 * - válido: `#access_token=…&type=recovery&…`
 * - con error: `#error=access_denied&error_code=otp_expired&error_description=…` (a veces en la query)
 */
export type RecoveryLink =
  | { status: "valid"; accessToken: string }
  /** `otp_expired`: el enlace venció o ya se usó. */
  | { status: "expired" }
  /** Sin token, de otro tipo o con otro error. */
  | { status: "invalid" };

export function parseRecoveryLink(hash: string, search: string): RecoveryLink {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const query = new URLSearchParams(search);

  const errorCode = fragment.get("error_code") ?? query.get("error_code");
  const error = fragment.get("error") ?? query.get("error");
  if (error || errorCode) return { status: errorCode === "otp_expired" ? "expired" : "invalid" };

  const accessToken = fragment.get("access_token");
  if (accessToken && fragment.get("type") === "recovery") return { status: "valid", accessToken };
  return { status: "invalid" };
}
