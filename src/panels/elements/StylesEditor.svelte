<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { elementsState } from './elements.svelte.ts';

  const colors = $derived(themeState.theme.colors);

  const styles = $derived(() => {
    const el = elementsState.selectedElement;
    if (!el) return [];
    const computed = window.getComputedStyle(el);
    const important = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'border', 'background', 'color', 'font-size', 'font-family',
      'flex', 'grid', 'overflow', 'z-index', 'opacity',
    ];
    return important.map(prop => ({
      property: prop,
      value: computed.getPropertyValue(prop),
    })).filter(s => s.value && s.value !== 'none' && s.value !== 'normal');
  });
</script>

<div class="styles-editor" style="background:{colors.bg};color:{colors.text};">
  {#if elementsState.selectedElement}
    <div class="header" style="color:{colors.textSecondary};border-bottom:1px solid {colors.border};">
      Computed Styles - &lt;{elementsState.selectedElement.tagName.toLowerCase()}&gt;
    </div>
    <div class="style-list">
      {#each styles() as style}
        <div class="style-row" style="border-bottom:1px solid {colors.border}22;">
          <span class="prop" style="color:{colors.accent};">{style.property}</span>
          <span class="val" style="color:{colors.text};">{style.value}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty" style="color:{colors.textMuted};">Select an element to inspect styles</div>
  {/if}
</div>

<style>
  .styles-editor { height: 100%; overflow: auto; font-size: 10px; font-family: 'SF Mono', Monaco, monospace; }
  .header { padding: 2px 4px; font-size: 9px; font-weight: 500; }
  .style-list { padding: 1px 0; }
  .style-row { display: flex; gap: 4px; padding: 0 4px; align-items: center; }
  .prop { min-width: 72px; font-size: 0.95em; }
  .val { flex: 1; font-size: 0.95em; word-break: normal; overflow-wrap: anywhere; }
  .empty { padding: 10px; text-align: center; font-size: 10px; }
</style>
