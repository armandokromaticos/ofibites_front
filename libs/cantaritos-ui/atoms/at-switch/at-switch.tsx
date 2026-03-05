"use client";

import { Switch } from "@heroui/react";

import { AtSwitchProps } from "./at-switch.types";

export function AtSwitch(props: AtSwitchProps) {
  return <Switch {...props} />;
}
