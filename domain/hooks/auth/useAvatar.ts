import { useMutation } from "@tanstack/react-query";

import { authService } from "@/domain/services";

import { useSincronizarMe } from "./useMe";

/** `POST /auth/me/avatar` (T-30c): sube el recorte ya preparado en el navegador. */
export function useUploadAvatar() {
  const sincronizar = useSincronizarMe();
  return useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: sincronizar,
  });
}

/** `DELETE /auth/me/avatar` (T-30c): vuelve a las iniciales. */
export function useRemoveAvatar() {
  const sincronizar = useSincronizarMe();
  return useMutation({
    mutationFn: () => authService.removeAvatar(),
    onSuccess: sincronizar,
  });
}
