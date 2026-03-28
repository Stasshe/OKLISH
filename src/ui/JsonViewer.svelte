<script lang="ts">
  import { themeState } from '../theme/theme.svelte.ts';
  import JsonViewer from './JsonViewer.svelte';

  interface Props {
    data: unknown;
    depth?: number;
    maxDepth?: number;
  }

  let { data, depth = 0, maxDepth = 3 }: Props = $props();

  const colors = $derived(themeState.theme.colors);

  // svelte-ignore state_referenced_locally
  const initiallyExpanded = false;
  let expanded = $state(initiallyExpanded);

  function typeOf(val: unknown): string {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  function formatPrimitive(val: unknown): string {
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  }

  function colorFor(val: unknown): string {
    const t = typeOf(val);
    if (t === 'string') return colors.success;
    if (t === 'number') return colors.info;
    if (t === 'boolean') return colors.warning;
    if (t === 'null' || t === 'undefined') return colors.textMuted;
    return colors.text;
  }

  const isExpandable = $derived(typeOf(data) === 'object' || typeOf(data) === 'array');
  const entries = $derived(isExpandable && data ? Object.entries(data as Record<string, unknown>) : []);
  const preview = $derived(
    typeOf(data) === 'array'
      ? `Array(${(data as unknown[]).length})`
      : `{${entries.slice(0, 3).map(([k]) => k).join(', ')}${entries.length > 3 ? ', ...' : ''}}`
  );
</script>

{#if isExpandable}
  <span class="expandable">
    <button class="toggle" style="color:{colors.textMuted};" onclick={() => expanded = !expanded}>
      {expanded ? '▼' : '▶'}
    </button>
    {#if !expanded}
      <span style="color:{colors.textSecondary};">{preview}</span>
    {:else if depth < maxDepth}
      <span style="color:{colors.textSecondary};">{typeOf(data) === 'array' ? '[' : '{'}</span>
      <div class="children">
        {#each entries as [key, val]}
          <div class="entry">
            <span style="color:{colors.accent};">{key}</span>
            <span style="color:{colors.textMuted};">: </span>
            <JsonViewer data={val} depth={depth + 1} {maxDepth} />
          </div>
        {/each}
      </div>
      <span style="color:{colors.textSecondary};">{typeOf(data) === 'array' ? ']' : '}'}</span>
    {:else}
      <span style="color:{colors.textMuted};">{preview}</span>
    {/if}
  </span>
{:else}
  <span style="color:{colorFor(data)};">{formatPrimitive(data)}</span>
{/if}

<style>
  .expandable { display: inline; }
  .toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 9px;
    padding: 0 3px;
    font-family: inherit;
  }
  .children { padding-left: 16px; }
  .entry { line-height: 1.6; }
</style>
