<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { networkState } from './network.svelte.ts';
  import { formatBytes, formatDuration } from '../../utils/format';

  const colors = $derived(themeState.theme.colors);

  function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return colors.success;
    if (status >= 300 && status < 400) return colors.info;
    if (status >= 400 && status < 500) return colors.warning;
    if (status >= 500) return colors.error;
    if (status === 0) return colors.error;
    return colors.text;
  }

  function getFileName(url: string): string {
    try {
      const u = new URL(url, location.href);
      return u.pathname.split('/').pop() || u.pathname || url;
    } catch {
      return url;
    }
  }
</script>

<div class="request-list">
  <div class="header-row" style="background:{colors.bgSecondary};border-bottom:1px solid {colors.border};">
    <span class="col col-name">Name</span>
    <span class="col col-status">Status</span>
    <span class="col col-type">Type</span>
    <span class="col col-size">Size</span>
    <span class="col col-time">Time</span>
  </div>
  <div class="rows">
    {#each networkState.requests as req (req.id)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="row"
        class:selected={networkState.selectedId === req.id}
        style="background:{networkState.selectedId === req.id ? colors.selection : 'transparent'};color:{req.error ? colors.error : colors.text};"
        onclick={() => networkState.select(req.id)}
      >
        <span class="col col-name" title={req.url}>{getFileName(req.url)}</span>
        <span class="col col-status" style="color:{getStatusColor(req.status)};">{req.status || '—'}</span>
        <span class="col col-type">{req.type}</span>
        <span class="col col-size">{formatBytes(req.size)}</span>
        <span class="col col-time">{formatDuration(req.duration)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .request-list { height: 100%; display: flex; flex-direction: column; font-size: 11px; font-family: 'SF Mono', Monaco, monospace; }
  .header-row, .row { display: flex; padding: 3px 8px; gap: 4px; }
  .header-row { font-weight: 500; position: sticky; top: 0; z-index: 1; flex-shrink: 0; }
  .rows { flex: 1; overflow-y: auto; }
  .row { cursor: pointer; }
  .row:hover { opacity: 0.85; }
  .col { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .col-name { flex: 3; }
  .col-status { width: 50px; flex-shrink: 0; text-align: center; }
  .col-type { width: 40px; flex-shrink: 0; text-align: center; }
  .col-size { width: 60px; flex-shrink: 0; text-align: right; }
  .col-time { width: 60px; flex-shrink: 0; text-align: right; }
</style>
