<script lang="ts">
  import type { Snippet } from 'svelte';
  import { themeState } from '../theme/theme.svelte.ts';
  import Self from './TreeView.svelte';

  interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
  }

  interface Props {
    nodes: TreeNode[];
    selectedId?: string;
    onselect?: (id: string) => void;
  }

  let { nodes, selectedId, onselect }: Props = $props();

  const colors = $derived(themeState.theme.colors);

  let expandedIds = $state<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedIds = next;
  }
</script>

<div class="tree-view" role="tree">
  {#each nodes as node}
    {@const hasChildren = node.children && node.children.length > 0}
    {@const isExpanded = expandedIds.has(node.id)}
    <div>
      <button
        type="button"
        class="tree-node"
        class:selected={selectedId === node.id}
        style="background:{selectedId === node.id ? colors.selection : 'transparent'};color:{colors.text};"
        onclick={() => { if (hasChildren) toggle(node.id); onselect?.(node.id); }}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <span class="arrow" style="visibility:{hasChildren ? 'visible' : 'hidden'};">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span>{node.label}</span>
      </button>
      {#if hasChildren && isExpanded}
        <div class="children">
          <Self nodes={node.children!} {selectedId} {onselect} />
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .tree-view { font-size: 12px; }
  .tree-node {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    cursor: pointer;
    white-space: nowrap;
    border: none;
    background: transparent;
    font: inherit;
  }
  .tree-node:hover { opacity: 0.85; }
  .tree-node:focus { outline: 2px solid rgba(0,0,0,0.15); outline-offset: 2px; }
  .arrow { font-size: 8px; width: 12px; text-align: center; flex-shrink: 0; }
  .children { padding-left: 16px; }
</style>
