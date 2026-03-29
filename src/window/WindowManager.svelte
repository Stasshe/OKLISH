<script lang="ts">
  import type { Snippet } from 'svelte';
  import { windowState } from './window.svelte.ts';
  import FloatingWindow from './FloatingWindow.svelte';
  import DockedWindow from './DockedWindow.svelte';
  import { draggable } from './actions/draggable';

  interface Props {
    onclose?: () => void;
    children: Snippet;
  }

  let { onclose, children }: Props = $props();

  const dragOptions = {
    onStart: () => {},
    onMove: (x: number, y: number) => {
      windowState.minX = x;
      windowState.minY = y;
    },
    onEnd: () => {},
    threshold: 6
  };
</script>

{#if !windowState.minimized}
  {#if windowState.isFloating}
    <FloatingWindow {onclose}>
      {@render children()}
    </FloatingWindow>
  {:else}
    <DockedWindow {onclose}>
      {@render children()}
    </DockedWindow>
  {/if}
{:else}
  <button
    class="minimized-btn"
    use:draggable={dragOptions}
    onclick={() => windowState.minimized = false}
    title="Open OKLISH"
    style="left:{windowState.minX}px; top:{windowState.minY}px;"
  >
    KL
  </button>
{/if}

<style>
  .minimized-btn {
    position: fixed;
    /* position controlled via inline left/top styles when minimized */
    z-index: 2147483646;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #0078d4;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .minimized-btn:hover { background: #1a8ceb; transform: scale(1.1); }
</style>
