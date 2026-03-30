<script lang="ts">
  import { panelRegistry } from './registry.svelte.ts';
  import { themeState } from '../theme/theme.svelte.ts';

  const colors = $derived(themeState.theme.colors);
  const activePanel = $derived(panelRegistry.panels.find(p => p.name === panelRegistry.activePanel));
</script>

<div class="panel-container" style="background:{colors.bg};color:{colors.text};">
  {#if activePanel}
    <activePanel.component />
  {:else}
    <div class="empty" style="color:{colors.textMuted};">No panel selected</div>
  {/if}
</div>

<style>
  .panel-container { width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column; overscroll-behavior: contain; }
  .empty { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 12px; }
</style>
