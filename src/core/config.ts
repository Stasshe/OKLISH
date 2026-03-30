import type { OKLISHConfig } from "./config.types";

const DEFAULT_CONFIG: OKLISHConfig = {
  theme: "dark",
  defaultPanel: "console",
  windowMode: "docked-bottom", //floating
  plugins: [],
  persistState: true,
};

export function resolveConfig(userConfig?: Partial<OKLISHConfig>): OKLISHConfig {
  if (!userConfig) return { ...DEFAULT_CONFIG };
  return { ...DEFAULT_CONFIG, ...userConfig };
}
