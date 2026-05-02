<script>
	import { Canvas } from '@threlte/core';
	import { PCFShadowMap, WebGLRenderer } from 'three';
	import Renderer from './Renderer.svelte';
	import { Suspense } from '@threlte/extras';
	import Scene from './Scene.svelte';
	import { getAppConfig } from '$lib/state/config.svelte';

	const config = getAppConfig();
</script>

<Canvas
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
		<Scene />
	</Suspense>
</Canvas>
