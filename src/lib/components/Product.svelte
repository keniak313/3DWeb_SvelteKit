<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from '../components/Scene.svelte';
	import { Studio } from '@threlte/studio';
	import { Suspense, useProgress } from '@threlte/extras';
	import { fade } from 'svelte/transition';
	import Loader from './Loader.svelte';
	import ProductUI from './ProductUI.svelte';
	import { page } from '$app/state';
	import { PCFShadowMap, WebGLRenderer } from 'three';
	import { getContext, onMount, setContext } from 'svelte';
	import { decodeConfig } from '$lib/utilities/helpers';
	import { getLoadedAssets } from './AssetPreloader.svelte';
	import Renderer from './Renderer.svelte';
	import { createConfig, getAppConfig } from '$lib/state/config.svelte';
	import ProductCanvas from './ProductCanvas.svelte';

	let isStudio = $state(false);

	const { progress } = useProgress();

	const config = getAppConfig();

	const urlItem = $derived(page.url.searchParams.get('item'));
	onMount(() => {
		if (urlItem) {
			const decoded = decodeConfig(urlItem);
			if (decoded) {
				config?.setAssetFromUrl(decoded);
			}
		}
	});
</script>

<section>
	<Loader progress={$progress} />
	<div class="canvas-wrapper" in:fade>
		<ProductUI />

		<ProductCanvas />

		<!-- <Canvas
			shadows={PCFShadowMap}
			createRenderer={(canvas) => {
				return new WebGLRenderer({
					canvas,
					preserveDrawingBuffer: true
				});
			}}
		>
			<Renderer config={config.sceneConfig} />
			<Suspense>
				{#if isStudio}
					<Studio>
						<Scene />
					</Studio>
				{:else}
					<Scene />
				{/if}
			</Suspense>
		</Canvas> -->
	</div>
</section>

<style>
	section {
		position: relative;
	}
	.canvas-wrapper {
		position: relative;
		display: flex;
		width: 100%;
		height: 70dvh;
		background-color: white;
	}
</style>
