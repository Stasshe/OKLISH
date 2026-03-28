import type { Component } from "svelte";

export interface PanelDefinition {
  name: string;
  label: string;
  icon: string;
  order: number;
  component: Component;
}
