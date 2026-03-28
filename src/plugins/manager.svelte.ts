import { createPluginAPI } from "./api";
import type { Plugin } from "./plugin.types";

let plugins = $state<Plugin[]>([]);

export const pluginManager = {
  get plugins(): Plugin[] {
    return plugins;
  },
  register(plugin: Plugin): void {
    if (plugins.find((p) => p.name === plugin.name)) return;

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!plugins.find((p) => p.name === dep)) {
          console.warn(
            `[OKLISH] Plugin "${plugin.name}" requires "${dep}" which is not registered`,
          );
          return;
        }
      }
    }

    const api = createPluginAPI(plugin.name);
    plugin.init(api);

    if (plugin.panel) {
      api.panels.register(plugin.panel);
    }

    plugins = [...plugins, plugin];
  },
  unregister(name: string): void {
    const plugin = plugins.find((p) => p.name === name);
    if (plugin) {
      plugin.destroy();
      plugins = plugins.filter((p) => p.name !== name);
    }
  },
  destroyAll(): void {
    for (const plugin of [...plugins].reverse()) {
      plugin.destroy();
    }
    plugins = [];
  },
};
