<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  let sentinel: HTMLElement | null = null;
  let styleEl: HTMLStyleElement | null = null;

  const css = `
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:host {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

input, textarea {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  outline: none;
}

ul, ol {
  list-style: none;
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--oklish-scrollbar, #424242) transparent;
}

html, body, #oklish-root {
  scrollbar-width: thin;
  scrollbar-color: var(--oklish-scrollbar, #424242) transparent;
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02));
  border-radius: 12px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.15)), var(--oklish-scrollbar, #424242);
  background-blend-mode: overlay;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.6);
  border: 3px solid rgba(0,0,0,0.0);
  min-height: 36px;
  transition: background-color var(--oklish-transition), box-shadow var(--oklish-transition), transform 160ms var(--oklish-transition);
  -webkit-appearance: none;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2)), var(--oklish-accent, #0078d4);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.7);
}

::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(0,0,0,0.25)), var(--oklish-accent, #0078d4);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.75);
  transform: scale(0.98);
}

::-webkit-scrollbar-corner {
  background: transparent;
}
`;

  onMount(() => {
    try {
      const root = sentinel && sentinel.getRootNode ? sentinel.getRootNode() as Document | ShadowRoot : document;
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-oklish-global-styles', '');
      styleEl.textContent = css;
      if (root && root instanceof ShadowRoot) {
        root.appendChild(styleEl);
      } else {
        document.head.appendChild(styleEl);
      }
    } catch (err) {
    }
  });

  onDestroy(() => {
    if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
  });
</script>

<div bind:this={sentinel} aria-hidden="true" style="position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-1"></div>
