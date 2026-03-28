import type { PanelDefinition } from "../panels/panel.types";

export interface PluginAPI {
  panels: {
    register(panel: PanelDefinition): void;
    getActive(): string;
    setActive(name: string): void;
  };
  storage: {
    get<T>(key: string): T | null;
    set<T>(key: string, value: T): void;
    remove(key: string): void;
  };
  events: {
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, ...args: unknown[]): void;
  };
}

export interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  init(api: PluginAPI): void;
  destroy(): void;
  panel?: PanelDefinition;
}
