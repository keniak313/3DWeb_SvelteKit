<script lang="ts">
	import { useProgress } from '@threlte/extras';
	import { Tween } from 'svelte/motion';
	import { fromStore } from 'svelte/store';
	import { fade } from 'svelte/transition';

	const { progress, finishedOnce } = useProgress();
	const p = fromStore(progress);

	const tweenedProgress = Tween.of(() => $progress, {
		duration: 150
	});

	const progressWidth = $derived(100 * tweenedProgress.current);
	const progressLessThanOne = $derived(tweenedProgress.current < 1);

	const showLoader = $derived(!$finishedOnce || tweenedProgress.current < 1);
</script>

<!-- {#if $progress < 1}
		<div class="loader" transition:fade>Ładowanie: {Math.round($progress * 100)}%</div>
	{/if} -->

{#if showLoader && progressLessThanOne}<div
		transition:fade={{
			duration: 200
		}}
		class="loader-wrapper"
	>
		<p class="loading">Loading</p>
		<div class="bar-wrapper">
			<div class="bar" style="width: {progressWidth}%"></div>
		</div>
	</div>
{/if}

<style>
	.loader {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		background-color: white;
		z-index: 1000;
	}

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
