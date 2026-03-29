<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { eventBus } from "../core/events";
  import { STORAGE_PREFIX } from "../core/constants";

  let greeting = $state<string | null>(null);

  function loadGreeting() {
    try {
      const raw = sessionStorage.getItem(`${STORAGE_PREFIX}plugin:sample-plugin:greeting`);
      if (raw) {
        const parsed = JSON.parse(raw);
        greeting = parsed?.text ?? String(parsed);
      } else {
        greeting = null;
      }
    } catch {
      greeting = null;
    }
  }

  const handler = (...args: unknown[]) => {
    greeting = (args[0] as string) ?? null;
  };

  onMount(() => {
    loadGreeting();
    eventBus.on("sample:greeting", handler);
  });

  onDestroy(() => {
    eventBus.off("sample:greeting", handler);
  });
</script>

<div class="sample-panel">
  <h3>Sample Plugin</h3>
  <p>{greeting ?? "No greeting yet"}</p>
  <button onclick={() => eventBus.emit("sample:greeting", "Hello from panel")}>Emit greeting</button>
</div>

<style>
  .sample-panel { padding: 8px; }
  h3 { margin: 0 0 8px 0; font-size: 14px; }
  p { margin: 0 0 8px 0; font-size: 13px; color: var(--oklish-text, #333); }
  button { padding: 6px 8px; font-size: 13px; cursor: pointer; }
</style>
