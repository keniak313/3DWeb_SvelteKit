<script lang="ts">
	import { createConfig } from '$lib/state/config.svelte.js';
	import { sceneConfig } from '$lib/state/sceneConfig.svelte.js';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	sceneConfig.camera = data.config?.camera || { position: [0, 0, 5], target: [0, 0, 0] };
	sceneConfig.bloom = data.config?.bloom || {};

	// const sceneConfig = createSceneConfig(data.config);
	// setContext('sceneConfig', sceneConfig);

	const config = createConfig(data);

	setContext('config', config);

	const previewConfig = createConfig($state.snapshot(config.data), config);
	setContext('previewConfig', previewConfig);
</script>

{@render children()}
