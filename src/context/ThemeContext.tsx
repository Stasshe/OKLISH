import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type ThemeName = 'dark' | 'light' | 'solarized-dark';

export interface Theme {
  name: ThemeName;
  background: string;
  foreground: string;
  border: string;
  header: string;
  headerText: string;
  shadow: string;
  accent: string;
}

const themes: Record<ThemeName, Theme> = {
  'dark': {
    name: 'dark',
    background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', // deep blue-gray gradient
    foreground: '#f3f6fa',
    border: 'rgba(80,180,255,0.25)',
    header: 'rgba(30,40,60,0.95)',
    headerText: '#e3e8ef',
    shadow: '0 8px 32px 0 rgba(0,40,80,0.25)',
    accent: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)', // neon blue
  },
  'light': {
    name: 'light',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // soft neutral gradient
    foreground: '#222b3a',
    border: 'rgba(120,120,140,0.12)',
    header: 'rgba(255,255,255,0.95)',
    headerText: '#2a3140',
    shadow: '0 8px 32px 0 rgba(180,200,220,0.18)',
    accent: 'linear-gradient(90deg, #ffb6b9 0%, #fcd34d 100%)', // pastel pink-yellow
  },
  'solarized-dark': {
    name: 'solarized-dark',
    background: 'linear-gradient(135deg, #002b36 0%, #073642 100%)',
    foreground: '#eee8d5',
    border: 'rgba(181,137,0,0.25)',
    header: 'rgba(7,54,66,0.97)',
    headerText: '#fdf6e3',
    shadow: '0 8px 32px 0 rgba(38,139,210,0.18)',
    accent: 'linear-gradient(90deg, #b58900 0%, #268bd2 100%)', // gold to blue
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({
  children,
  initialTheme = 'dark',
}: {
  children: ReactNode;
  initialTheme?: ThemeName;
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const theme = useMemo(() => themes[themeName], [themeName]);
  const setTheme = (name: ThemeName) => setThemeName(name);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
