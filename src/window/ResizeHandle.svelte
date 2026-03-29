<script lang="ts">
  import { themeState } from '../theme/theme.svelte.ts';
  import { resizable } from './actions/resizable';

  const colors = $derived(themeState.theme.colors);

  interface Props {
    position: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    onresize: (dx: number, dy: number) => void;
    onresizestart?: () => void;
    onresizeend?: () => void;
    active?: boolean;
  }

  let { position, onresize, onresizestart, onresizeend, active = false }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="resize-handle resize-{position}"
  use:resizable={{ position, onStart: onresizestart, onResize: onresize, onEnd: onresizeend }}
  style="background:{active ? colors.accent : 'transparent'};"
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
