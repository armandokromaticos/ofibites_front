import { ModalProps } from "@heroui/react";

/**
 * Props de HeroUI `Modal`. Por defecto entra con el preset `modal` de `shared/motion` (escala 0.96 → 1
 * y fundido, 320 ms) y sale en 200 ms; un `motionProps` del caller lo sustituye. El contenido se
 * compone con `ModalContent`, `ModalHeader`, `ModalBody` y `ModalFooter` de `@heroui/react`.
 */
export type AtModalProps = ModalProps;
