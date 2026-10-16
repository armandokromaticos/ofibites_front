"use client";

import { Drawer } from "@heroui/react";
import type { Variants } from "framer-motion";

import { duration, ease } from "@/shared/motion";

import { AtDrawerProps } from "./at-drawer.types";

/** Desplazamiento de entrada/salida por lado, con fundido (con movimiento reducido solo queda el fundido). */
function drawerMotion(placement: NonNullable<AtDrawerProps["placement"]>): { variants: Variants } {
  const isHorizontal = placement === "left" || placement === "right";
  const offset = placement === "left" || placement === "top" ? "-100%" : "100%";
  return {
    variants: {
      enter: {
        ...(isHorizontal ? { x: 0 } : { y: 0 }),
        opacity: 1,
        transition: { duration: duration.base, ease: ease.out },
      },
      exit: {
        ...(isHorizontal ? { x: offset } : { y: offset }),
        opacity: 0,
        transition: { duration: duration.fast, ease: ease.in },
      },
    },
  };
}

export function AtDrawer({ placement = "right", motionProps, classNames, ...props }: AtDrawerProps) {
  return (
    <Drawer
      placement={placement}
      motionProps={motionProps ?? drawerMotion(placement)}
      classNames={{
        ...classNames,
        backdrop: classNames?.backdrop ?? "bg-primary/25 backdrop-blur-[2px]",
        base: classNames?.base ?? "bg-background",
      }}
      {...props}
    />
  );
}
