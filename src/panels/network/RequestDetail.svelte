<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { networkState } from './network.svelte.ts';
  import JsonViewer from '../../ui/JsonViewer.svelte';
  import TabBar from '../../ui/TabBar.svelte';
  import { exportHAR } from './utils/generateHar';

  const colors = $derived(themeState.theme.colors);
  let activeTab = $state('headers');

  const req = $derived(networkState.selectedRequest);

  const tabs = [
    { name: 'headers', label: 'Headers' },
    { name: 'payload', label: 'Payload' },
    { name: 'preview', label: 'Preview' },
    { name: 'response', label: 'Response' },
    { name: 'cookies', label: 'Cookies' },
    { name: 'timing', label: 'Timing' },
    { name: 'protocol', label: 'Protocol' },
  ];

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  function generateCurl(): string {
    if (!req) return '';
    let curl = `curl '${req.url}'`;
    curl += ` -X ${req.method}`;

    for (const [key, value] of Object.entries(req.requestHeaders)) {
      curl += ` -H '${key}: ${value}'`;
    }

    if (req.requestBody) {
      const body = typeof req.requestBody === 'string'
        ? req.requestBody
        : JSON.stringify(req.requestBody);
      curl += ` -d '${body.replace(/'/g, "'\\''")}'`;
    }

    return curl;
  }

  function generateFetch(): string {
    if (!req) return '';
    const options: any = { method: req.method };

    if (Object.keys(req.requestHeaders).length > 0) {
      options.headers = req.requestHeaders;
    }

    if (req.requestBody) {
      options.body = typeof req.requestBody === 'string'
        ? req.requestBody
        : JSON.stringify(req.requestBody);
    }

    return `fetch('${req.url}', ${JSON.stringify(options, null, 2)})
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e));`;
  }

  function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return colors.success;
    if (status >= 300 && status < 400) return colors.info;
    if (status >= 400 && status < 500) return colors.warning;
    if (status >= 500) return colors.error;
    if (status === 0) return colors.error;
    return colors.text;
  }
</script>

<div class="request-detail" style="background:{colors.bg};color:{colors.text};">
  {#if req}
    <div class="detail-header" style="background:{colors.bgSecondary};border-bottom:1px solid {colors.border};padding:8px;">
      <button class="action-btn" onclick={() => copyToClipboard(generateCurl())} title="Copy cURL">
        cURL
      </button>
      <button class="action-btn" onclick={() => copyToClipboard(generateFetch())} title="Copy Fetch">
        Fetch
      </button>
      <button class="action-btn" onclick={() => exportHAR(networkState.filteredRequests)} title="Export as HAR">
        Export HAR
      </button>
    </div>
    <TabBar {tabs} active={activeTab} onselect={(n) => activeTab = n} />
    <div class="detail-content">
      {#if activeTab === 'headers'}
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">General</div>
          <div class="kv"><span class="key">URL:</span> <span class="val">{req.url}</span></div>
          <div class="kv"><span class="key">Method:</span> <span class="val">{req.method}</span></div>
          <div class="kv"><span class="key">Status:</span> <span class="val" style="color:{getStatusColor(req.status)};">{req.status} {req.statusText}</span></div>
          <div class="kv"><span class="key">Priority:</span> <span class="val">{req.priority}</span></div>
          <div class="kv"><span class="key">Protocol:</span> <span class="val">{req.protocol}</span></div>
        </div>
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">Response Headers</div>
          {#each Object.entries(req.responseHeaders) as [key, val]}
            <div class="kv"><span class="key" style="color:{colors.accent};">{key}:</span> <span class="val">{val}</span></div>
          {/each}
        </div>
        {#if Object.keys(req.requestHeaders).length > 0}
          <div class="section">
            <div class="section-title" style="color:{colors.textSecondary};">Request Headers</div>
            {#each Object.entries(req.requestHeaders) as [key, val]}
              <div class="kv"><span class="key" style="color:{colors.accent};">{key}:</span> <span class="val">{val}</span></div>
            {/each}
          </div>
        {/if}
      {:else if activeTab === 'payload'}
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">Request Payload</div>
          {#if req.requestBody}
            <div class="payload-body">
              {#if typeof req.requestBody === 'string'}
                <pre><code>{req.requestBody}</code></pre>
              {:else}
                <JsonViewer data={req.requestBody} maxDepth={5} />
              {/if}
            </div>
          {:else}
            <span style="color:{colors.textMuted};">No request payload</span>
          {/if}
        </div>
      {:else if activeTab === 'preview'}
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">Response Preview</div>
          {#if req.responseBody !== null && req.responseBody !== undefined}
            <div class="payload-body">
              {#if typeof req.responseBody === 'string'}
                <pre><code>{req.responseBody.substring(0, 1000)}</code></pre>
              {:else}
                <JsonViewer data={req.responseBody} maxDepth={3} />
              {/if}
            </div>
          {:else}
            <span style="color:{colors.textMuted};">No response body</span>
          {/if}
        </div>
      {:else if activeTab === 'response'}
        <div class="response-body">
          {#if req.responseBody !== null && req.responseBody !== undefined}
            <JsonViewer data={req.responseBody} maxDepth={5} />
          {:else}
            <span style="color:{colors.textMuted};">No response body</span>
          {/if}
        </div>
      {:else if activeTab === 'cookies'}
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">Set-Cookie Headers</div>
          {#if req.cookies.length > 0}
            {#each req.cookies as cookie (cookie.name)}
              <div class="section" style="margin: 8px 0; padding: 8px; background: {colors.bgTertiary}; border-radius: 4px;">
                <div class="kv"><span class="key">Name:</span> <span class="val">{cookie.name}</span></div>
                <div class="kv"><span class="key">Value:</span> <span class="val">{cookie.value}</span></div>
                {#if cookie.domain}
                  <div class="kv"><span class="key">Domain:</span> <span class="val">{cookie.domain}</span></div>
                {/if}
                {#if cookie.path}
                  <div class="kv"><span class="key">Path:</span> <span class="val">{cookie.path}</span></div>
                {/if}
                {#if cookie.expires}
                  <div class="kv"><span class="key">Expires:</span> <span class="val">{cookie.expires}</span></div>
                {/if}
                <div class="kv"><span class="key">Secure:</span> <span class="val">{cookie.secure ? 'Yes' : 'No'}</span></div>
                <div class="kv"><span class="key">HttpOnly:</span> <span class="val">{cookie.httpOnly ? 'Yes' : 'No'}</span></div>
                <div class="kv"><span class="key">SameSite:</span> <span class="val">{cookie.sameSite || 'Default'}</span></div>
              </div>
            {/each}
          {:else}
            <span style="color:{colors.textMuted};">No cookies set</span>
          {/if}
        </div>
      {:else if activeTab === 'timing'}
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">Request Timing</div>
          <div class="timing-chart" style="background:{colors.bgTertiary};padding:8px;border-radius:4px;margin:8px 0;">
            <div class="timing-bar" style="display:flex;height:20px;border-radius:2px;overflow:hidden;background:{colors.border};">
              {#if req.timingPhases.blocked > 0}
                <div style="width:{(req.timingPhases.blocked / req.duration) * 100}%;background:{colors.warning};title='Blocked: {req.timingPhases.blocked}ms';"></div>
              {/if}
              {#if req.timingPhases.dns > 0}
                <div style="width:{(req.timingPhases.dns / req.duration) * 100}%;background:{colors.error};title='DNS: {req.timingPhases.dns}ms';"></div>
              {/if}
              {#if req.timingPhases.connect > 0}
                <div style="width:{(req.timingPhases.connect / req.duration) * 100}%;background:{colors.info};title='Connect: {req.timingPhases.connect}ms';"></div>
              {/if}
              {#if req.timingPhases.send > 0}
                <div style="width:{(req.timingPhases.send / req.duration) * 100}%;background:{colors.success};title='Send: {req.timingPhases.send}ms';"></div>
              {/if}
              {#if req.timingPhases.wait > 0}
                <div style="width:{(req.timingPhases.wait / req.duration) * 100}%;background:{colors.accent};title='Wait: {req.timingPhases.wait}ms';"></div>
              {/if}
              {#if req.timingPhases.receive > 0}
                <div style="width:{(req.timingPhases.receive / req.duration) * 100}%;background:#888;title='Receive: {req.timingPhases.receive}ms';"></div>
              {/if}
            </div>
          </div>
          <div class="timing-details">
            <div class="kv"><span class="key">Total Duration:</span> <span class="val">{req.duration.toFixed(2)}ms</span></div>
            <div class="kv"><span class="key">Blocked:</span> <span class="val">{req.timingPhases.blocked.toFixed(2)}ms</span></div>
            <div class="kv"><span class="key">DNS:</span> <span class="val">{req.timingPhases.dns.toFixed(2)}ms</span></div>
            <div class="kv"><span class="key">Connect:</span> <span class="val">{req.timingPhases.connect.toFixed(2)}ms</span></div>
            <div class="kv"><span class="key">Send:</span> <span class="val">{req.timingPhases.send.toFixed(2)}ms</span></div>
            <div class="kv"><span class="key">Wait:</span> <span class="val">{req.timingPhases.wait.toFixed(2)}ms</span></div>
            <div class="kv"><span class="key">Receive:</span> <span class="val">{req.timingPhases.receive.toFixed(2)}ms</span></div>
          </div>
        </div>
      {:else if activeTab === 'protocol'}
        <div class="section">
          <div class="section-title" style="color:{colors.textSecondary};">Protocol Information</div>
          <div class="kv"><span class="key">Protocol:</span> <span class="val">{req.protocol}</span></div>
          {#if req.ipAddress}
            <div class="kv"><span class="key">Remote Address:</span> <span class="val">{req.ipAddress}</span></div>
          {/if}
          <div class="kv"><span class="key">Request Size:</span> <span class="val">{req.size} bytes</span></div>
          <div class="kv"><span class="key">Resource Size:</span> <span class="val">{req.resourceSize} bytes</span></div>
          {#if req.responseHeaders['content-encoding']}
            <div class="kv"><span class="key">Content Encoding:</span> <span class="val">{req.responseHeaders['content-encoding']}</span></div>
          {/if}
          {#if req.responseHeaders['content-type']}
            <div class="kv"><span class="key">Content Type:</span> <span class="val">{req.responseHeaders['content-type']}</span></div>
          {/if}
          {#if req.responseHeaders['cache-control']}
            <div class="kv"><span class="key">Cache Control:</span> <span class="val">{req.responseHeaders['cache-control']}</span></div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty" style="color:{colors.textMuted};">Select a request to view details</div>
  {/if}
</div>

<style>
  .request-detail { height: 100%; display: flex; flex-direction: column; font-size: 12px; }
  .detail-header { display: flex; gap: 8px; flex-shrink: 0; }
  .action-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: inherit;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 2px;
  }
  .action-btn:hover { opacity: 0.8; }
  .detail-content { flex: 1; overflow: auto; padding: 8px; }
  .section { margin-bottom: 12px; }
  .section-title { font-size: 11px; font-weight: 600; margin-bottom: 4px; padding-bottom: 3px; }
  .kv { padding: 1px 0; font-family: 'SF Mono', Monaco, monospace; font-size: 11px; }
  .key { font-weight: 500; }
  .val { word-break: break-all; }
  .response-body { padding: 4px; font-family: 'SF Mono', Monaco, monospace; }
  .payload-body { padding: 4px; background: var(--bg-tertiary); border-radius: 2px; overflow: auto; max-height: 300px; }
  .payload-body pre { margin: 0; font-size: 11px; }
  .payload-body code { font-family: 'SF Mono', Monaco, monospace; }
  .timing-chart { margin: 8px 0; }
  .timing-bar { display: flex; height: 20px; border-radius: 2px; overflow: hidden; }
  .timing-bar > div { transition: opacity 0.2s; }
  .timing-bar > div:hover { opacity: 0.8; }
  .timing-details { font-size: 11px; font-family: 'SF Mono', Monaco, monospace; }
  .empty { padding: 20px; text-align: center; font-size: 12px; }
</style>
