// sessionStorage key prefix
export const STORAGE_PREFIX = "oklish:";

// Storage keys
export const STORAGE_KEYS = {
  WINDOW: `${STORAGE_PREFIX}window`,
  THEME: `${STORAGE_PREFIX}theme`,
  ACTIVE_PANEL: `${STORAGE_PREFIX}activePanel`,
  CONSOLE_LOGS: `${STORAGE_PREFIX}consoleLogs`,
  CONSOLE_FILTERS: `${STORAGE_PREFIX}consoleFilters`,
  NETWORK_REQUESTS: `${STORAGE_PREFIX}networkRequests`,
} as const;

// Window dimension defaults
export const WINDOW_DEFAULTS = {
  MIN_WIDTH: 360,
  MIN_HEIGHT: 240,
  MAX_WIDTH_RATIO: 0.9,
  MAX_HEIGHT_RATIO: 0.9,
  DEFAULT_WIDTH: 420,
  DEFAULT_HEIGHT: 360,
  DEFAULT_X: 100,
  DEFAULT_Y: 100,
  DEFAULT_DOCKED_SIZE: 350,
} as const;

// CSS custom property prefix
export const CSS_PREFIX = "oklish";

// Host element ID
export const HOST_ELEMENT_ID = "oklish-host";
