<script lang="ts">
  import type { Snippet } from 'svelte';
  import { themeState } from '../theme/theme.svelte.ts';

  interface Props {
    direction?: 'horizontal' | 'vertical';
    initialRatio?: number;
    first: Snippet;
    second: Snippet;
  }

  let { direction = 'horizontal', initialRatio = 0.5, first, second }: Props = $props();

  const colors = $derived(themeState.theme.colors);
  let ratio = $state(0.5);

  $effect(() => {
    ratio = initialRatio;
  });
  let container: HTMLElement;
  let dragging = $state(false);

  function onpointerdown(e: PointerEvent) {
    e.preventDefault();
    dragging = true;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    function onpointermove(ev: PointerEvent) {
      const rect = container.getBoundingClientRect();
      if (direction === 'horizontal') {
        ratio = Math.max(0.15, Math.min(0.85, (ev.clientX - rect.left) / rect.width));
      } else {
        ratio = Math.max(0.15, Math.min(0.85, (ev.clientY - rect.top) / rect.height));
      }
    }

    function onpointerup() {
      dragging = false;
      target.removeEventListener('pointermove', onpointermove);
      target.removeEventListener('pointerup', onpointerup);
    }

    target.addEventListener('pointermove', onpointermove);
    target.addEventListener('pointerup', onpointerup);
  }

  function ontouchstart(e: TouchEvent) {
    e.preventDefault();
    dragging = true;
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;

    function onTouchMove(ev: TouchEvent) {
      ev.preventDefault();
      const rect = container.getBoundingClientRect();
      if (direction === 'horizontal') {
        ratio = Math.max(0.15, Math.min(0.85, (ev.touches[0].clientX - rect.left) / rect.width));
      } else {
        ratio = Math.max(0.15, Math.min(0.85, (ev.touches[0].clientY - rect.top) / rect.height));
      }
    }

    function onTouchEnd() {
      dragging = false;
      document.removeEventListener('touchmove', onTouchMove as EventListener);
      document.removeEventListener('touchend', onTouchEnd as EventListener);
    }

    const opts: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchmove', onTouchMove as EventListener, opts);
    document.addEventListener('touchend', onTouchEnd as EventListener);
  }
</script>

<div class="split-pane split-{direction}" bind:this={container}>
  <div class="pane" style="{direction === 'horizontal' ? 'width' : 'height'}:{ratio * 100}%;">
    {@render first()}
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="divider"
    style="background:{dragging ? colors.accent : colors.border};{direction === 'horizontal' ? 'cursor:col-resize;width:3px;' : 'cursor:row-resize;height:3px;'}"
    onpointerdown={onpointerdown}
    ontouchstart={ontouchstart}
  ></div>
  <div class="pane" style="flex:1;">
    {@render second()}
  </div>
</div>

<style>
  .split-pane { display: flex; width: 100%; height: 100%; }
  .split-horizontal { flex-direction: row; }
  .split-vertical { flex-direction: column; }
  .pane { overflow: auto; min-width: 0; min-height: 0; }
  .divider { flex-shrink: 0; }
  .divider:hover { opacity: 0.7; }
  .divider { touch-action: none; }
</style>
