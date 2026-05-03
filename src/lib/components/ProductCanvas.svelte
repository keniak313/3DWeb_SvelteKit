<script>
	import { Canvas } from '@threlte/core';
	import { PCFShadowMap, WebGLRenderer } from 'three';
	import Renderer from './Renderer.svelte';
	import { PerfMonitor, Suspense } from '@threlte/extras';
	import Scene from './Scene.svelte';
</script>

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
	<!-- <PerfMonitor /> -->
	<Suspense>
		<Scene />
	</Suspense>
</Canvas>
