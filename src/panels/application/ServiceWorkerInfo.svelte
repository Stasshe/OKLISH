<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';

  const colors = $derived(themeState.theme.colors);

  let registrations = $state<ServiceWorkerRegistration[]>([]);

  async function loadRegistrations() {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      registrations = Array.from(regs);
    }
  }

  $effect(() => {
    loadRegistrations();
  });
</script>

<div class="sw-info" style="color:{colors.text};">
  <div class="header" style="color:{colors.textSecondary};border-bottom:1px solid {colors.border};">
    Service Workers
  </div>
  {#if registrations.length > 0}
    {#each registrations as reg}
      <div class="sw-entry" style="border-bottom:1px solid {colors.border}22;">
        <div>Scope: <span style="color:{colors.accent};">{reg.scope}</span></div>
        <div>State: {reg.active?.state ?? 'none'}</div>
      </div>
    {/each}
  {:else}
    <div class="empty" style="color:{colors.textMuted};">No service workers registered</div>
  {/if}
</div>

<style>
  .sw-info { font-size: 12px; padding: 4px 0; }
  .header { padding: 6px 8px; font-size: 11px; font-weight: 500; }
  .sw-entry { padding: 6px 8px; }
  .empty { padding: 20px; text-align: center; }
</style>
