"use client";

import { Modal } from "@heroui/react";

import { modalMotionProps } from "@/shared/motion";

import { AtModalProps } from "./at-modal.types";

/** Modal con el motion del sitio. Con reduced-motion, `MotionConfig` deja solo el fundido. */
export function AtModal({ motionProps = modalMotionProps, ...props }: AtModalProps) {
  return <Modal motionProps={motionProps} {...props} />;
}
