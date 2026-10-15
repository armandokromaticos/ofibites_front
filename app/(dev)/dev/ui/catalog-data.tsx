// Datos de ejemplo para el catálogo (T-02)
import { BookOpen, FileText, LayoutGrid, Truck, Utensils } from "lucide-react";

import { OrAppSidebarItem, OrAppSidebarUser } from "@/ui/atomic";

export const SAMPLE_NAV_ITEMS: OrAppSidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Panel de control",
    href: "/dev/ui#dashboard",
    icon: <LayoutGrid />,
  },
  {
    key: "ordenar",
    label: "Ordenar",
    description: "Pide comida a la oficina",
    href: "/dev/ui#ordenar",
    icon: <Utensils />,
  },
  {
    key: "pedidos",
    label: "Data y consumo",
    description: "Reportes y consumo",
    href: "/dev/ui#pedidos",
    icon: <FileText />,
  },
  {
    key: "administracion",
    label: "Administración",
    description: "Control de usuarios",
    href: "/dev/ui#administracion",
    icon: <BookOpen />,
  },
];

export const SAMPLE_USER: OrAppSidebarUser = {
  name: "Ma. Gabriela",
  role: "Admin Ofibites",
  avatarSrc: "/images/sample/avatar.webp",
};

export const SAMPLE_PRODUCT = {
  title: "Morning Bite",
  description: "Comienza la jornada con opciones frescas, energéticas y listas para compartir.",
  imageSrc: "/images/products/morning-bite.webp",
  imageAlt: "Caja Morning Bite con croissant, sándwiches, magdalenas, fruta y café",
};

export const SAMPLE_MAIN_BANNER = {
  title: "Coffee Break Ejecutivo",
  subtitle: "Ideal para reuniones de 4 a 15 personas",
  imageSrc: "/images/products/coffee-break-box.webp",
  imageAlt: "Caja de coffee break con bagels, sándwiches y canapés",
  ctaLabel: "Ordenar ahora",
};

export const SAMPLE_SECONDARY_BANNER = {
  title: "Bebidas",
  subtitle: "Bebidas naturales o de contenido saludable",
  imageSrc: "/images/products/bebidas.png",
  imageAlt: "Tres botellas de jugo natural",
};

export const SAMPLE_PROMO_SLIDES = [
  { id: "coffee-break", ...SAMPLE_MAIN_BANNER },
  {
    id: "morning-bite",
    title: "Morning Bite",
    subtitle: "Empieza la jornada con opciones frescas para todo el equipo",
    imageSrc: "/images/products/morning-bite.webp",
    imageAlt: "Caja Morning Bite con croissant, sándwiches, magdalenas, fruta y café",
    ctaLabel: "Ordenar ahora",
  },
];

export const SAMPLE_ACTIVE_ORDER = {
  productName: "Morning bites",
  quantityLabel: "10 boxes",
  etaLabel: "Llega a las 10:30 am",
  statusLabel: "En camino",
  statusIcon: <Truck aria-hidden="true" className="size-3" />,
  progress: 54,
};

export const SAMPLE_ORDERS = [
  {
    id: "56779",
    productName: "Morning bites",
    quantityLabel: "8 boxes",
    statusLabel: "Entregado",
    address: "Av. El Bosque, Torre Principal",
    orderNumber: "56779",
    dateLabel: "4 de Sep",
    dateTime: "2026-09-04T08:15:00-04:00",
  },
  {
    id: "45689",
    productName: "Recharge bites",
    quantityLabel: "9 boxes",
    statusLabel: "Entregado",
    address: "Av. El Bosque, Torre Principal",
    orderNumber: "45689",
    dateLabel: "2 de Sep",
    dateTime: "2026-09-02T14:05:00-04:00",
  },
];
