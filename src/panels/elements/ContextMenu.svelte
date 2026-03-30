<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';

  interface Props {
    x: number;
    y: number;
    element: HTMLElement;
    onclose: () => void;
  }

  let { x, y, element, onclose }: Props = $props();

  const colors = $derived(themeState.theme.colors);

  let editing = $state(false);
  let editValue = $state('');

  function startEdit() {
    editValue = element.outerHTML;
    editing = true;
  }

  function commitEdit() {
    try {
      const template = document.createElement('template');
      template.innerHTML = editValue.trim();
      const newNode = template.content.firstElementChild;
      if (newNode && element.parentNode) {
        element.parentNode.replaceChild(newNode, element);
      }
    } catch (e) {
      console.warn('Edit failed:', e);
    }
    onclose();
  }

  function copy() {
    navigator.clipboard.writeText(element.outerHTML).catch(() => {});
    onclose();
  }

  function cut() {
    navigator.clipboard.writeText(element.outerHTML).catch(() => {});
    element.parentNode?.removeChild(element);
    onclose();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commitEdit();
  }
</script>

<!-- Backdrop -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="backdrop"
  onclick={editing ? undefined : onclose}
  onkeydown={onKeydown}
></div>

<div
  class="menu"
  style="left:{x}px;top:{y}px;background:#1e1e1e; border-color:{colors.border ?? '#444'};color:{colors.text};"
  role="menu"
>
  {#if !editing}
    <button onclick={copy}   style="color:{colors.text};">Copy</button>
    <button onclick={cut}    style="color:{colors.text};">Cut</button>
    <hr style="border-color:{colors.border ?? '#444'};" />
    <button onclick={startEdit} style="color:{colors.accent};">Edit</button>
  {:else}
    <textarea
      bind:value={editValue}
      spellcheck="false"
      style="background:#111; color:{colors.text};border-color:{colors.border ?? '#444'};"
      rows="6"
    ></textarea>
    <div class="edit-actions">
      <button onclick={commitEdit} style="color:{colors.accent};">Apply</button>
      <button onclick={onclose}    style="color:{colors.textMuted ?? '#888'};">Cancel</button>
    </div>
  {/if}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
  }

  .menu {
    position: fixed;
    z-index: 1000;
    border: 1px solid;
    border-radius: 5px;
    padding: 3px;
    min-width: 110px;
    box-shadow: 0 4px 16px #0006;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 11px;
  }

  button {
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    text-align: left;
    border-radius: 3px;
    font-size: 11px;
    font-family: inherit;
  }

  button:hover {
    background: #ffffff18;
  }

  hr {
    border: none;
    border-top: 1px solid;
    margin: 2px 0;
  }

  textarea {
    display: block;
    width: 260px;
    resize: vertical;
    border: 1px solid;
    border-radius: 3px;
    padding: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 10px;
    outline: none;
    box-sizing: border-box;
  }

  .edit-actions {
    display: flex;
    gap: 4px;
    margin-top: 3px;
  }

  .edit-actions button {
    flex: 1;
    text-align: center;
  }
</style>