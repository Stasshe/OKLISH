<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  export interface Props<T> {
    items: T[];
    itemHeight: number;
    children: Snippet<[T, number]>;
  }

  let { items, itemHeight, children }: Props<T> = $props();

  let container: HTMLElement;
  let scrollTop = $state(0);
  let containerHeight = $state(400);

  const totalHeight = $derived(items.length * itemHeight);
  const startIndex = $derived(Math.floor(scrollTop / itemHeight));
  const visibleCount = $derived(Math.ceil(containerHeight / itemHeight) + 1);
  const endIndex = $derived(Math.min(startIndex + visibleCount, items.length));
  const visibleItems = $derived(items.slice(startIndex, endIndex));
  const offsetY = $derived(startIndex * itemHeight);

  function onscroll() {
    scrollTop = container.scrollTop;
  }

  $effect(() => {
    if (container) {
      containerHeight = container.clientHeight;
    }
  });
</script>

<div class="virtual-list" bind:this={container} onscroll={onscroll}>
  <div class="spacer" style="height:{totalHeight}px;">
    <div style="transform:translateY({offsetY}px);">
      {#each visibleItems as item, i}
        <div style="height:{itemHeight}px;">
          {@render children(item, startIndex + i)}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .virtual-list { overflow-y: auto; height: 100%; }
  .spacer { position: relative; }
</style>
