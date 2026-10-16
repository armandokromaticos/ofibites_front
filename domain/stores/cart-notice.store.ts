import { create } from "zustand";

interface CartNoticeState {
  /** Aviso para la página del carrito al llegar (p. ej. "Agregamos 3 productos de tu pedido #7728950E"). */
  notice: string | null;
  setNotice: (notice: string | null) => void;
}

/**
 * Aviso efímero que una pantalla deja para `/carrito` antes de navegar (repetir un pedido desde el dashboard).
 * Solo en memoria: no sobrevive a recargar ni se mete en la URL. `/carrito` lo lee y lo borra al montar.
 */
export const useCartNoticeStore = create<CartNoticeState>((set) => ({
  notice: null,
  setNotice: (notice) => set({ notice }),
}));
