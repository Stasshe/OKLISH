<script lang="ts">
  import WindowManager from './window/WindowManager.svelte';
  import PanelContainer from './panels/PanelContainer.svelte';
  import { panelRegistry } from './panels/registry.svelte.ts';
  import ConsolePanel from './panels/console/ConsolePanel.svelte';
  import ElementsPanel from './panels/elements/ElementsPanel.svelte';
  import NetworkPanel from './panels/network/NetworkPanel.svelte';
  import ApplicationPanel from './panels/application/ApplicationPanel.svelte';
  import GlobalStyles from './theme/GlobalStyles.svelte';

  interface Props {
    onclose?: () => void;
  }

  let { onclose }: Props = $props();

  // Register built-in panels
  $effect(() => {
    panelRegistry.register({ name: 'elements', label: 'Elements', icon: 'code', order: 0, component: ElementsPanel });
    panelRegistry.register({ name: 'console', label: 'Console', icon: 'terminal', order: 1, component: ConsolePanel });
    panelRegistry.register({ name: 'network', label: 'Network', icon: 'globe', order: 2, component: NetworkPanel });
    panelRegistry.register({ name: 'application', label: 'Application', icon: 'database', order: 3, component: ApplicationPanel });
  });
</script>

<GlobalStyles />

<WindowManager {onclose}>
  {#snippet children()}
    <PanelContainer />
  {/snippet}
</WindowManager>
