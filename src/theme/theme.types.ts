export type ThemeName = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSecondary: string;
  accent: string;
  accentHover: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  scrollbar: string;
  scrollbarHover: string;
  selection: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
}
