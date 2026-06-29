export const tokens = {
  colors: {
    primary: {
      DEFAULT: "#2563eb",
      foreground: "#ffffff",
      hover: "#1d4ed8",
    },
    secondary: {
      DEFAULT: "#f4f4f5",
      foreground: "#18181b",
    },
    destructive: {
      DEFAULT: "#dc2626",
      foreground: "#ffffff",
    },
    muted: {
      DEFAULT: "#f4f4f5",
      foreground: "#71717a",
    },
    border: "#e4e4e7",
    background: "#ffffff",
    foreground: "#09090b",
    card: "#ffffff",
    input: "#e4e4e7",
    ring: "#2563eb",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    full: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
} as const;

export type DesignTokens = typeof tokens;
