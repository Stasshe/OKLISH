<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { applicationState } from './application.svelte.ts';
  import StorageViewer from './StorageViewer.svelte';
  import IDBViewer from './IDBViewer.svelte';
  import ServiceWorkerInfo from './ServiceWorkerInfo.svelte';
  import type { StorageType } from './application.types';

  const colors = $derived(themeState.theme.colors);

  const storageTypes: { name: StorageType; label: string }[] = [
    { name: 'localStorage', label: 'Local Storage' },
    { name: 'sessionStorage', label: 'Session Storage' },
    { name: 'cookies', label: 'Cookies' },
    { name: 'indexedDB', label: 'Indexed DB' },
  ];

  
</script>

<div class="app-panel">
  <div class="sidebar" style="background:{colors.bgSecondary};border-right:1px solid {colors.border};">
    <div class="section-label" style="color:{colors.textMuted};">Storage</div>
    {#each storageTypes as st}
      <button
        class="nav-item"
        class:active={!applicationState.showSW && applicationState.activeStorage === st.name}
        style="color:{!applicationState.showSW && applicationState.activeStorage === st.name ? colors.text : colors.textSecondary};background:{!applicationState.showSW && applicationState.activeStorage === st.name ? colors.selection : 'transparent'};"
        onclick={() => { applicationState.setStorage(st.name); applicationState.setShowSW(false); }}
      >
        {st.label}
      </button>
    {/each}
    <div class="section-label" style="color:{colors.textMuted};">Application</div>
    <button
      class="nav-item"
      class:active={applicationState.showSW}
      style="color:{applicationState.showSW ? colors.text : colors.textSecondary};background:{applicationState.showSW ? colors.selection : 'transparent'};"
      onclick={() => applicationState.setShowSW(true)}
    >
      Service Workers
    </button>
  </div>
  <div class="content">
    {#if applicationState.showSW}
      <ServiceWorkerInfo />
    {:else}
      {#if applicationState.activeStorage === 'indexedDB'}
        <IDBViewer />
      {:else}
        <StorageViewer />
      {/if}
    {/if}
  </div>
</div>

<style>
  .app-panel { display: flex; height: 100%; }
  .sidebar { width: 160px; flex-shrink: 0; overflow-y: auto; padding: 4px 0; }
  .section-label { padding: 6px 12px 2px; font-size: 10px; text-transform: uppercase; font-weight: 600; }
  .nav-item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 4px 12px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
  }
  .nav-item:hover { opacity: 0.8; }
  .content { flex: 1; min-width: 0; }
</style>
