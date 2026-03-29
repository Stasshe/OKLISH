<script lang="ts">
  import type { Snippet } from 'svelte';
  import { themeState } from '../theme/theme.svelte.ts';
  import { windowState } from './window.svelte.ts';
  import Titlebar from './Titlebar.svelte';
  import ResizeHandle from './ResizeHandle.svelte';

  interface Props {
    onclose?: () => void;
    children: Snippet;
  }

  let { onclose, children }: Props = $props();

  const colors = $derived(themeState.theme.colors);
  const mode = $derived(windowState.mode);
  const isBottom = $derived(mode === 'docked-bottom');
  const isRight = $derived(mode === 'docked-right');
  const isLeft = $derived(mode === 'docked-left');

  let resizeStart = 0;

  let activeResize = $state<string | null>(null);

  function setActiveResize(pos: string) {
    activeResize = pos;
  }

  function clearActiveResize() {
    activeResize = null;
  }

  function makeResizeHandler() {
    let start = 0;
    let initialized = false;
    return (dx: number, dy: number) => {
      if (!initialized) {
        start = windowState.dockedSize;
        initialized = true;
      }
      if (isBottom) windowState.dockedSize = Math.max(200, start - dy);
      else if (isRight) windowState.dockedSize = Math.max(280, start - dx);
      else if (isLeft) windowState.dockedSize = Math.max(280, start + dx);
    };
  }

  const resizePosition = $derived(
    isBottom ? 'top' as const :
    isRight ? 'left' as const :
    'right' as const
  );
</script>

<div
  class="docked-window docked-{mode.replace('docked-', '')}"
  style="
    {isBottom ? `height:${windowState.dockedSize}px;` : `width:${windowState.dockedSize}px;`}
    background:{colors.bg};
    border-{isBottom ? 'top' : isRight ? 'left' : 'right'}:1px solid {colors.border};
    border-top-color:{activeResize && activeResize.includes('top') ? colors.accent : colors.border};
    border-right-color:{activeResize && activeResize.includes('right') ? colors.accent : colors.border};
    border-bottom-color:{activeResize && activeResize.includes('bottom') ? colors.accent : colors.border};
    border-left-color:{activeResize && activeResize.includes('left') ? colors.accent : colors.border};
    color:{colors.text};
  "
>
  <ResizeHandle position={resizePosition} onresize={makeResizeHandler()} onresizestart={() => setActiveResize(resizePosition)} onresizeend={clearActiveResize} active={Boolean(activeResize && resizePosition && activeResize.includes(resizePosition))} />
  <Titlebar {onclose} />
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .docked-window {
    position: fixed;
    z-index: 2147483646;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    font-size: 12px;
    box-shadow: 0 0 16px rgba(0,0,0,0.3);
  }
  .docked-bottom { left: 0; right: 0; bottom: 0; }
  .docked-right { top: 0; right: 0; bottom: 0; }
  .docked-left { top: 0; left: 0; bottom: 0; }
  .content { flex: 1; overflow: auto; min-height: 0; }
</style>
