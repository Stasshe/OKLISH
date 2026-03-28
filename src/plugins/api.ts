import { STORAGE_PREFIX } from "../core/constants";
import { eventBus } from "../core/events";
import type { PanelDefinition } from "../panels/panel.types";
import { panelRegistry } from "../panels/registry.svelte.ts";
import type { PluginAPI } from "./plugin.types";

export function createPluginAPI(pluginName: string): PluginAPI {
  const storagePrefix = `${STORAGE_PREFIX}plugin:${pluginName}:`;

  return {
    panels: {
      register(panel: PanelDefinition): void {
        panelRegistry.register(panel);
      },
      getActive(): string {
        return panelRegistry.getActive();
      },
      setActive(name: string): void {
        panelRegistry.setActive(name);
      },
    },
    storage: {
      get<T>(key: string): T | null {
        try {
          const raw = sessionStorage.getItem(storagePrefix + key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      },
      set<T>(key: string, value: T): void {
        try {
          sessionStorage.setItem(storagePrefix + key, JSON.stringify(value));
        } catch {
          /* quota exceeded */
        }
      },
      remove(key: string): void {
        sessionStorage.removeItem(storagePrefix + key);
      },
    },
    events: {
      on(event: string, handler: (...args: unknown[]) => void): void {
        eventBus.on(event, handler);
      },
      off(event: string, handler: (...args: unknown[]) => void): void {
        eventBus.off(event, handler);
      },
      emit(event: string, ...args: unknown[]): void {
        eventBus.emit(event, ...args);
      },
    },
  };
}
