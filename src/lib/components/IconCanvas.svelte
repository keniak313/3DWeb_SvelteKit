<script>
	import { Canvas } from '@threlte/core';
	import { Suspense } from '@threlte/extras';
	import { PCFShadowMap, WebGLRenderer } from 'three';
	import IconScene from './IconScene.svelte';
	import Renderer from './Renderer.svelte';

	let { iconModel, ref = $bindable() } = $props();
</script>

<div id="icon-canvas" bind:this={ref} style="padding: 4rem">
	<Canvas
		shadows={PCFShadowMap}
		createRenderer={(canvas) => {
			return new WebGLRenderer({
				canvas,
				preserveDrawingBuffer: true
			});
		}}
		renderMode="on-demand"
	>
		<Renderer />
		<IconScene {iconModel} />
	</Canvas>
</div>
