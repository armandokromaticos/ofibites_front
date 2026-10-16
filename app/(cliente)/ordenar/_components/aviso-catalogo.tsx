"use client";

import { ReactNode } from "react";

import { X } from "lucide-react";

interface AvisoCatalogoProps {
  icon: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

/** Aviso discreto sobre el catálogo (no lo bloquea): se anuncia como estado y se puede cerrar. */
export function AvisoCatalogo({ icon, children, onClose }: AvisoCatalogoProps) {
  return (
    <div
      role="status"
      className="ofi-slide-up flex items-start gap-3 rounded-2xl border border-surface-sand bg-content1 py-3 pl-4 pr-2 text-[13px] font-semibold leading-[18px] text-primary"
    >
      <span aria-hidden="true" className="mt-px flex shrink-0 text-brand [&_svg]:size-4">
        {icon}
      </span>
      <p className="flex-1 py-px">{children}</p>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={onClose}
        className="-my-1 flex size-7 shrink-0 items-center justify-center rounded-full text-muted outline-none transition-colors duration-(--duration-fast) hover:bg-background hover:text-primary focus-visible:outline-2 focus-visible:outline-focus"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
