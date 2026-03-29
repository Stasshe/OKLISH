<script lang="ts">
  import type { Snippet } from 'svelte';
  import { themeState } from '../theme/theme.svelte.ts';
  import { windowState } from './window.svelte.ts';
  import { WINDOW_DEFAULTS } from '../core/constants';
  import Titlebar from './Titlebar.svelte';
  import ResizeHandle from './ResizeHandle.svelte';

  interface Props {
    onclose?: () => void;
    children: Snippet;
  }

  let { onclose, children }: Props = $props();

  const colors = $derived(themeState.theme.colors);

  let rootEl: HTMLElement | null = null;

  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isDragging = false;
  let activeResize = $state<string | null>(null);

  function ondragstart(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('.actions')) return;
    e.preventDefault();
    e.stopPropagation();
    if (!rootEl) return;

    isDragging = true;

    // Calculate pointer offset inside the window so the cursor stays
    // at the same relative position while dragging.
    const rect = rootEl.getBoundingClientRect();
    const pointerOffsetX = e.clientX - rect.left;
    const pointerOffsetY = e.clientY - rect.top;

    function onpointermove(ev: PointerEvent) {
      windowState.x = Math.round(ev.clientX - pointerOffsetX);
      windowState.y = Math.round(ev.clientY - pointerOffsetY);
    }

    function onpointerup() {
      isDragging = false;
      document.removeEventListener('pointermove', onpointermove);
      document.removeEventListener('pointerup', onpointerup);
    }

    // Attach to document to ensure we receive events even if the pointer
    // leaves the titlebar or the window during the drag.
    document.addEventListener('pointermove', onpointermove);
    document.addEventListener('pointerup', onpointerup);

    // Best-effort pointer capture on the original target if supported.
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  // Touch fallback for devices that don't provide PointerEvents (older iOS Safari)
  function ondragstartTouch(e: TouchEvent) {
    if ((e.target as HTMLElement).closest('.actions')) return;
    e.preventDefault();
    e.stopPropagation();
    if (!rootEl) return;

    isDragging = true;

    // Calculate pointer offset inside the window for touch as well.
    const rect = rootEl.getBoundingClientRect();
    const startTouch = e.touches[0];
    const pointerOffsetX = startTouch.clientX - rect.left;
    const pointerOffsetY = startTouch.clientY - rect.top;

    function ontouchmove(ev: TouchEvent) {
      ev.preventDefault();
      const t = ev.touches[0];
      windowState.x = Math.round(t.clientX - pointerOffsetX);
      windowState.y = Math.round(t.clientY - pointerOffsetY);
    }

    function ontouchend() {
      isDragging = false;
      document.removeEventListener('touchmove', ontouchmove as EventListenerOrEventListenerObject);
      document.removeEventListener('touchend', ontouchend as EventListenerOrEventListenerObject);
    }

    const opts: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchmove', ontouchmove as EventListener, opts);
    document.addEventListener('touchend', ontouchend as EventListener);
  }

  let resizeStartW = 0;
  let resizeStartH = 0;

  function onresizeStart() {
    resizeStartW = windowState.width;
    resizeStartH = windowState.height;
  }

  function setActiveResize(pos: string) {
    activeResize = pos;
  }

  function clearActiveResize() {
    activeResize = null;
  }

  function makeResizeHandler(position: string) {
    let startW = 0;
    let startH = 0;
    let startX = 0;
    let startY = 0;
    let initialized = false;

    return (dx: number, dy: number) => {
      if (!initialized) {
        startW = windowState.width;
        startH = windowState.height;
        startX = windowState.x;
        startY = windowState.y;
        initialized = true;
      }

      let newW = startW;
      let newH = startH;
      let newX = startX;
      let newY = startY;

      if (position.includes('right')) newW = Math.max(WINDOW_DEFAULTS.MIN_WIDTH, startW + dx);
      if (position.includes('left')) {
        newW = Math.max(WINDOW_DEFAULTS.MIN_WIDTH, startW - dx);
        newX = startX + (startW - newW);
      }
      if (position.includes('bottom')) newH = Math.max(WINDOW_DEFAULTS.MIN_HEIGHT, startH + dy);
      if (position.includes('top')) {
        newH = Math.max(WINDOW_DEFAULTS.MIN_HEIGHT, startH - dy);
        newY = startY + (startH - newH);
      }

      windowState.width = newW;
      windowState.height = newH;
      windowState.x = newX;
      windowState.y = newY;
    };
  }
</script>

<div
  class="floating-window"
  bind:this={rootEl}
  style="
    left:{windowState.x}px;
    top:{windowState.y}px;
    width:{windowState.width}px;
    height:{windowState.height}px;
    background:{colors.bg};
    border:1px solid {colors.border};
    border-top-color:{activeResize && activeResize.includes('top') ? colors.accent : colors.border};
    border-right-color:{activeResize && activeResize.includes('right') ? colors.accent : colors.border};
    border-bottom-color:{activeResize && activeResize.includes('bottom') ? colors.accent : colors.border};
    border-left-color:{activeResize && activeResize.includes('left') ? colors.accent : colors.border};
    color:{colors.text};
  "
>
  <Titlebar {ondragstart} ondragstartTouch={ondragstartTouch} {onclose} />
  <div class="content">
    {@render children()}
  </div>
  <ResizeHandle position="top" onresize={makeResizeHandler('top')} onresizestart={() => setActiveResize('top')} onresizeend={clearActiveResize} active={Boolean(activeResize && activeResize.includes('top'))} />
  <ResizeHandle position="bottom" onresize={makeResizeHandler('bottom')} onresizestart={() => setActiveResize('bottom')} onresizeend={clearActiveResize} active={Boolean(activeResize && activeResize.includes('bottom'))} />
  <ResizeHandle position="left" onresize={makeResizeHandler('left')} onresizestart={() => setActiveResize('left')} onresizeend={clearActiveResize} active={Boolean(activeResize && activeResize.includes('left'))} />
  <ResizeHandle position="right" onresize={makeResizeHandler('right')} onresizestart={() => setActiveResize('right')} onresizeend={clearActiveResize} active={Boolean(activeResize && activeResize.includes('right'))} />
  <ResizeHandle position="top-left" onresize={makeResizeHandler('top-left')} onresizestart={() => setActiveResize('top-left')} onresizeend={clearActiveResize} active={Boolean(activeResize === 'top-left')} />
  <ResizeHandle position="top-right" onresize={makeResizeHandler('top-right')} onresizestart={() => setActiveResize('top-right')} onresizeend={clearActiveResize} active={Boolean(activeResize === 'top-right')} />
  <ResizeHandle position="bottom-left" onresize={makeResizeHandler('bottom-left')} onresizestart={() => setActiveResize('bottom-left')} onresizeend={clearActiveResize} active={Boolean(activeResize === 'bottom-left')} />
  <ResizeHandle position="bottom-right" onresize={makeResizeHandler('bottom-right')} onresizestart={() => setActiveResize('bottom-right')} onresizeend={clearActiveResize} active={Boolean(activeResize === 'bottom-right')} />
</div>

<style>
  .floating-window {
    position: fixed;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    font-size: 12px;
    z-index: 2147483646;
  }
  .content {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }
</style>
