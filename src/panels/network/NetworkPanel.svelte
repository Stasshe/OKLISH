<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { networkState } from './network.svelte.ts';
  import RequestList from './RequestList.svelte';
  import RequestDetail from './RequestDetail.svelte';
  import SplitPane from '../../ui/SplitPane.svelte';
  import SearchInput from '../../ui/SearchInput.svelte';

  const colors = $derived(themeState.theme.colors);
  const statuses = ['all', '2xx', '3xx', '4xx', '5xx', 'failed'];
  const methods = ['all', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  let showAdvanced = $state(false);
</script>

<div class="network-panel">
  <div class="toolbar" style="border-bottom:1px solid {colors.border};background:{colors.bgSecondary};">
    <div class="toolbar-top">
      <button class="clear-btn" style="color:{colors.textSecondary};" title="Clear" onclick={() => networkState.clear()}>
        ⊘
      </button>
      <SearchInput value={networkState.searchQuery} onchange={(v) => networkState.setSearch(v)} placeholder="Filter URL..." />
      <span class="count" style="color:{colors.textMuted};">{networkState.filteredRequests.length} requests</span>
      <button
        class="adv-btn"
        style="color:{colors.textSecondary};border-bottom:{showAdvanced ? `2px solid ${colors.accent}` : 'none'};"
        onclick={() => showAdvanced = !showAdvanced}
      >
        Filters
      </button>
    </div>

    {#if showAdvanced}
      <div class="toolbar-advanced" style="border-top:1px solid {colors.border};padding:8px;display:flex;gap:8px;flex-wrap:wrap;">
        <div class="filter-group">
          <label for="status-filter" style="color:{colors.textSecondary};font-size:10px;">Status</label>
          <select
            id="status-filter"
            value={networkState.statusFilter}
            onchange={(e) => networkState.setStatusFilter(e.currentTarget.value)}
            style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;"
          >
            {#each statuses as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group">
          <label for="method-filter" style="color:{colors.textSecondary};font-size:10px;">Method</label>
          <select
            id="method-filter"
            value={networkState.methodFilter}
            onchange={(e) => networkState.setMethodFilter(e.currentTarget.value)}
            style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;"
          >
            {#each methods as method}
              <option value={method}>{method}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group">
          <label for="group-filter" style="color:{colors.textSecondary};font-size:10px;">Group</label>
          <select
            id="group-filter"
            value={networkState.groupBy}
            onchange={(e) => networkState.setGroupBy(e.currentTarget.value as any)}
            style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;"
          >
            <option value="none">None</option>
            <option value="domain">Domain</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="sort-filter" style="color:{colors.textSecondary};font-size:10px;">Sort</label>
          <select
            id="sort-filter"
            value={networkState.sortBy}
            onchange={(e) => networkState.setSortBy(e.currentTarget.value as any)}
            style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;"
          >
            <option value="time">Time</option>
            <option value="size">Size</option>
            <option value="duration">Duration</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="size-min" style="color:{colors.textSecondary};font-size:10px;">Size Range</label>
          <div class="range-inputs">
            <input
              id="size-min"
              type="number"
              min="0"
              placeholder="Min"
              value={networkState.sizeRange[0] === 0 ? '' : networkState.sizeRange[0]}
              onchange={(e) => {
                const val = e.currentTarget.value ? parseInt(e.currentTarget.value) : 0;
                networkState.setSizeRange([val, networkState.sizeRange[1]]);
              }}
              style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;width:60px;"
            />
            <input
              id="size-max"
              type="number"
              min="0"
              placeholder="Max"
              value={networkState.sizeRange[1] === Infinity ? '' : networkState.sizeRange[1]}
              onchange={(e) => {
                const val = e.currentTarget.value ? parseInt(e.currentTarget.value) : Infinity;
                networkState.setSizeRange([networkState.sizeRange[0], val]);
              }}
              style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;width:60px;"
            />
          </div>
        </div>

        <div class="filter-group">
          <label for="duration-min" style="color:{colors.textSecondary};font-size:10px;">Duration Range (ms)</label>
          <div class="range-inputs">
            <input
              id="duration-min"
              type="number"
              min="0"
              placeholder="Min"
              value={networkState.durationRange[0] === 0 ? '' : networkState.durationRange[0]}
              onchange={(e) => {
                const val = e.currentTarget.value ? parseInt(e.currentTarget.value) : 0;
                networkState.setDurationRange([val, networkState.durationRange[1]]);
              }}
              style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;width:60px;"
            />
            <input
              id="duration-max"
              type="number"
              min="0"
              placeholder="Max"
              value={networkState.durationRange[1] === Infinity ? '' : networkState.durationRange[1]}
              onchange={(e) => {
                const val = e.currentTarget.value ? parseInt(e.currentTarget.value) : Infinity;
                networkState.setDurationRange([networkState.durationRange[0], val]);
              }}
              style="background:{colors.bgTertiary};color:{colors.text};border:1px solid {colors.border};padding:2px 4px;font-size:11px;width:60px;"
            />
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="main">
    {#if networkState.selectedRequest}
      {#snippet first()}
        <RequestList />
      {/snippet}
      {#snippet second()}
        <RequestDetail />
      {/snippet}
      <SplitPane direction="vertical" initialRatio={0.5} {first} {second} />
    {:else}
      <RequestList />
    {/if}
  </div>
</div>

<style>
  .network-panel { display: flex; flex-direction: column; height: 100%; }
  .toolbar {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex-shrink: 0;
  }
  .toolbar-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
  }
  .toolbar-advanced {
    max-height: 200px;
    overflow-y: auto;
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }
  .filter-group label {
    font-size: 10px;
    font-weight: 500;
  }
  .range-inputs {
    display: flex;
    gap: 4px;
  }
  .range-inputs input {
    flex: 1;
  }
  .clear-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 0 4px; }
  .clear-btn:hover { opacity: 0.7; }
  .adv-btn { background: none; border: none; cursor: pointer; font-size: 11px; padding: 4px 8px; color: inherit; }
  .adv-btn:hover { opacity: 0.7; }
  .count { font-size: 11px; flex-shrink: 0; }
  .main { flex: 1; min-height: 0; }
</style>
