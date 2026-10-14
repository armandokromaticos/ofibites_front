import { heroui } from "@heroui/react";

// Tokens del design system (skill ofibites-design → Tokens).
// Escalas 50-400 / 600-900 generadas mezclando el DEFAULT con blanco / negro; 500 = DEFAULT.
export default heroui({
  defaultTheme: "light",
  layout: {
    radius: {
      small: "8px",
      medium: "12px",
      large: "22px",
    },
  },
  themes: {
    light: {
      colors: {
        background: "#F3EEE3",
        foreground: "#000000",
        content1: "#FFFFFF",
        divider: "#DCDCDC",
        focus: "#36381C",
        primary: {
          50: "#F3F3F1",
          100: "#E3E3DF",
          200: "#C7C7BF",
          300: "#A5A599",
          400: "#727460",
          500: "#36381C",
          600: "#2C2E17",
          700: "#232412",
          800: "#1A1B0D",
          900: "#111209",
          DEFAULT: "#36381C",
          foreground: "#FFFFFF",
        },
        secondary: {
          50: "#FEF4F0",
          100: "#FCE5DB",
          200: "#F8CBB8",
          300: "#F4AB8C",
          400: "#EE7C4D",
          500: "#E64400",
          600: "#BD3800",
          700: "#932C00",
          800: "#6E2100",
          900: "#4A1600",
          DEFAULT: "#E64400",
          foreground: "#FFFFFF",
        },
      },
    },
  },
});
