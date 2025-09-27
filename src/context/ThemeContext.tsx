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
    background: '#222',
    foreground: '#fff',
    border: '#fff',
    header: '#444',
    headerText: '#fff',
    shadow: '0 4px 24px rgba(0,0,0,0.2)',
    accent: '#4fc3f7',
  },
  'light': {
    name: 'light',
    background: '#fff',
    foreground: '#222',
    border: '#222',
    header: '#f5f5f5',
    headerText: '#222',
    shadow: '0 4px 24px rgba(0,0,0,0.08)',
    accent: '#1976d2',
  },
  'solarized-dark': {
    name: 'solarized-dark',
    background: '#002b36',
    foreground: '#93a1a1',
    border: '#586e75',
    header: '#073642',
    headerText: '#f2f0f0',
    shadow: '0 4px 24px rgba(7,54,66,0.3)',
    accent: '#b58900',
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
