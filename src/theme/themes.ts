import type { Theme } from "./theme.types";

export const darkTheme: Theme = {
  name: "dark",
  colors: {
    bg: "#1e1e1e",
    bgSecondary: "#252526",
    bgTertiary: "#2d2d30",
    text: "#cccccc",
    textSecondary: "#9d9d9d",
    textMuted: "#6a6a6a",
    border: "#3c3c3c",
    borderSecondary: "#4a4a4a",
    accent: "#0078d4",
    accentHover: "#1a8ceb",
    error: "#f44747",
    warning: "#cca700",
    success: "#89d185",
    info: "#75beff",
    scrollbar: "#424242",
    scrollbarHover: "#4f4f4f",
    selection: "#264f78",
  },
};

export const lightTheme: Theme = {
  name: "light",
  colors: {
    bg: "#ffffff",
    bgSecondary: "#f3f3f3",
    bgTertiary: "#e8e8e8",
    text: "#1e1e1e",
    textSecondary: "#616161",
    textMuted: "#a0a0a0",
    border: "#d4d4d4",
    borderSecondary: "#c8c8c8",
    accent: "#0078d4",
    accentHover: "#106ebe",
    error: "#d32f2f",
    warning: "#f57c00",
    success: "#388e3c",
    info: "#1976d2",
    scrollbar: "#c1c1c1",
    scrollbarHover: "#a8a8a8",
    selection: "#add6ff",
  },
};

export const themes = { dark: darkTheme, light: lightTheme } as const;
