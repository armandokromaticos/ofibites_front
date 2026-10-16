import { create } from "zustand";

import { CheckoutDraft, ConfirmedOrderSnapshot } from "@/domain/models/checkout.model";

interface CheckoutState {
  /** Paso 1 del checkout de `owner` (usuario + empresa): se conserva al ir a la revisión y volver. */
  draft: CheckoutDraft | null;
  /** `"<userId>:<companyId>"`: un borrador de otra sesión o empresa no se reutiliza. */
  owner: string | null;
  /** El paso 1 se validó y se puede revisar (`/checkout/revision` sin él vuelve a `/checkout`). */
  isDraftReady: boolean;
  /** Último pedido confirmado en esta pestaña: líneas con nombre y sede, que la respuesta del pedido no trae. */
  confirmed: ConfirmedOrderSnapshot | null;
  saveDraft: (owner: string, draft: CheckoutDraft, isReady: boolean) => void;
  /** Tras confirmar: borra el borrador y guarda lo que pinta "Pedido confirmado". */
  confirm: (snapshot: ConfirmedOrderSnapshot) => void;
  reset: () => void;
}

/**
 * Estado del checkout entre sus rutas (`/checkout` → `/checkout/revision` → `/checkout/confirmado/<id>`). Solo en
 * memoria: no guarda datos personales en el navegador; al recargar, el paso 1 empieza de nuevo con los valores por
 * defecto (y la revisión vuelve al paso 1).
 */
export const useCheckoutDraftStore = create<CheckoutState>((set) => ({
  draft: null,
  owner: null,
  isDraftReady: false,
  confirmed: null,
  saveDraft: (owner, draft, isReady) => set({ owner, draft, isDraftReady: isReady }),
  confirm: (snapshot) => set({ draft: null, owner: null, isDraftReady: false, confirmed: snapshot }),
  reset: () => set({ draft: null, owner: null, isDraftReady: false, confirmed: null }),
}));
