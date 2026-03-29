<script lang="ts">
  import { themeState } from '../../theme/theme.svelte.ts';
  import { consoleState } from './console.svelte.ts';

  const colors = $derived(themeState.theme.colors);

  let inputValue = $state('');
  let history: string[] = [];
  let historyIndex = $state(-1);

  async function execute() {
    const code = inputValue.trim();
    if (!code) return;

    history = [code, ...history].slice(0, 100);
    historyIndex = -1;

    consoleState.addEntry({ id: `cmd_${crypto.randomUUID()}`, level: 'log', args: [`> ${code}`], timestamp: Date.now() });

    try {
      const result = await new Function(code)();
      consoleState.addEntry({ id: `res_${crypto.randomUUID()}`, level: 'log', args: [result], timestamp: Date.now() });
    } catch (err) {
      consoleState.addEntry({ id: `err_${crypto.randomUUID()}`, level: 'error', args: [err instanceof Error ? err.message : String(err)], timestamp: Date.now(), stack: err instanceof Error ? err.stack : undefined });
    }

    inputValue = '';
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      execute();
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        inputValue = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        historyIndex--;
        inputValue = history[historyIndex];
      } else {
        historyIndex = -1;
        inputValue = '';
      }
    }
  }
</script>

<div class="command-input" style="border-top:1px solid {colors.border};background:{colors.bgSecondary};">
  <span class="prompt" style="color:{colors.accent};">›</span>
  <input
    type="text"
    class="input"
    style="color:{colors.text};"
    placeholder="Evaluate JavaScript..."
    bind:value={inputValue}
    {onkeydown}
  />
</div>

<style>
  .command-input {
    display: flex;
    align-items: center;
    padding: 2px 6px;
    gap: 4px;
    flex-shrink: 0;
  }
  .prompt { font-size: 12px; font-weight: bold; flex-shrink: 0; }
  .input {
    background: none;
    border: none;
    outline: none;
    font-size: 11px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    flex: 1;
    min-width: 0;
  }
</style>
