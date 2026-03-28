<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { elementsState } from './elements.svelte.ts';
  const colors = $derived(themeState.theme.colors);

  const layout = $derived(() => {
    const el = elementsState.selectedElement;
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const parse = (v: string | null) => parseFloat(v ?? '') || 0;
    const margin = { top: parse(cs.marginTop), right: parse(cs.marginRight), bottom: parse(cs.marginBottom), left: parse(cs.marginLeft) };
    const border = { top: parse(cs.borderTopWidth), right: parse(cs.borderRightWidth), bottom: parse(cs.borderBottomWidth), left: parse(cs.borderLeftWidth) };
    const padding = { top: parse(cs.paddingTop), right: parse(cs.paddingRight), bottom: parse(cs.paddingBottom), left: parse(cs.paddingLeft) };
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const contentWidth = Math.round(Math.max(0, rect.width - border.left - border.right - padding.left - padding.right));
    const contentHeight = Math.round(Math.max(0, rect.height - border.top - border.bottom - padding.top - padding.bottom));
    return {
      el,
      cs,
      rect,
      margin,
      border,
      padding,
      width,
      height,
      contentWidth,
      contentHeight,
      display: cs.display,
      boxSizing: cs.boxSizing,
      position: cs.position,
      offsetTop: (el as HTMLElement).offsetTop,
      offsetLeft: (el as HTMLElement).offsetLeft,
      clientWidth: (el as HTMLElement).clientWidth,
      clientHeight: (el as HTMLElement).clientHeight,
      scrollWidth: (el as HTMLElement).scrollWidth,
      scrollHeight: (el as HTMLElement).scrollHeight,
      computedTop: Math.round(rect.top + window.scrollY),
      computedLeft: Math.round(rect.left + window.scrollX),
    };
  });
</script>

<div class="layout-info" style="background:{colors.bg};color:{colors.text};">
  {#if layout()}
    {@const l = layout()!}
    <div class="box-model">
      <div class="layer margin" style="border-color:{colors.warning}44;">
        <span class="label" style="color:{colors.warning};">margin</span>
        <span class="top">{l.margin.top}px</span>
        <span class="right">{l.margin.right}px</span>
        <span class="bottom">{l.margin.bottom}px</span>
        <span class="left">{l.margin.left}px</span>
        <div class="layer border-layer" style="border-color:{colors.info}44;">
          <span class="label" style="color:{colors.info};">border</span>
          <span class="top">{l.border.top}px</span>
          <span class="right">{l.border.right}px</span>
          <span class="bottom">{l.border.bottom}px</span>
          <span class="left">{l.border.left}px</span>
          <div class="layer padding-layer" style="border-color:{colors.success}44;">
            <span class="label" style="color:{colors.success};">padding</span>
            <span class="top">{l.padding.top}px</span>
            <span class="right">{l.padding.right}px</span>
            <span class="bottom">{l.padding.bottom}px</span>
            <span class="left">{l.padding.left}px</span>
            <div class="content-box" style="background:{colors.accent}22;">
              {l.contentWidth}px × {l.contentHeight}px
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="layout-details">
      <div class="row"><strong>Bounding:</strong> {l.width}px × {l.height}px</div>
      <div class="row"><strong>Content:</strong> {l.contentWidth}px × {l.contentHeight}px</div>
      <div class="row"><strong>Position:</strong> {l.position} — left: {l.computedLeft}px, top: {l.computedTop}px</div>
      <div class="row"><strong>Display:</strong> {l.display}, box-sizing: {l.boxSizing}</div>
      <div class="row"><strong>Offsets:</strong> offsetLeft: {l.offsetLeft}px, offsetTop: {l.offsetTop}px</div>
      <div class="row"><strong>Client:</strong> {l.clientWidth}px × {l.clientHeight}px</div>
      <div class="row"><strong>Scroll:</strong> {l.scrollWidth}px × {l.scrollHeight}px</div>
    </div>
  {:else}
    <div class="empty" style="color:{colors.textMuted};">Select an element to view layout</div>
  {/if}
</div>

<style>
  .layout-info { height: 100%; overflow: auto; padding: 8px; font-size: 11px; }
  .box-model { display: flex; justify-content: center; padding: 8px; }
  .layer {
    position: relative;
    border: 2px dashed;
    padding: 16px 24px;
    text-align: center;
    min-width: 60px;
  }
  .label { position: absolute; top: 2px; left: 4px; font-size: 10px; font-weight: 500; }
  .top { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); }
  .bottom { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); }
  .left { position: absolute; left: 4px; top: 50%; transform: translateY(-50%); }
  .right { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); }
  .content-box { padding: 8px 12px; border-radius: 3px; font-weight: 600; }
  .empty { padding: 20px; text-align: center; font-size: 12px; }
  .layout-details { padding: 8px 12px; font-size: 12px; display: flex; flex-direction: column; gap: 6px; }
  .layout-details .row { display: flex; gap: 6px; align-items: center; }
</style>
