<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import * as idb from './idb';
  import JsonViewer from '../../ui/JsonViewer.svelte';

  const colors = $derived(themeState.theme.colors);

  let databases = $state<{ name: string; version?: number }[]>([]);
  let objectStores = $state<Record<string, string[]>>({});
  let entries = $state<Record<string, Record<string, idb.IDBEntry[]>>>({});
  let expanded = $state<Record<string, boolean>>({});
  let editingId = $state<string | null>(null);
  let editingValue = $state<string>('');
  let editError = $state<string>('');
  let loading = $state(false);
  let refreshKey = $state(0);

  function refresh() {
    refreshKey++;
    loadDatabases();
  }

  async function loadDatabases() {
    loading = true;
    try {
      databases = await idb.listDatabases();
      objectStores = {};
      entries = {};
      for (const db of databases) {
        await loadStores(db.name);
      }
    } finally {
      loading = false;
    }
  }

  async function loadStores(dbName: string) {
    try {
      objectStores[dbName] = await idb.getObjectStoreNames(dbName);
      entries[dbName] = {};
      for (const store of objectStores[dbName]) {
        await loadEntries(dbName, store);
      }
    } catch (err) {
      console.error(`Failed to load stores for ${dbName}:`, err);
    }
  }

  async function loadEntries(dbName: string, storeName: string) {
    try {
      const ents = await idb.getEntries(dbName, storeName);
      if (!entries[dbName]) entries[dbName] = {};
      entries[dbName][storeName] = ents;
    } catch (err) {
      console.error(`Failed to load entries for ${dbName}.${storeName}:`, err);
    }
  }

  async function handleDeleteDb(name: string) {
    if (!confirm(`Delete database "${name}"? This is irreversible.`)) return;
    try {
      await idb.deleteDatabase(name);
      await refresh();
    } catch (err) {
      console.error('Failed to delete database:', err);
    }
  }

  async function handleClearStore(dbName: string, storeName: string) {
    if (!confirm(`Clear object store "${storeName}"? This will remove all entries.`)) return;
    try {
      await idb.clearObjectStore(dbName, storeName);
      await loadEntries(dbName, storeName);
    } catch (err) {
      console.error('Failed to clear store:', err);
    }
  }

  async function handleDeleteEntry(dbName: string, storeName: string, key: any) {
    if (!confirm(`Delete entry?`)) return;
    try {
      await idb.deleteEntry(dbName, storeName, key);
      await loadEntries(dbName, storeName);
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }

  function startEdit(id: string, currentValue: any) {
    editingId = id;
    editingValue = typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2);
    editError = '';
  }

  async function saveEdit(dbName: string, storeName: string, key: any, isSimpleValue: boolean) {
    try {
      let newValue: any;
      if (isSimpleValue && !editingValue.includes('{') && !editingValue.includes('[')) {
        newValue = editingValue;
      } else {
        newValue = JSON.parse(editingValue);
      }
      await idb.updateEntry(dbName, storeName, key, newValue);
      editingId = null;
      editError = '';
      await loadEntries(dbName, storeName);
    } catch (err: any) {
      editError = err.message || 'Failed to save';
    }
  }

  function cancelEdit() {
    editingId = null;
    editingValue = '';
    editError = '';
  }

  function toggleNode(id: string) {
    expanded[id] = !expanded[id];
  }

  function isSimpleValue(value: any): boolean {
    return typeof value !== 'object' || value === null || value instanceof Date;
  }

  $effect(() => {
    loadDatabases();
  });
</script>

<div class="idb-viewer" style="height:100%;display:flex;flex-direction:column;font-size:11px;color:{colors.text};">
  <div class="toolbar" style="border-bottom:1px solid {colors.border};background:{colors.bgSecondary};padding:6px 8px;display:flex;gap:8px;align-items:center;">
    <button type="button" class="action-btn" style="color:{colors.textSecondary};" title="Refresh" onclick={refresh}>↻</button>
  </div>

  <div class="content" style="flex:1;overflow:auto;">
    {#if loading}
      <div style="padding:12px;color:{colors.textMuted};">Loading…</div>
    {/if}

    {#each databases as db}
      <div class="node" style="margin-left:0;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid {colors.border}22;transition:background 0.1s;" class="row-hover">
          <button type="button" class="toggle-btn" style="color:{colors.textSecondary};flex-shrink:0;background:none;border:none;cursor:pointer;font-size:11px;padding:0 3px;font-weight:bold;" onclick={() => toggleNode(`db-${db.name}`)}>
            {expanded[`db-${db.name}`] ? '▼' : '▶'}
          </button>
          <span style="color:{colors.accent};font-weight:600;flex:1;">
            📦 {db.name}
            <span style="color:{colors.textMuted};font-size:10px;margin-left:6px;">v{db.version ?? '—'}</span>
          </span>
          <button type="button" class="action-btn" style="color:{colors.error};" title="Delete database" onclick={() => handleDeleteDb(db.name)}>🗑</button>
        </div>

        {#if expanded[`db-${db.name}`]}
          {#if objectStores[db.name]}
            {#each objectStores[db.name] as storeName}
              <div class="node" style="margin-left:16px;display:flex;flex-direction:column;">
                <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid {colors.border}22;transition:background 0.1s;" class="row-hover">
                  <button type="button" class="toggle-btn" style="color:{colors.textSecondary};flex-shrink:0;background:none;border:none;cursor:pointer;font-size:11px;padding:0 3px;font-weight:bold;" onclick={() => toggleNode(`store-${db.name}|${storeName}`)}>
                    {expanded[`store-${db.name}|${storeName}`] ? '▼' : '▶'}
                  </button>
                  <span style="color:{colors.textSecondary};font-weight:500;flex:1;">📋 {storeName}</span>
                  <button type="button" class="action-btn" style="color:{colors.error};" title="Clear store" onclick={() => handleClearStore(db.name, storeName)}>⊘</button>
                </div>

                {#if expanded[`store-${db.name}|${storeName}`]}
                  {#if entries[db.name]?.[storeName]}
                    {#each entries[db.name][storeName] as entry}
                      <div class="node" style="margin-left:16px;display:flex;flex-direction:column;">
                        <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid {colors.border}22;transition:background 0.1s;" class="row-hover">
                          <button type="button" class="toggle-btn" style="color:{colors.textSecondary};flex-shrink:0;background:none;border:none;cursor:pointer;font-size:11px;padding:0 3px;font-weight:bold;" onclick={() => toggleNode(`entry-${db.name}|${storeName}|${String(entry.key)}`)}>
                            {expanded[`entry-${db.name}|${storeName}|${String(entry.key)}`] ? '▼' : '▶'}
                          </button>
                          <span style="color:{colors.accent};font-family:'SF Mono', Monaco, monospace;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                            {String(entry.key)}
                          </span>
                          <button type="button" class="action-btn" style="color:{colors.warning};" title="Edit entry" onclick={() => startEdit(`entry-${db.name}|${storeName}|${String(entry.key)}`, entry.value)}>🖊</button>
                          <button type="button" class="action-btn" style="color:{colors.error};" title="Delete entry" onclick={() => handleDeleteEntry(db.name, storeName, entry.key)}>✕</button>
                        </div>

                        {#if expanded[`entry-${db.name}|${storeName}|${String(entry.key)}`]}
                          <div style="margin-left:16px;padding:8px;border-left:1px solid {colors.border}33;background:{colors.bg};">
                            {#if editingId === `entry-${db.name}|${storeName}|${String(entry.key)}`}
                              <div style="display:flex;flex-direction:column;gap:6px;">
                                {#if isSimpleValue(entry.value)}
                                  <input
                                    type="text"
                                    value={editingValue}
                                    placeholder="Enter value"
                                    onchange={(e) => { editingValue = (e.target as HTMLInputElement).value; }}
                                    style="padding:6px 8px;background:{colors.bgSecondary};color:{colors.text};border:1px solid {colors.border};border-radius:4px;font-family:'SF Mono', Monaco, monospace;font-size:10px;"
                                  />
                                {:else}
                                  <textarea
                                    rows="6"
                                    value={editingValue}
                                    placeholder="Enter JSON"
                                    onchange={(e) => { editingValue = (e.target as HTMLTextAreaElement).value; }}
                                    style="padding:6px 8px;background:{colors.bgSecondary};color:{colors.text};border:1px solid {colors.border};border-radius:4px;font-family:'SF Mono', Monaco, monospace;font-size:10px;resize:vertical;"
                                  ></textarea>
                                {/if}
                                {#if editError}
                                  <div style="color:{colors.error};font-size:11px;">{editError}</div>
                                {/if}
                                <div style="display:flex;gap:6px;">
                                  <button
                                    type="button"
                                    class="action-btn"
                                    style="color:{colors.success};padding:3px 8px;background:{colors.bgSecondary};border:1px solid {colors.success};border-radius:4px;font-size:11px;"
                                    onclick={() => saveEdit(db.name, storeName, entry.key, isSimpleValue(entry.value))}
                                  >
                                    ✓ Save
                                  </button>
                                  <button
                                    type="button"
                                    class="action-btn"
                                    style="color:{colors.textSecondary};padding:3px 8px;background:{colors.bgSecondary};border:1px solid {colors.border};border-radius:4px;font-size:11px;"
                                    onclick={cancelEdit}
                                  >
                                    ✕ Cancel
                                  </button>
                                </div>
                              </div>
                            {:else}
                              <div style="font-size:11px;font-family:'SF Mono', Monaco, monospace;">
                                <JsonViewer data={entry.value} />
                              </div>
                            {/if}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  {/if}
                {/if}
              </div>
            {/each}
          {/if}
        {/if}
      </div>
    {/each}

    {#if databases.length === 0 && !loading}
      <div style="padding:12px;color:{colors.textMuted};text-align:center;">No databases found</div>
    {/if}
  </div>
</div>

<style>
  .idb-viewer {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .content {
    display: flex;
    flex-direction: column;
  }
  .node {
    display: flex;
    flex-direction: column;
  }
  .row-hover:hover {
    background: rgba(128, 128, 128, 0.05);
  }
  .toggle-btn:hover {
    opacity: 0.8;
  }
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 11px;
    padding: 1px 6px;
    opacity: 0.6;
    transition: opacity 0.1s;
  }
  .action-btn:hover {
    opacity: 1;
  }
</style>
