import type { ThemeName, Theme } from './theme.types';
import { themes } from './themes';

// We don't use createPersistedState here to avoid circular dependency.
// Theme persistence is handled manually.
const THEME_KEY = 'oklish:theme';

function loadThemeName(): ThemeName {
  const stored = sessionStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

let currentThemeName = $state<ThemeName>(loadThemeName());

export const themeState = {
  get name(): ThemeName {
    return currentThemeName;
  },
  get theme(): Theme {
    return themes[currentThemeName];
  },
  toggle(): void {
    currentThemeName = currentThemeName === 'dark' ? 'light' : 'dark';
    sessionStorage.setItem(THEME_KEY, currentThemeName);
  },
  set(name: ThemeName): void {
    currentThemeName = name;
    sessionStorage.setItem(THEME_KEY, name);
  },
};
