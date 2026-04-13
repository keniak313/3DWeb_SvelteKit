<script lang="ts">
	import { T } from '@threlte/core';
	import {
		interactivity,
		OrbitControls,
		CameraControls,
		type CameraControlsRef,
		Environment,
		GLTF,
		useGltf,
		useTexture,
		ContactShadows
	} from '@threlte/extras';
	import { Spring } from 'svelte/motion';
	import {
		AmbientLight,
		Box3,
		EquirectangularReflectionMapping,
		MathUtils,
		MeshBasicMaterial,
		MeshStandardMaterial,
		RepeatWrapping,
		TextureLoader,
		Vector3
	} from 'three';
	import { HDRLoader } from 'three/examples/jsm/Addons.js';
	import { EffectComposer } from 'threlte-postprocessing';
	import {
		BloomEffect,
		SMAAEffect,
		SSAOEffect,
		ToneMappingEffect
	} from 'threlte-postprocessing/effects';
	import { SMAAPreset, ToneMappingMode } from 'postprocessing';
	import AssetPreloader, { getHDRI } from './AssetPreloader.svelte';
	import { models } from '../utilities/data.svelte';
	import Model from './Model.svelte';
	import { getSelected } from './Product.svelte';

	let { controls = $bindable() } = $props();

	const loader = new HDRLoader().setPath('/HDRI/').setRequestHeader({});
	const promise = loader.loadAsync('monochrome_studio_02_2k.hdr').then((texture) => {
		texture.mapping = EquirectangularReflectionMapping;
		return texture;
	});

	interactivity();
</script>

<AssetPreloader />

<EffectComposer>
	<BloomEffect intensity={0.2} mipmapBlur={true} />
	<SMAAEffect preset={SMAAPreset.ULTRA} />
	<ToneMappingEffect mode={ToneMappingMode.ACES_FILMIC} />
</EffectComposer>

<Environment texture={getHDRI()} isBackground={false} />

<T.AmbientLight visible />

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
	castShadow
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	shadow.bias={0}
	shadow.radius={3.8}
/>

<T.DirectionalLight
	position={[0, 20, 0]}
	castShadow={false}
	shadow.radius={30}
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	visible
	intensity={1}
/>
{#each Object.values(models) as model (model.id)}
	<Model {model} visible={true} />
{/each}

<!-- <ContactShadows color="black" opacity={0.3} scale={20} blur={3} /> -->
