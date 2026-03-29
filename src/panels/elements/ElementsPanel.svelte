<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { elementsState } from './elements.svelte.ts';
  import { windowState } from '../../window/window.svelte.ts';
  import './inspectOverlay.ts';
  import DomTree from './DomTree.svelte';
  import StylesEditor from './StylesEditor.svelte';
  import LayoutInfo from './LayoutInfo.svelte';
  import SplitPane from '../../ui/SplitPane.svelte';
  import TabBar from '../../ui/TabBar.svelte';

  const colors = $derived(themeState.theme.colors);
  const mode = $derived(windowState.mode);
  const splitDirection = $derived(mode === 'docked-left' || mode === 'docked-right' ? 'vertical' : 'horizontal');
  let rightTab = $state('styles');

  const tabs = [
    { name: 'styles', label: 'Styles' },
    { name: 'layout', label: 'Layout' },
  ];
</script>

<div class="elements-panel">
  <div class="toolbar" style="border-bottom:1px solid {colors.border};background:{colors.bgSecondary};">
    <button
      class="inspect-btn"
      class:active={elementsState.inspectMode}
      style="color:{elementsState.inspectMode ? colors.accent : colors.textSecondary};"
      title="Select element"
      onclick={() => elementsState.toggleInspect()}
    >
      ⊙
    </button>
  </div>

  <div class="main">
    {#snippet first()}
      <DomTree />
    {/snippet}
    {#snippet second()}
      <div class="right-panel">
        <TabBar {tabs} active={rightTab} onselect={(n) => rightTab = n} />
        {#if rightTab === 'styles'}
          <StylesEditor />
        {:else}
          <LayoutInfo />
        {/if}
      </div>
    {/snippet}
    <SplitPane direction={splitDirection} initialRatio={0.55} {first} {second} />
  </div>
</div>

<style>
  .elements-panel { display: flex; flex-direction: column; height: 100%; }
  .toolbar { display: flex; align-items: center; padding: 4px 8px; flex-shrink: 0; }
  .inspect-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .inspect-btn:hover { opacity: 0.7; }
  .inspect-btn.active { background: rgba(0, 120, 212, 0.2); }
  .main { flex: 1; min-height: 0; }
  .right-panel { display: flex; flex-direction: column; height: 100%; }
  :global(.elements-panel .split-pane > .pane:first-child) { overflow: hidden; }
</style>
