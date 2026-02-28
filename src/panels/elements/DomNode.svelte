<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { elementsState } from './elements.svelte.ts';
  import DomNode from './DomNode.svelte';

  interface Props {
    element: HTMLElement;
    depth?: number;
  }

  let { element, depth = 0 }: Props = $props();

  const colors = $derived(themeState.theme.colors);
  // svelte-ignore state_referenced_locally
  const initiallyExpanded = depth < 2;
  let expanded = $state(initiallyExpanded);

  const tagName = $derived(element.tagName?.toLowerCase() ?? '');
  const hasChildren = $derived(element.children?.length > 0);
  const isSelected = $derived(elementsState.selectedElement === element);

  function getAttributeString(): string {
    if (!element.attributes) return '';
    const attrs: string[] = [];
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name === 'id') attrs.unshift(`id="${attr.value}"`);
      else if (attr.name === 'class') attrs.push(`class="${attr.value}"`);
      else attrs.push(`${attr.name}="${attr.value}"`);
    }
    return attrs.length ? ' ' + attrs.join(' ') : '';
  }
</script>

<div class="dom-node">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="node-line"
    class:selected={isSelected}
    style="padding-left:{depth * 16}px;background:{isSelected ? colors.selection : 'transparent'};"
    onclick={(e) => { e.stopPropagation(); elementsState.select(element); }}
  >
    {#if hasChildren}
      <button class="expand-btn" style="color:{colors.textMuted};" onclick={(e) => { e.stopPropagation(); expanded = !expanded; }}>
        {expanded ? '▼' : '▶'}
      </button>
    {:else}
      <span class="expand-placeholder"></span>
    {/if}
    <span style="color:{colors.accent};">&lt;{tagName}</span><span style="color:{colors.success};">{getAttributeString()}</span><span style="color:{colors.accent};">&gt;</span>
    {#if !hasChildren && element.textContent}
      <span style="color:{colors.text};" class="text-content">{element.textContent.slice(0, 50)}</span>
      <span style="color:{colors.accent};">&lt;/{tagName}&gt;</span>
    {/if}
  </div>

  {#if hasChildren && expanded}
    {#each Array.from(element.children) as child}
      {#if child instanceof HTMLElement}
        <DomNode element={child} depth={depth + 1} />
      {/if}
    {/each}
    <div style="padding-left:{depth * 16}px;">
      <span class="expand-placeholder"></span>
      <span style="color:{colors.accent};">&lt;/{tagName}&gt;</span>
    </div>
  {/if}
</div>

<style>
  .dom-node { font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 12px; }
  .node-line { display: flex; align-items: center; gap: 2px; padding: 1px 8px; cursor: pointer; white-space: nowrap; min-height: 20px; }
  .node-line:hover { opacity: 0.85; }
  .expand-btn { background: none; border: none; cursor: pointer; font-size: 8px; width: 14px; padding: 0; flex-shrink: 0; }
  .expand-placeholder { width: 14px; flex-shrink: 0; display: inline-block; }
  .text-content { max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
</style>
