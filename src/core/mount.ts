import { mount, unmount, type Component } from 'svelte';
import { HOST_ELEMENT_ID } from './constants';

let hostElement: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let appInstance: Record<string, unknown> | null = null;

export function mountApp(
  AppComponent: Component,
  props: Record<string, unknown> = {},
): void {
  if (hostElement) return; // Already mounted

  hostElement = document.createElement('div');
  hostElement.id = HOST_ELEMENT_ID;
  hostElement.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;top:0;left:0;width:0;height:0;';
  document.body.appendChild(hostElement);

  shadowRoot = hostElement.attachShadow({ mode: 'open' });

  const container = document.createElement('div');
  container.id = 'oklish-root';
  container.style.cssText = 'pointer-events:auto;';
  shadowRoot.appendChild(container);

  appInstance = mount(AppComponent, {
    target: container,
    props,
  });
}

export function unmountApp(): void {
  if (appInstance) {
    unmount(appInstance);
    appInstance = null;
  }
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
    shadowRoot = null;
  }
}

export function getShadowRoot(): ShadowRoot | null {
  return shadowRoot;
}
