import { ReactNode } from "react";

export interface MlSidebarItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}
