import { ReactNode } from "react";

export type MlStatusNoteTone = "success" | "warning" | "danger" | "neutral";

export interface MlStatusNoteProps {
  tone: MlStatusNoteTone;
  /** "Pago completado". Si se omite, solo se pinta el texto (nota informativa del modal). */
  title?: string;
  /** "Validado por Finanzas el 27/09 · Ref. 00218843". */
  children?: ReactNode;
  id?: string;
  className?: string;
}
