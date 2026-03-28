<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import * as idb from './idb';
  import SearchInput from '../../ui/SearchInput.svelte';

  const colors = $derived(themeState.theme.colors);

  let databases = $state<{ name: string; version?: number }[]>([]);
  let selectedDb = $state<string | null>(null);
  let objectStores = $state<string[]>([]);
  let selectedStore = $state<string | null>(null);
  let entries = $state<{ key: any; value: any }[]>([]);
  let loading = $state(false);
  let refreshKey = $state(0);
  let expanded: Record<number, boolean> = {};

  const columns = $derived.by(() => {
    if (entries.length === 0) return ['key', 'value'];
    const keys = new Set<string>();
    // Always include key
    keys.add('__key');
    
    // Sample first 10 entries to find property names
    for (let i = 0; i < Math.min(entries.length, 10); i++) {
      const val = entries[i].value;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.keys(val).forEach(k => keys.add(k));
      }
    }
    
    // If we only found __key, it's a simple value store
    if (keys.size === 1) return ['__key', 'value'];
    
    return Array.from(keys);
  });

  function refresh() {
    refreshKey++;
    loadDatabases();
  }

  async function loadDatabases() {
    loading = true;
    databases = await idb.listDatabases();
    if (databases.length > 0) {
      if (!selectedDb || !databases.some(d => d.name === selectedDb)) selectedDb = databases[0].name;
      await loadObjectStores(selectedDb);
    } else {
      selectedDb = null;
      objectStores = [];
      selectedStore = null;
      entries = [];
    }
    loading = false;
  }

  async function loadObjectStores(dbName: string | null) {
    if (!dbName) {
      objectStores = [];
      selectedStore = null;
      entries = [];
      return;
    }
    objectStores = await idb.getObjectStoreNames(dbName);
    selectedStore = objectStores[0] ?? null;
    if (selectedStore) await loadEntries(dbName, selectedStore);
  }

  async function loadEntries(dbName: string | null, storeName: string | null) {
    if (!dbName || !storeName) {
      entries = [];
      return;
    }
    loading = true;
    entries = await idb.getEntries(dbName, storeName);
    loading = false;
  }

  async function handleDeleteDb(name: string | null) {
    if (!name) return;
    if (!confirm(`Delete database "${name}"? This is irreversible.`)) return;
    await idb.deleteDatabase(name);
    await loadDatabases();
  }

  async function handleClearStore(dbName: string | null, storeName: string | null) {
    if (!dbName || !storeName) return;
    if (!confirm(`Clear object store "${storeName}" from "${dbName}"? This will remove all entries.`)) return;
    await idb.clearObjectStore(dbName, storeName);
    await loadEntries(dbName, storeName);
  }

  async function handleDeleteEntry(dbName: string | null, storeName: string | null, key: any) {
    if (!dbName || !storeName) return;
    if (!confirm(`Delete entry with key "${String(key)}"?`)) return;
    await idb.deleteEntry(dbName, storeName, key);
    await loadEntries(dbName, storeName);
  }

  function pretty(value: any) {
    try {
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    } catch {
      try {
        return String(value);
      } catch {
        return '[Unserializable]';
      }
    }
  }

  $effect(() => {
    loadDatabases();
  });
</script>

<div class="idb-viewer" style="height:100%;display:flex;flex-direction:column;font-size:11px;color:{colors.text};">
  <div class="toolbar" style="border-bottom:1px solid {colors.border};background:{colors.bgSecondary};padding:6px;display:flex;gap:8px;align-items:center;">
    <button class="action-btn" style="color:{colors.textSecondary};" title="Refresh" onclick={refresh}>↻</button>
    {#if selectedDb}
      <button class="action-btn" style="color:{colors.error};" title="Delete database" onclick={() => handleDeleteDb(selectedDb)}>🗑 Delete DB</button>
    {/if}
    {#if selectedStore}
      <button class="action-btn" style="color:{colors.error};" title="Clear store" onclick={() => handleClearStore(selectedDb, selectedStore)}>⊘ Clear Store</button>
    {/if}
  </div>

  <div class="body" style="display:flex;flex:1;min-height:0;">
    <div class="col db-list" style="width:220px;border-right:1px solid {colors.border};overflow:auto;">
      <div class="section-label" style="padding:6px 8px;color:{colors.textMuted};">Databases</div>
      {#if databases.length > 0}
        {#each databases as db}
          <button type="button" class="db-row" class:active={db.name === selectedDb} style="padding:6px 8px;text-align:left;border:0;background:none;width:100%;cursor:pointer;border-bottom:1px solid {colors.border}22;" onclick={() => { selectedDb = db.name; loadObjectStores(selectedDb); }}>
            <span style="display:block;font-weight:600;color:{db.name === selectedDb ? colors.text : colors.textSecondary};">{db.name}</span>
            <span style="display:block;font-size:11px;color:{colors.textMuted};">v{db.version ?? '—'}</span>
          </button>
        {/each}
      {:else}
        <div class="empty" style="padding:12px;color:{colors.textMuted};">No databases found or browser doesn't expose databases()</div>
      {/if}
    </div>

    <div class="col store-list" style="width:200px;border-right:1px solid {colors.border};overflow:auto;">
      <div class="section-label" style="padding:6px 8px;color:{colors.textMuted};">Object Stores</div>
      {#if objectStores.length > 0}
        {#each objectStores as s}
          <button type="button" class="store-row" class:active={s === selectedStore} style="padding:6px 8px;text-align:left;border:0;background:none;width:100%;cursor:pointer;border-bottom:1px solid {colors.border}22;" onclick={() => { selectedStore = s; loadEntries(selectedDb, selectedStore); }}>
            <span style="color:{s === selectedStore ? colors.text : colors.textSecondary};">{s}</span>
          </button>
        {/each}
      {:else}
        <div class="empty" style="padding:12px;color:{colors.textMuted};">No object stores</div>
      {/if}
    </div>

    <div class="col entries" style="flex:1;overflow:auto;display:flex;flex-direction:column;">
      <div class="table-container" style="flex:1;overflow:auto;">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <thead style="position:sticky;top:0;background:{colors.bgSecondary};z-index:2;">
            <tr>
              <th style="width:24px;border-bottom:1px solid {colors.border};"></th>
              {#each columns as col}
                <th style="padding:6px 8px;text-align:left;font-weight:600;color:{colors.textMuted};border-bottom:1px solid {colors.border};border-right:1px solid {colors.border}22;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                  {col === '__key' ? 'Key' : col}
                </th>
              {/each}
              <th style="width:40px;border-bottom:1px solid {colors.border};"></th>
            </tr>
          </thead>
          <tbody>
            {#if loading}
              <tr>
                <td colspan={columns.length + 2} style="padding:12px;text-align:center;color:{colors.textMuted};">Loading…</td>
              </tr>
            {/if}

            {#each entries as e, i (i)}
              <tr class="row" style="border-bottom:1px solid {colors.border}22;">
                <td style="text-align:center;">
                  <button class="action-btn" title="Toggle" onclick={() => { expanded[i] = !expanded[i]; }}>{expanded[i] ? '▴' : '▾'}</button>
                </td>
                {#each columns as col}
                  <td style="padding:4px 8px;border-right:1px solid {colors.border}11;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'SF Mono', Monaco, monospace;">
                    {#if col === '__key'}
                      <span style="color:{colors.accent};">{String(e.key)}</span>
                    {:else if col === 'value'}
                      {pretty(e.value).slice(0,100)}
                    {:else}
                      {e.value?.[col] !== undefined ? pretty(e.value[col]).slice(0,100) : ''}
                    {/if}
                  </td>
                {/each}
                <td style="text-align:center;">
                  <button class="action-btn" style="color:{colors.error};" title="Delete entry" onclick={() => handleDeleteEntry(selectedDb, selectedStore, e.key)}>✕</button>
                </td>
              </tr>
              {#if expanded[i]}
                <tr>
                  <td colspan={columns.length + 2} style="padding:8px 12px;background:{colors.bg};border-bottom:1px solid {colors.border};">
                    <pre style="white-space:pre-wrap;margin:0;color:{colors.text};font-size:11px;">{pretty(e.value)}</pre>
                  </td>
                </tr>
              {/if}
            {/each}

            {#if entries.length === 0 && !loading}
              <tr>
                <td colspan={columns.length + 2} style="padding:12px;text-align:center;color:{colors.textMuted};">No entries</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<style>
  .action-btn { background: none; border: none; cursor: pointer; font-size: 12px; padding: 2px 4px; }
  .action-btn:hover { opacity: 0.8; }
  .empty { text-align: center; }
  table th, table td { 
    font-size: 11px;
  }
  tr:hover { background: rgba(128, 128, 128, 0.05); }
</style>
