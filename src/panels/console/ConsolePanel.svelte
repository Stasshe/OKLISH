<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { consoleState } from './console.svelte.ts';
  import type { ConsoleFilter } from './console.types';
  import LogEntry from './LogEntry.svelte';
  import CommandInput from './CommandInput.svelte';
  import SearchInput from '../../ui/SearchInput.svelte';

  const colors = $derived(themeState.theme.colors);

  const filters: { name: ConsoleFilter; label: string }[] = [
    { name: 'all', label: 'All' },
    { name: 'error', label: 'Errors' },
    { name: 'warn', label: 'Warnings' },
    { name: 'log', label: 'Logs' },
    { name: 'info', label: 'Info' },
    { name: 'debug', label: 'Debug' },
  ];

  let copied = $state(false);

  function copyLogs() {
    const stringifyArg = (a: unknown) => {
      if (typeof a === 'string') return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    };

    const text = consoleState.entries
      .map((e) => `[${e.level.toUpperCase()}] ${e.args.map(stringifyArg).join(' ')}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    });
  }
</script>

<div class="console-panel">
  <div class="toolbar" style="border-bottom:1px solid {colors.border};background:{colors.bgSecondary};">
    <button class="clear-btn" style="color:{colors.textSecondary};" title="Clear console" onclick={() => consoleState.clear()}>
      ⊘
    </button>
    <div class="filters">
      {#each filters as f}
        {@const count = consoleState.counts[f.name]}
        <button
          class="filter-btn"
          class:active={consoleState.filter === f.name}
          style="color:{consoleState.filter === f.name ? colors.accent : colors.textSecondary};"
          onclick={() => consoleState.setFilter(f.name)}
        >
          {f.label}{count > 0 ? ` (${count})` : ''}
        </button>
      {/each}
    </div>
    <SearchInput value={consoleState.searchQuery} onchange={(v) => consoleState.setSearch(v)} placeholder="Filter output..." />
    <button
      class="copy-btn"
      style="color:{copied ? colors.accent : colors.textSecondary};"
      title="Copy visible logs"
      onclick={copyLogs}
    >
      {copied ? 'Copied!' : '⎘'}
    </button>
  </div>

  <div class="log-list" style="background:{colors.bg};">
    {#each consoleState.entries as entry (entry.id)}
      <LogEntry {entry} />
    {/each}
    {#if consoleState.entries.length === 0}
      <div class="empty" style="color:{colors.textMuted};">No console output</div>
    {/if}
  </div>

  <CommandInput />
</div>

<style>
  .console-panel { display: flex; flex-direction: column; height: 100%; font-size: 12px; }
  .toolbar { display: flex; align-items: center; gap: 6px; padding: 2px 6px; flex-shrink: 0; }
  .clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 0 4px;
  }
  .clear-btn:hover { opacity: 0.8; }
  .filters { display: flex; gap: 4px; flex: 1; }
  .filter-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: inherit;
  }
  .filter-btn:hover { opacity: 0.8; }
  .filter-btn.active { font-weight: 600; }
  .copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 11px;
    padding: 0 4px;
    font-family: inherit;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .copy-btn:hover { opacity: 0.8; }
  .log-list { flex: 1; overflow-y: auto; min-height: 0; }
  .empty { padding: 12px; text-align: center; font-size: 11px; }
</style>