<script lang="ts">
  import { themeState } from '../theme/theme.svelte.ts';
  import { windowState } from './window.svelte.ts';
  import { panelRegistry } from '../panels/registry.svelte.ts';

  interface Props {
    ondragstart?: (e: PointerEvent) => void;
    ondragstartTouch?: (e: TouchEvent) => void;
    onclose?: () => void;
  }

  let { ondragstart, ondragstartTouch, onclose }: Props = $props();

  const colors = $derived(themeState.theme.colors);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="titlebar" style="background:{colors.bgSecondary};border-bottom:1px solid {colors.border};" onpointerdown={ondragstart} ontouchstart={ondragstartTouch}>
  <div class="tabs">
    {#each panelRegistry.panels as panel}
      <button
        class="tab"
        class:active={panelRegistry.activePanel === panel.name}
        style="color:{panelRegistry.activePanel === panel.name ? colors.text : colors.textSecondary};background:{panelRegistry.activePanel === panel.name ? colors.bg : 'transparent'};border-bottom:{panelRegistry.activePanel === panel.name ? `2px solid ${colors.accent}` : '2px solid transparent'};"
        onclick={() => panelRegistry.setActive(panel.name)}
        onpointerdown={(e) => e.stopPropagation()}
        ontouchstart={(e) => e.stopPropagation()}
      >
        {panel.label}
      </button>
    {/each}
  </div>
  <div class="actions" onpointerdown={(e) => e.stopPropagation()} ontouchstart={(e) => e.stopPropagation()}>
    <button class="action-btn" style="color:{colors.textSecondary}" title="Switch window mode" onclick={() => windowState.cycleMode()}>
      {#if windowState.isFloating}
        <!-- Dock icon (action: dock) -->
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 8h20"></path>
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M6 16h12"></path>
        </svg>
      {:else}
        <!-- App window icon (action: float) -->
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M10 4v4"></path>
          <path d="M2 8h20"></path>
          <path d="M6 4v4"></path>
        </svg>
      {/if}
    </button>
    <button class="action-btn" style="color:{colors.textSecondary}" title="Minimize" onclick={() => windowState.minimized = true}>
      <!-- Minimize2 icon -->
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 14 10 14 10 20"></polyline>
        <polyline points="20 10 14 10 14 4"></polyline>
        <line x1="14" x2="21" y1="10" y2="3"></line>
        <line x1="3" x2="10" y1="21" y2="14"></line>
      </svg>
    </button>
  </div>
</div>

<style>
  .titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    padding: 0 4px;
    user-select: none;
    touch-action: none;
    cursor: grab;
    flex-shrink: 0;
  }
  .titlebar:active { cursor: grabbing; }
  .tabs {
    display: flex;
    gap: 0;
    overflow-x: auto;
    flex: 1;
    height: 100%;
  }
  .tab {
    border: none;
    padding: 0 12px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .tab:hover { opacity: 0.8; }
  .actions {
    display: flex;
    gap: 2px;
    align-items: center;
    padding: 0 2px;
  }
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  .action-btn:hover { opacity: 0.7; }
</style>
