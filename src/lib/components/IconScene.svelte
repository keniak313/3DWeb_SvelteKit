<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { CameraControls, Environment, GLTF, ShadowMaterial } from '@threlte/extras';
	import { Color, MeshBasicMaterial } from 'three';
	import AssetPreloader, { getHDRI } from './AssetPreloader.svelte';
	import Model from './Model.svelte';
	import { getAppConfig } from '$lib/state/config.svelte';

	let { iconModel } = $props();

	const { renderer, scene, camera } = useThrelte();

	let controls = $state();

	scene.background = new Color('white');

	// interactivity();
	// transitions();

	const config = getAppConfig('config');
	const models = $derived(config.modelsHydrated);

	let curModel = $derived(Object.values(models).find((m) => m.id === iconModel.id));
	console.log('iconModel: ', iconModel);
	console.log('curModel: ', curModel);
</script>

<!-- <AssetPreloader /> -->

<Environment texture={getHDRI()} isBackground={false} />

<T.PerspectiveCamera makeDefault visible fov={10} near={0.01} far={20}>
	<CameraControls
		bind:ref={controls}
		oncreate={(ref) => {
			controls.setLookAt(3, 2, 3, 0, 0.8, 0, false);
		}}
		maxPolarAngle={Math.PI / 2}
		minPolarAngle={Math.PI / 5}
		polarAngle={Math.PI / 2.4}
		azimuthAngle={Math.PI / 5}
	/>
</T.PerspectiveCamera>

<T.DirectionalLight
	position={[-14.9, 10, 10]}
	visible
	intensity={2}
	castShadow={false}
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	shadow.bias={0}
	shadow.radius={1}
/>

<T.DirectionalLight
	position={[0, 20, 0]}
	castShadow
	shadow.radius={10}
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	visible
	intensity={2}
	shadow.bias={0}
	color="#ffffff"
/>
<Model model={curModel} isDragging={false} isPreview={true} />
<!-- <T.Mesh position={[0, 0, 0]} scale={2} rotation.x={-1 * 0.5 * Math.PI}>
	<T.PlaneGeometry />
	<ShadowMaterial color="black" />
</T.Mesh>

<GLTF
	url="/3D/BG01.glb"
	oncreate={(ref) => {
		ref.children[0].castShadow = false;
		ref.children[0].receiveShadow = true;
		ref.children[0].material = new MeshBasicMaterial({
			color: 'white',
			toneMapped: false
		});
	}}
/> -->
