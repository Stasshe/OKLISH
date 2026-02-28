import type { OKLISHConfig } from './core/config.types';
import { resolveConfig } from './core/config';
import { mountApp, unmountApp } from './core/mount';
import { installInterceptors, uninstallInterceptors } from './interceptors/manager';
import { consoleState } from './panels/console/console.svelte.ts';
import { networkState } from './panels/network/network.svelte.ts';
import { pluginManager } from './plugins/manager.svelte.ts';
import { panelRegistry } from './panels/registry.svelte.ts';
import { eventBus } from './core/events';
import App from './App.svelte';

let initialized = false;

function init(userConfig?: Partial<OKLISHConfig>): void {
  if (initialized) {
    console.warn('[OKLISH] Already initialized');
    return;
  }

  const config = resolveConfig(userConfig);

  // Install interceptors before mounting UI
  installInterceptors({
    onLog(entry) {
      consoleState.addEntry(entry);
    },
    onRequest(entry) {
      networkState.addRequest(entry);
    },
  });

  // Mount the Svelte app
  mountApp(App, {
    onclose: destroy,
  });

  // Register plugins
  if (config.plugins?.length) {
    for (const plugin of config.plugins) {
      pluginManager.register(plugin as any);
    }
  }

  // Set default panel
  if (config.defaultPanel) {
    panelRegistry.setActive(config.defaultPanel);
  }

  initialized = true;
}

function destroy(): void {
  if (!initialized) return;

  pluginManager.destroyAll();
  uninstallInterceptors();
  unmountApp();
  panelRegistry.clear();
  eventBus.clear();

  initialized = false;
}

function registerPlugin(plugin: unknown): void {
  pluginManager.register(plugin as any);
}

// Public API
const OKLISH = { init, destroy, registerPlugin };

// UMD global registration
if (typeof window !== 'undefined') {
  (window as any).OKLISH = OKLISH;
}

export default OKLISH;
export { init, destroy, registerPlugin };
export type { OKLISHConfig };
