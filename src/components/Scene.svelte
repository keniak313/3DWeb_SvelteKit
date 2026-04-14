<script lang="ts">
	import { T } from '@threlte/core';
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
		BakeShadows
	} from '@threlte/extras';
	import {
		Color,
		EquirectangularReflectionMapping,
		MeshBasicMaterial,
		MeshStandardMaterial,
		Vector3
	} from 'three';
	import { HDRLoader } from 'three/examples/jsm/Addons.js';
	import { EffectComposer } from 'threlte-postprocessing';
	import {
		BloomEffect,
		DepthOfFieldEffect,
		ToneMappingEffect
	} from 'threlte-postprocessing/effects';
	import { ToneMappingMode } from 'postprocessing';
	import AssetPreloader, { getHDRI } from './AssetPreloader.svelte';
	import { models } from '../utilities/data.svelte';
	import Model from './Model.svelte';

	let { controls = $bindable(), dofTarget = $bindable(), config } = $props();

	// const loader = new HDRLoader().setPath('/HDRI/').setRequestHeader({});
	// const promise = loader.loadAsync('monochrome_studio_02_2k.hdr').then((texture) => {
	// 	texture.mapping = EquirectangularReflectionMapping;
	// 	return texture;
	// });

	interactivity();
</script>

<AssetPreloader />

<EffectComposer multisampling={8}>
	<DepthOfFieldEffect
		focusDistance={config.dof.focusDistance}
		focalLength={config.dof.focalLength}
		bokehScale={config.dof.bokehScale}
		focusRange={config.dof.focusRange}
		height={480}
	/>
	<BloomEffect
		luminanceThreshold={config.bloom.luminanceThreshold}
		luminanceSmoothing={config.bloom.luminanceSmoothing}
		radius={config.bloom.radius}
		intensity={config.bloom.intensity}
		mipmapBlur={config.bloom.mipmapBlur}
	/>

	<ToneMappingEffect mode={ToneMappingMode.ACES_FILMIC} />
</EffectComposer>

<Environment texture={getHDRI()} isBackground={false} />

<!-- <T.AmbientLight intensity={0.5} visible /> -->

<T.PerspectiveCamera makeDefault visible fov={35}>
	<CameraControls
		bind:ref={controls}
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
	<Model {model} visible={true} />
{/each}

<!-- <ContactShadows color="black" opacity={1} scale={10} blur={0} resolution={2048} /> -->
<BakeShadows />

<GLTF
	url="/3D/BG01.glb"
	oncreate={(ref) => {
		ref.children[0].castShadow = false;
		ref.children[0].receiveShadow = true;
		console.log(
			(ref.children[0].material = new MeshStandardMaterial({
				color: new Color('white')
			}))
		);
	}}
/>
