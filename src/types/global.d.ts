import type { OKLISHConfig } from "../core/config.types";

interface OKLISHInstance {
  init(config?: Partial<OKLISHConfig>): void;
  destroy(): void;
  registerPlugin(plugin: unknown): void;
}

declare global {
  interface Window {
    OKLISH: OKLISHInstance;
  }
}
