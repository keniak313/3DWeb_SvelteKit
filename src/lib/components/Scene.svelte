<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		interactivity,
		CameraControls,
		Environment,
		GLTF,
		useGltf,
		useTexture,
		ContactShadows,
		Suspense,
		SoftShadows,
		BakeShadows,
		transitions,
		type CameraControlsRef,
		HTML,
		ShadowMaterial
	} from '@threlte/extras';
	import {
		Color,
		EquirectangularReflectionMapping,
		HalfFloatType,
		MeshBasicMaterial,
		MeshStandardMaterial,
		UnsignedByteType,
		Vector2,
		Vector3
	} from 'three';
	import { HDRLoader } from 'three/examples/jsm/Addons.js';
	import { EffectComposer } from 'threlte-postprocessing';
	import {
		BloomEffect,
		DepthOfFieldEffect,
		LensFlareEffect,
		NoiseEffect,
		SMAAEffect,
		ToneMappingEffect,
		VignetteEffect
	} from 'threlte-postprocessing/effects';
	import { BlendFunction, SMAAPreset, ToneMappingMode, VignetteTechnique } from 'postprocessing';
	import AssetPreloader, { getHDRI } from './AssetPreloader.svelte';
	import Model from './Model.svelte';
	import { scale } from '$lib/transitions';
	import { getContext, setContext, untrack } from 'svelte';
	import { page } from '$app/state';

	let isAdmin = $derived(page.route.id?.includes('(admin)'));

	const { renderer, scene, camera } = useThrelte();

	let composer = $state<EffectComposer | null>(null);

	const config = getContext('config');

	const models = $derived(config.modelsHydrated);

	scene.background = new Color('white');

	let isDragging = $state(false);

	let isStudioPage = $derived(page.route.id?.includes('studio'));

	interactivity();
	transitions();
</script>

<AssetPreloader />

<!-- <EffectComposer multisampling={8} bind:ref={composer}> -->
<!-- <DepthOfFieldEffect
		focusDistance={config.dof.focusDistance}
		focalLength={config.dof.focalLength}
		bokehScale={config.dof.bokehScale}
		focusRange={config.dof.focusRange}
		resolutionScale={1}
	/> -->
<!-- <BloomEffect
		luminanceThreshold={config.sceneConfig.bloom.luminanceThreshold}
		luminanceSmoothing={config.sceneConfig.bloom.luminanceSmoothing}
		radius={config.sceneConfig.bloom.radius}
		intensity={config.sceneConfig.bloom.intensity}
		mipmapBlur={true}
		resolutionScale={1}
	/>
	<ToneMappingEffect mode={ToneMappingMode.ACES_FILMIC} />
	<VignetteEffect offset={0.3} eskil={false} darkness={0.2} /> -->
<!-- </EffectComposer> -->

<Environment texture={getHDRI()} isBackground={false} />

<!-- <T.AmbientLight intensity={0.5} visible /> -->

<T.PerspectiveCamera makeDefault visible fov={35} near={0.01} far={20}>
	<CameraControls
		bind:ref={config.sceneConfig.controls}
		oncreate={(ref) => {
			ref.setLookAt(
				...config.sceneConfig.camera.position,
				...config.sceneConfig.camera.target,
				true
			);
		}}
		maxPolarAngle={Math.PI / 2}
		minPolarAngle={Math.PI / 5}
		polarAngle={Math.PI / 2.4}
		azimuthAngle={Math.PI / 5}
		dollySpeed={isStudioPage ? 1 : 0}
		truckSpeed={isStudioPage ? 1 : 0}
		oncontrolstart={() => {
			isDragging = true;
		}}
		oncontrolend={() => {
			isDragging = false;
		}}
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

{#each Object.values(models) as model, index (model.id)}
	<Model {model} {isDragging} />
{/each}

<T.Mesh position={[0, 0, 0]} scale={2} rotation.x={-1 * 0.5 * Math.PI}>
	<T.PlaneGeometry />
	<ShadowMaterial color="black" />
</T.Mesh>

<!-- <BakeShadows /> -->

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
/>

<!-- <GLTF
	url="/3D/Watch01_Test.glb"
	oncreate={(ref) => {
		console.log(ref);
	}}
/> -->
