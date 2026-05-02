<script lang="ts">
	import { createConfig } from '$lib/state/config.svelte.js';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	const config = createConfig(data);

	setContext('config', config);
</script>

{@render children()}
