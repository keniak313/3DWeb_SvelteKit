<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	let { progress, isShown = null, isServer = false } = $props();

	const tweenedProgress = Tween.of(() => progress, {
		duration: 200
	});

	const progressWidth = $derived(100 * tweenedProgress.current);

	const showLoader = $derived.by(() => {
		if (isServer) {
			return isShown;
		} else {
			return tweenedProgress.current < 1;
		}
	});
</script>

{#if showLoader}
	<div class="loader-wrapper" transition:fade>
		{#if isServer}
			{#if progress < 0.95}
				<p>Saving...</p>
			{:else}
				<p>Processing files on server (please wait)...</p>
			{/if}
		{:else}
			<p class="loading">Loading...</p>
		{/if}
		<div class="bar-wrapper">
			<div class="bar" style="width: {progressWidth}%"></div>
		</div>
	</div>
{/if}

<style>
	.loader-wrapper {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background-color: white;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		color: black;
		z-index: 1000;
	}
	.loading {
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	.bar-wrapper {
		width: 33.333333%;
		height: 10px;
		border: 1px solid black;
		position: relative;
	}
	.bar {
		height: 100%;
		background-color: black;
	}
</style>
