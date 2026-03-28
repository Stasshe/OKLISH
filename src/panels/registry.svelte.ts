import type { PanelDefinition } from "./panel.types";

const PANEL_KEY = "oklish:activePanel";

function loadActivePanel(): string {
  return sessionStorage.getItem(PANEL_KEY) ?? "console";
}

let panels = $state<PanelDefinition[]>([]);
let activePanel = $state<string>(loadActivePanel());

export const panelRegistry = {
  get panels(): PanelDefinition[] {
    return [...panels].sort((a, b) => a.order - b.order);
  },
  get activePanel(): string {
    return activePanel;
  },
  register(panel: PanelDefinition): void {
    if (!panels.find((p) => p.name === panel.name)) {
      panels = [...panels, panel];
    }
  },
  unregister(name: string): void {
    panels = panels.filter((p) => p.name !== name);
    if (activePanel === name) {
      if (panels.length > 0) {
        activePanel = panels[0].name;
      } else {
        activePanel = "console";
      }
      sessionStorage.setItem(PANEL_KEY, activePanel);
    }
  },
  setActive(name: string): void {
    if (panels.find((p) => p.name === name)) {
      activePanel = name;
      sessionStorage.setItem(PANEL_KEY, name);
    }
  },
  getActive(): string {
    return activePanel;
  },
  clear(): void {
    panels = [];
    activePanel = "console";
    sessionStorage.setItem(PANEL_KEY, "console");
  },
};
