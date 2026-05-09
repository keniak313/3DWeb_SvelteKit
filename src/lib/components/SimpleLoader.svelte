<script lang="ts">
	import { fade } from 'svelte/transition';

	let { isLoading = false } = $props();
</script>

{#if isLoading}
	<div class="wrapper" transition:fade>
		<p>SAVING... PLEASE WAIT</p>
	</div>
{/if}

<style>
	.wrapper {
		position: fixed;
		display: flex;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		background-color: white;
		z-index: 9999;
		justify-content: center;
		align-items: center;
	}
</style>
