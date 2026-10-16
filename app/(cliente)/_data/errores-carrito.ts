import { isApiError } from "@/shared/utils";

export type AccionCarrito = "quitar" | "vaciar" | "actualizar";

/**
 * Mensaje en español para un fallo al cambiar el carrito. Los textos del back (algunos en inglés, con ids) no se
 * muestran: solo el código decide el mensaje.
 */
export function mensajeErrorCarrito(error: unknown, accion: AccionCarrito): string {
  if (isApiError(error) && error.statusCode === 404) {
    return accion === "vaciar"
      ? "No encontramos el carrito de tu empresa. Recarga la página."
      : "Ese producto ya no estaba en el carrito: actualizamos tu pedido.";
  }
  if (isApiError(error) && error.statusCode === 403) return "No tienes permisos para cambiar este carrito.";
  if (accion === "quitar") return "No pudimos quitar el producto. Inténtalo de nuevo.";
  if (accion === "vaciar") return "No pudimos vaciar el carrito. Inténtalo de nuevo.";
  return "No pudimos cambiar la cantidad. Inténtalo de nuevo.";
}
