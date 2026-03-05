import { ReactNode } from "react";

export interface MlStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: "default" | "success" | "warning" | "danger";
  icon?: ReactNode;
}
