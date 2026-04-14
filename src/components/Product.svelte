<script module>
	let selected = $state();
	let controls = $state<CameraControlsRef>();
	let dofTarget = $state(new Vector3(0, 0, 0));

	export const DEFAULT_VIEW = {
		position: [2.31, 1.43, 2.96],
		target: [0, 0.8, 0],
		dof: {
			focusDistance: 3.35,
			focalLength: 2.5
		}
	};

	let postProcessConfig = $state({
		dof: {
			focusDistance: 3.35,
			focalLength: 2.5,
			bokehScale: 2.72,
			focusRange: 0.1
		},
		bloom: {
			luminanceThreshold: 0.9,
			luminanceSmoothing: 0.5,
			intensity: 0.2,
			radius: 0.5,
			mipmapBlur: true
		}
	});

	export const setSelected = (value: string) => {
		selected = value;

		console.log($state.snapshot(value));

		const vCam = new Vector3();
		const vTarget = new Vector3();
		const offset = 0.5;

		// 1. Wyciągasz tablice współrzędnych z Twojego configu
		const camCoords = value.part.position; // np. [2.34, 2.08, 2.12]
		const targetCoords = value.part.target; // np. [0.03, 0.81, 0.08]

		const distance = vCam.set(...camCoords).distanceTo(vTarget.set(...targetCoords));

		if (controls) {
			const currentAzimuth = controls.azimuthAngle;
			const normalizedAzimuth = currentAzimuth % (Math.PI * 2);

			controls.azimuthAngle = normalizedAzimuth;
		}

		gsap.to(postProcessConfig.dof, {
			focalLength: 1,
			focusDistance: distance - offset,
			duration: 1,
			ease: 'power2.out',
			overwrite: true // Jeśli klikniesz coś innego w trakcie, stara animacja zostanie przerwana
		});

		controls?.setLookAt(...camCoords, ...targetCoords, true);
	};

	export const getSelected = () => {
		return selected;
	};

	export const setProductMaterial = ({ part, material }) => {
		part.material = material;
		part.color = material.color;
	};

	export const setProductMaterialColor = (color: string) => {
		selected.part.color = color;
	};

	export const removeSelected = () => {
		selected = null;
		if (controls) {
			const currentAzimuth = controls.azimuthAngle;
			const normalizedAzimuth = currentAzimuth % (Math.PI * 2);

			controls.azimuthAngle = normalizedAzimuth;
			controls?.setLookAt(...DEFAULT_VIEW.position, ...DEFAULT_VIEW.target, true);
		}

		gsap.to(postProcessConfig.dof, {
			focalLength: DEFAULT_VIEW.dof.focalLength,
			focusDistance: DEFAULT_VIEW.dof.focusDistance,
			duration: 1,
			ease: 'power2.out',
			overwrite: true // Jeśli klikniesz coś innego w trakcie, stara animacja zostanie przerwana
		});
	};
</script>

<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from '../components/Scene.svelte';
	import { Studio } from '@threlte/studio';
	import Renderer from '../components/Renderer.svelte';
	import { Suspense, useProgress, type CameraControlsRef } from '@threlte/extras';

	import { fade } from 'svelte/transition';
	import { Vector3 } from 'three';
	import Loader from './Loader.svelte';
	import TweakPane from './TweakPane.svelte';
	import ProductUI from './ProductUI.svelte';
	import gsap from 'gsap';

	let isStudio = $state(false);
</script>

<TweakPane {controls} {postProcessConfig} />

<section>
	<Loader />
	<div class="canvas-wrapper" in:fade>
		<ProductUI />
		<Canvas>
			<!-- <Renderer /> -->
			<Suspense>
				{#if isStudio}
					<Studio>
						<Scene bind:controls bind:dofTarget config={postProcessConfig} />
					</Studio>
				{:else}
					<Scene bind:controls bind:dofTarget config={postProcessConfig} />
				{/if}
			</Suspense>
		</Canvas>
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
		height: 100dvh;
		background-color: white;
	}
</style>
