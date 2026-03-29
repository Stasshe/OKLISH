<script lang="ts">
  import type { ConsoleEntry } from './console.types';
  import { themeState } from '../../theme/theme.svelte.ts';
  import JsonViewer from '../../ui/JsonViewer.svelte';
  import { formatArg, isObject, formatTime } from '../../utils/consoleHelpers.ts';

  interface Props {
    entry: ConsoleEntry;
  }

  let { entry }: Props = $props();

  const colors = $derived(themeState.theme.colors);

  const levelColor = $derived(
    entry.level === 'error' ? colors.error :
    entry.level === 'warn' ? colors.warning :
    entry.level === 'info' ? colors.info :
    entry.level === 'debug' ? colors.textMuted :
    colors.text
  );

  const bgColor = $derived(
    entry.level === 'error' ? colors.error + '15' :
    entry.level === 'warn' ? colors.warning + '15' :
    'transparent'
  );

  let expanded = $state(false);
</script>

<div class="log-entry" style="background:{bgColor};border-bottom:1px solid {colors.border}22;">
  <span class="time" style="color:{colors.textMuted};">{formatTime(entry.timestamp)}</span>
  <span class="level-indicator" style="color:{levelColor};">
    {entry.level === 'error' ? '✕' : entry.level === 'warn' ? '⚠' : entry.level === 'info' ? 'ℹ' : '●'}
  </span>
  <div class="content">
    {#each entry.args as arg}
      {#if isObject(arg)}
        <JsonViewer data={arg} />
      {:else}
        <span style="color:{levelColor};">{formatArg(arg)}</span>
      {/if}
      {' '}
    {/each}
    {#if entry.stack}
      <button class="stack-toggle" style="color:{colors.textMuted};" onclick={() => expanded = !expanded}>
        {expanded ? '▼' : '▶'} stack
      </button>
      {#if expanded}
        <pre class="stack" style="color:{colors.textMuted};">{entry.stack}</pre>
      {/if}
    {/if}
  </div>
</div>

<style>
  .log-entry {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1.5;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    min-height: 22px;
  }
  .time { font-size: 10px; flex-shrink: 0; padding-top: 2px; }
  .level-indicator { flex-shrink: 0; font-size: 10px; padding-top: 2px; width: 12px; text-align: center; }
  .content { flex: 1; min-width: 0; word-break: break-all; }
  .stack-toggle { background: none; border: none; cursor: pointer; font-size: 10px; font-family: inherit; padding: 0; margin-top: 2px; }
  .stack { font-size: 10px; margin: 4px 0 0; white-space: pre-wrap; line-height: 1.4; }
</style>
