import type { DomNodeData } from "./elements.types";

let selectedElement = $state<HTMLElement | null>(null);
let inspectMode = $state(false);

export const elementsState = {
  get selectedElement(): HTMLElement | null {
    return selectedElement;
  },
  get inspectMode(): boolean {
    return inspectMode;
  },
  select(el: HTMLElement | null): void {
    selectedElement = el;
    try {
      window.dispatchEvent(new CustomEvent("oklish:selected-element", { detail: el }));
    } catch (e) {
      // ignore in non-browser environments
    }
  },
  toggleInspect(): void {
    // use setInspect so event is dispatched
    this.setInspect(!inspectMode);
  },
  setInspect(v: boolean): void {
    inspectMode = v;
    try {
      window.dispatchEvent(new CustomEvent("oklish:inspect-mode", { detail: v }));
    } catch (e) {
      // ignore in non-browser environments
    }
  },
};
