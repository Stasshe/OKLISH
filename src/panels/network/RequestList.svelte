<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { networkState } from './network.svelte.ts';
  import { formatBytes, formatDuration } from '../../utils/format';
  import type { NetworkRequest } from './network.types';

  const colors = $derived(themeState.theme.colors);

  interface GroupHeader {
    __groupHeader: true;
    domain: string;
  }

  function isGroupHeader(item: NetworkRequest | GroupHeader): item is GroupHeader {
    return '__groupHeader' in item && item.__groupHeader === true;
  }

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

  function getPriorityIcon(priority: string): string {
    if (priority === 'critical') return '◆';
    if (priority === 'high') return '◇';
    if (priority === 'medium') return '◆';
    return '◇';
  }

  function getPriorityColor(priority: string): string {
    if (priority === 'critical') return colors.error;
    if (priority === 'high') return colors.warning;
    if (priority === 'medium') return colors.info;
    return colors.textMuted;
  }

  const minStartTime = $derived(
    networkState.filteredRequests.length > 0
      ? Math.min(...networkState.filteredRequests.map(r => r.startTime))
      : 0
  );

  const maxEndTime = $derived(
    networkState.filteredRequests.length > 0
      ? Math.max(...networkState.filteredRequests.map(r => r.endTime))
      : 0
  );

  const totalDuration = $derived(maxEndTime - minStartTime);
</script>

<div class="request-list">
  <div class="header-row" style="background:{colors.bgSecondary};border-bottom:1px solid {colors.border};">
    <span class="col col-name">Name</span>
    <span class="col col-status">Status</span>
    <span class="col col-type">Type</span>
    <span class="col col-priority">•</span>
    <span class="col col-protocol">Protocol</span>
    <span class="col col-domain">Domain</span>
    <span class="col col-size">Size</span>
    <span class="col col-time">Time</span>
    <span class="col col-waterfall">Waterfall</span>
  </div>
  <div class="rows">
    {#each networkState.requests as item (isGroupHeader(item) ? `group-${item.domain}` : item.id)}
      {#if isGroupHeader(item)}
        <div class="group-header" style="background:{colors.bgTertiary};border-bottom:1px solid {colors.border};">
          <span class="group-domain" style="color:{colors.textSecondary};">{item.domain}</span>
          <span class="group-count" style="color:{colors.textMuted};">({networkState.filteredRequests.filter(r => r.domain === item.domain).length})</span>
        </div>
      {:else}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="row"
          class:selected={networkState.selectedId === item.id}
          style="background:{networkState.selectedId === item.id ? colors.selection : 'transparent'};color:{item.error ? colors.error : colors.text};"
          onclick={() => networkState.select(item.id)}
        >
          <span class="col col-name" title={item.url}>{getFileName(item.url)}</span>
          <span class="col col-status" style="color:{getStatusColor(item.status)};">{item.status || '—'}</span>
          <span class="col col-type">{item.type}</span>
          <span class="col col-priority" style="color:{getPriorityColor(item.priority)};" title={item.priority}>{getPriorityIcon(item.priority)}</span>
          <span class="col col-protocol">{item.protocol}</span>
          <span class="col col-domain" title={item.domain}>{item.domain}</span>
          <span class="col col-size">{formatBytes(item.size)}</span>
          <span class="col col-time">{formatDuration(item.duration)}</span>
          <span class="col col-waterfall">
            <div class="waterfall-bar" style="
              left: {totalDuration > 0 ? ((item.startTime - minStartTime) / totalDuration) * 100 : 0}%;
              width: {totalDuration > 0 ? ((item.duration) / totalDuration) * 100 : 0}%;
              background: {item.error ? colors.error : colors.info};
            "></div>
          </span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .request-list { height: 100%; display: flex; flex-direction: column; font-size: 11px; font-family: 'SF Mono', Monaco, monospace; }
  .header-row, .row { display: flex; padding: 3px 8px; gap: 4px; }
  .header-row { font-weight: 500; position: sticky; top: 0; z-index: 1; flex-shrink: 0; }
  .group-header { padding: 4px 8px; font-weight: 600; font-size: 10px; display: flex; gap: 8px; align-items: center; }
  .group-domain { flex: 1; }
  .group-count { font-size: 9px; }
  .rows { flex: 1; overflow-y: auto; }
  .row { cursor: pointer; }
  .row:hover { opacity: 0.85; }
  .col { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .col-name { flex: 2; }
  .col-status { width: 50px; flex-shrink: 0; text-align: center; }
  .col-type { width: 40px; flex-shrink: 0; text-align: center; }
  .col-priority { width: 24px; flex-shrink: 0; text-align: center; }
  .col-protocol { width: 60px; flex-shrink: 0; text-align: center; }
  .col-domain { width: 120px; flex-shrink: 0; text-align: left; }
  .col-size { width: 60px; flex-shrink: 0; text-align: right; }
  .col-time { width: 60px; flex-shrink: 0; text-align: right; }
  .col-waterfall { flex: 1.5; min-width: 120px; position: relative; }
  .waterfall-bar {
    position: absolute;
    height: 100%;
    opacity: 0.6;
    top: 0;
  }
</style>
