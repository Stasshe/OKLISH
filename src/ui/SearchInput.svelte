<script lang="ts">
  import { themeState } from '../theme/theme.svelte.ts';

  interface Props {
    value: string;
    placeholder?: string;
    onchange: (value: string) => void;
  }

  let { value, placeholder = 'Filter...', onchange }: Props = $props();

  const colors = $derived(themeState.theme.colors);
</script>

<div class="search-wrap" style="border:1px solid {colors.border};background:{colors.bgSecondary};">
  <input
    type="text"
    class="search-input"
    style="color:{colors.text};"
    {placeholder}
    {value}
    oninput={(e) => onchange((e.target as HTMLInputElement).value)}
  />
  {#if value}
    <button
      class="clear-btn"
      style="color:{colors.textMuted};"
      onclick={() => onchange('')}
    >
      ✕
    </button>
  {/if}
</div>

<style>
  .search-wrap {
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 0 4px;
    height: 20px;
  }
  .search-input {
    background: none;
    border: none;
    outline: none;
    font-size: 10px;
    font-family: inherit;
    flex: 1;
    min-width: 0;
  }
  .clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 9px;
    padding: 0;
    display: flex;
    align-items: center;
  }
</style>
