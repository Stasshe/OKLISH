import SamplePanel from "./SamplePanel.svelte";
import type { Plugin, PluginAPI } from "./plugin.types";

let _api: PluginAPI | null = null;

const handler = (...args: unknown[]) => {
  console.log("[sample-plugin] received", args);
};

export const samplePlugin: Plugin = {
  name: "sample-plugin",
  version: "0.0.1",
  init(api) {
    _api = api;
    api.events.on("sample:trigger", handler);

    api.storage.set("greeting", { text: "Hello from sample plugin" });
    api.events.emit("sample:greeting", "Hello from sample plugin");

    console.log("[sample-plugin] initialized");
  },
  destroy() {
    if (_api) {
      _api.events.off("sample:trigger", handler);
      _api = null;
    }
    console.log("[sample-plugin] destroyed");
  },
  panel: {
    name: "sample",
    label: "Sample",
    icon: "plugin",
    order: 999,
    component: SamplePanel,
  },
};
