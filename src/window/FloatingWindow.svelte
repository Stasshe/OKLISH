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
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOffsetX = windowState.x;
    dragOffsetY = windowState.y;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    function onpointermove(ev: PointerEvent) {
      windowState.x = dragOffsetX + (ev.clientX - dragStartX);
      windowState.y = dragOffsetY + (ev.clientY - dragStartY);
    }

    function onpointerup() {
      isDragging = false;
      el.removeEventListener('pointermove', onpointermove);
      el.removeEventListener('pointerup', onpointerup);
    }

    el.addEventListener('pointermove', onpointermove);
    el.addEventListener('pointerup', onpointerup);
  }

  // Touch fallback for devices that don't provide PointerEvents (older iOS Safari)
  function ondragstartTouch(e: TouchEvent) {
    if ((e.target as HTMLElement).closest('.actions')) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    dragOffsetX = windowState.x;
    dragOffsetY = windowState.y;

    function ontouchmove(ev: TouchEvent) {
      ev.preventDefault();
      const t = ev.touches[0];
      windowState.x = dragOffsetX + (t.clientX - dragStartX);
      windowState.y = dragOffsetY + (t.clientY - dragStartY);
    }

    function ontouchend() {
      isDragging = false;
      document.removeEventListener('touchmove', ontouchmove as EventListenerOrEventListenerObject);
      document.removeEventListener('touchend', ontouchend as EventListenerOrEventListenerObject);
    }

    // Use non-passive so we can prevent scrolling while dragging
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
