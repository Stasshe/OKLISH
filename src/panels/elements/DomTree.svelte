<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import DomNode from './DomNode.svelte';

  const colors = $derived(themeState.theme.colors);
  const rootElement = $derived(document.documentElement);
  let refreshKey = $state(0);

  if (typeof window !== 'undefined') {
    window.addEventListener('oklish:reload-dom', () => {
      refreshKey = refreshKey + 1;
    });
  }
</script>

<div class="dom-tree" style="background:{colors.bg};">
  {#if rootElement}
    {#key refreshKey}
      <DomNode element={rootElement} />
    {/key}
  {/if}
</div>

<style>
  .dom-tree { overflow: auto; height: 100%; padding: 2px 0; }
</style>
