<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { applicationState } from './application.svelte.ts';
  import SearchInput from '../../ui/SearchInput.svelte';

  const colors = $derived(themeState.theme.colors);

  let refreshKey = $state(0);

  function refresh() {
    refreshKey++;
  }

  const entries = $derived.by(() => {
    refreshKey; // Track refresh
    return applicationState.getEntries();
  });
</script>

<div class="storage-viewer">
  <div class="toolbar" style="border-bottom:1px solid {colors.border};background:{colors.bgSecondary};">
    <SearchInput value={applicationState.searchQuery} onchange={(v) => applicationState.setSearch(v)} placeholder="Filter..." />
    <button class="action-btn" style="color:{colors.textSecondary};" title="Refresh" onclick={refresh}>↻</button>
    <button class="action-btn" style="color:{colors.error};" title="Clear all" onclick={() => { applicationState.clearStorage(); refresh(); }}>⊘</button>
  </div>
  <div class="entries">
    <div class="header-row" style="background:{colors.bgSecondary};border-bottom:1px solid {colors.border};">
      <span class="col-key">Key</span>
      <span class="col-val">Value</span>
      <span class="col-action"></span>
    </div>
    {#each entries as entry (entry.key)}
      <div class="row" style="border-bottom:1px solid {colors.border}22;">
        <span class="col-key" style="color:{colors.accent};" title={entry.key}>{entry.key}</span>
        <span class="col-val" title={entry.value}>{entry.value}</span>
        <button class="del-btn" style="color:{colors.error};" title="Delete" onclick={() => { applicationState.removeEntry(entry.key); refresh(); }}>✕</button>
      </div>
    {/each}
    {#if entries.length === 0}
      <div class="empty" style="color:{colors.textMuted};">No entries</div>
    {/if}
  </div>
</div>

<style>
  .storage-viewer { height: 100%; display: flex; flex-direction: column; font-size: 10px; }
  .toolbar { display: flex; align-items: center; gap: 6px; padding: 2px 6px; flex-shrink: 0; }
  .action-btn { background: none; border: none; cursor: pointer; font-size: 12px; padding: 0 4px; }
  .action-btn:hover { opacity: 0.7; }
  .entries { flex: 1; overflow: auto; }
  .header-row, .row { display: flex; padding: 2px 6px; gap: 6px; align-items: center; }
  .header-row { font-weight: 500; position: sticky; top: 0; z-index: 1; flex-shrink: 0; }
  .col-key { width: 30%; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
  .col-val { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'SF Mono', Monaco, monospace; font-size: 10px; }
  .col-action { width: 20px; flex-shrink: 0; }
  .del-btn { background: none; border: none; cursor: pointer; font-size: 9px; padding: 0; opacity: 0.6; }
  .del-btn:hover { opacity: 1; }
  .row { cursor: default; }
  .empty { padding: 16px; text-align: center; font-size: 10px; }
</style>
