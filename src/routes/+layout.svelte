<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { createConfig } from '$lib/state/config.svelte.js';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	const config = createConfig(data);

	setContext('config', config);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global {
		* {
			padding: 0;
			box-sizing: border-box;
			margin: 0;
		}

		html,
		body {
			scroll-behavior: smooth;
			overscroll-behavior: none;
			/* overflow-y: scroll; */
			/* scrollbar-gutter: stable; */
		}

		html,
		body {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			min-height: 100vh;
			width: 100%;
			align-self: center;
			justify-self: center;
			position: relative;
		}
	}
</style>
