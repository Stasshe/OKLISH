import { STORAGE_PREFIX } from "../core/constants";

export const storageKeys = {
  window: `${STORAGE_PREFIX}window`,
  theme: `${STORAGE_PREFIX}theme`,
  activePanel: `${STORAGE_PREFIX}activePanel`,
  consoleLogs: `${STORAGE_PREFIX}consoleLogs`,
  consoleFilters: `${STORAGE_PREFIX}consoleFilters`,
  networkRequests: `${STORAGE_PREFIX}networkRequests`,
  plugins: `${STORAGE_PREFIX}plugins`,
} as const;
