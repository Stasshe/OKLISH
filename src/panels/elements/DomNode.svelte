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

  // DOM ref for this node's line so we can scroll it into view when selected
  let nodeLineEl: HTMLDivElement | null = null;

  const tagName = $derived(element.tagName?.toLowerCase() ?? '');
  const hasChildren = $derived(element.children?.length > 0);
  const isSelected = $derived(elementsState.selectedElement === element);

  // When the global selected element changes:
  // - if the selected element is a descendant of this node's element, expand this node
  // - if this node *is* the selected element, scroll this node into view
  $effect(() => {
    const sel = elementsState.selectedElement as Element | null;
    if (!sel) return;

    try {
      if (sel === element) {
        // ensure this node is visible, defer to next tick so DOM exists
        setTimeout(() => {
          if (nodeLineEl) {
            nodeLineEl.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
          }
        }, 0);
      } else if (element.contains?.(sel)) {
        expanded = true;
      }
    } catch (e) {
      // defensive: some nodes may throw on contains in weird contexts
    }
  });

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
    bind:this={nodeLineEl}
    class:selected={isSelected}
    style="padding-left:{depth * 12}px;background:{isSelected ? colors.selection : 'transparent'};"
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
    <div style="padding-left:{depth * 12}px;">
      <span class="expand-placeholder"></span>
      <span style="color:{colors.accent};">&lt;/{tagName}&gt;</span>
    </div>
  {/if}
</div>

<style>
  .dom-node { font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 11px; user-select: none; }
  .node-line { display: flex; align-items: center; gap: 1px; padding: 0 6px; cursor: pointer; white-space: nowrap; min-height: 18px; }
  .node-line:hover { opacity: 0.85; }
  .expand-btn { background: none; border: none; cursor: pointer; font-size: 8px; width: 12px; padding: 0; flex-shrink: 0; }
  .expand-placeholder { width: 12px; flex-shrink: 0; display: inline-block; }
  .text-content { max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
</style>
