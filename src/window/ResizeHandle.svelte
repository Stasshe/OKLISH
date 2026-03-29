<script lang="ts">
  import { themeState } from '../theme/theme.svelte.ts';

  interface Props {
    position: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    onresize: (dx: number, dy: number) => void;
    onresizestart?: () => void;
    onresizeend?: () => void;
  }

  let { position, onresize, onresizestart, onresizeend }: Props = $props();

  function onpointerdown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const target = e.currentTarget as HTMLElement;
    onresizestart?.();
    target.setPointerCapture(e.pointerId);

    function onpointermove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onresize(dx, dy);
    }

    function onpointerup() {
      onresizeend?.();
      target.removeEventListener('pointermove', onpointermove);
      target.removeEventListener('pointerup', onpointerup);
    }

    target.addEventListener('pointermove', onpointermove);
    target.addEventListener('pointerup', onpointerup);
  }

  // Touch fallback for resize handles
  function ontouchstart(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    onresizestart?.();

    function onTouchMove(ev: TouchEvent) {
      ev.preventDefault();
      const dx = ev.touches[0].clientX - startX;
      const dy = ev.touches[0].clientY - startY;
      onresize(dx, dy);
    }

    function onTouchEnd() {
      onresizeend?.();
      document.removeEventListener('touchmove', onTouchMove as EventListener);
      document.removeEventListener('touchend', onTouchEnd as EventListener);
    }

    const opts: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchmove', onTouchMove as EventListener, opts);
    document.addEventListener('touchend', onTouchEnd as EventListener);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="resize-handle resize-{position}"
  onpointerdown={onpointerdown}
  ontouchstart={ontouchstart}
></div>

<style>
  .resize-handle {
    position: absolute;
    z-index: 10;
    touch-action: none;
  }
  .resize-top, .resize-bottom { left: 0; right: 0; height: 4px; cursor: ns-resize; }
  .resize-left, .resize-right { top: 0; bottom: 0; width: 4px; cursor: ew-resize; }
  .resize-top { top: -2px; }
  .resize-bottom { bottom: -2px; }
  .resize-left { left: -2px; }
  .resize-right { right: -2px; }
  .resize-top-left, .resize-top-right, .resize-bottom-left, .resize-bottom-right {
    width: 8px; height: 8px;
  }
  .resize-top-left { top: -4px; left: -4px; cursor: nwse-resize; }
  .resize-top-right { top: -4px; right: -4px; cursor: nesw-resize; }
  .resize-bottom-left { bottom: -4px; left: -4px; cursor: nesw-resize; }
  .resize-bottom-right { bottom: -4px; right: -4px; cursor: nwse-resize; }
</style>
