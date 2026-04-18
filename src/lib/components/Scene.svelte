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
		transitions
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
	// import { models } from '../utilities/data.svelte';
	import Model from './Model.svelte';
	import { DEFAULT_VIEW, getSelected } from './Product.svelte';
	import { scale } from '$lib/transitions';

	let { controls = $bindable(), config, models, data } = $props();

	// const loader = new HDRLoader().setPath('/HDRI/').setRequestHeader({});
	// const promise = loader.loadAsync('monochrome_studio_02_2k.hdr').then((texture) => {
	// 	texture.mapping = EquirectangularReflectionMapping;
	// 	return texture;
	// });

	interactivity();
	transitions();
</script>

<AssetPreloader {data} />

<EffectComposer multisampling={8}>
	<!-- <DepthOfFieldEffect
		focusDistance={config.dof.focusDistance}
		focalLength={config.dof.focalLength}
		bokehScale={config.dof.bokehScale}
		focusRange={config.dof.focusRange}
		resolutionScale={1}
	/> -->
	<BloomEffect
		luminanceThreshold={config.bloom.luminanceThreshold}
		luminanceSmoothing={config.bloom.luminanceSmoothing}
		radius={config.bloom.radius}
		intensity={config.bloom.intensity}
		mipmapBlur={config.bloom.mipmapBlur}
		resolutionScale={1}
	/>
	<ToneMappingEffect mode={ToneMappingMode.ACES_FILMIC} />
	<VignetteEffect offset={0.3} eskil={false} darkness={0.4} />
</EffectComposer>

<Environment texture={getHDRI()} isBackground={false} />

<!-- <T.AmbientLight intensity={0.5} visible /> -->

<T.PerspectiveCamera makeDefault visible fov={35} near={0.01} far={20}>
	<CameraControls
		bind:ref={controls}
		oncreate={(ref) => {
			ref.setLookAt(...DEFAULT_VIEW.position, ...DEFAULT_VIEW.target, true);
		}}
		maxPolarAngle={Math.PI / 2}
		minPolarAngle={Math.PI / 5}
		polarAngle={Math.PI / 2.4}
		azimuthAngle={Math.PI / 5}
		dollySpeed={1}
		truckSpeed={1}
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
{#each Object.values(models) as model (model.id)}
	{#if getSelected()?.model.id === model.id}
		<T.Group in={scale(0)}>
			<Model {model} />
		</T.Group>
	{/if}
{/each}

<!-- <BakeShadows /> -->

<GLTF
	url="/3D/BG01.glb"
	oncreate={(ref) => {
		ref.children[0].castShadow = false;
		ref.children[0].receiveShadow = true;
	}}
/>
