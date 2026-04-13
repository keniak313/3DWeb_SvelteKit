<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
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
		:root {
			width: 100%;
			min-height: 100svh;
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
			min-height: 100svh;
			width: 100%;
			align-self: center;
			justify-self: center;
			position: relative;
		}
	}
</style>
