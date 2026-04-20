<!-- <script module>
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
			bokehScale: 10,
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

	const setUrl = () => {
		const model = selected.model.name;
		const parts = [];
		Object.values(selected.model.parts).forEach((part) => {
			if (part.name.includes('use')) {
				parts.push({
					name: part.name,
					color: part.color.id,
					material: part.material.id
				});
			}
		});
		const url = encodeConfig({
			model: model,
			parts: parts
		});
		goto(`?item=${url}`);
	};

	export const setSelected = (value) => {
		selected = value;
		console.log('SEL', selected);
		// setUrl(value);

		if (!value.part) {
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
				overwrite: true
			});
			return;
		}

		const vCam = new Vector3();
		const vTarget = new Vector3();
		const offset = 0.5;

		const camCoords = value.part.position;
		const targetCoords = value.part.target;

		const distance = vCam.set(...camCoords).distanceTo(vTarget.set(...targetCoords));

		if (controls) {
			const currentAzimuth = controls.azimuthAngle;
			const normalizedAzimuth = currentAzimuth % (Math.PI * 2);

			controls.azimuthAngle = normalizedAzimuth;

			controls?.setLookAt(...value.part.position, ...value.part.target, true);
		}

		gsap.to(postProcessConfig.dof, {
			focalLength: 1,
			focusDistance: distance - offset,
			duration: 1,
			ease: 'power2.out',
			overwrite: true // Jeśli klikniesz coś innego w trakcie, stara animacja zostanie przerwana
		});
	};

	export const getSelected = () => {
		return selected;
	};

	export const setProductMaterial = ({ part, material }) => {
		part.material = material;
		part.color = material.color;

		setUrl();
	};

	export const setProductMaterialColor = (color: string) => {
		selected.part.color = color;

		setUrl();
	};

	export const removeSelectedPart = () => {
		selected.part = null;
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
			overwrite: true
		});
	};
</script> -->

<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from '../components/Scene.svelte';
	import { Studio } from '@threlte/studio';

	import { Suspense } from '@threlte/extras';

	import { fade } from 'svelte/transition';
	import Loader from './Loader.svelte';
	import ProductUI from './ProductUI.svelte';
	import { page } from '$app/state';
	import { WebGLRenderer } from 'three';

	let isStudio = $state(false);

	const urlItem = $derived(page.url.searchParams.get('item'));
	// onMount(() => {
	// 	if (urlItem) {
	// 		const decoded = decodeConfig(urlItem);
	// 		setSelected({
	// 			model: models[decoded.model]
	// 		});
	// 	}
	// });
</script>

<!-- <TweakPane {controls} {postProcessConfig} /> -->

<section>
	<Loader />
	<div class="canvas-wrapper" in:fade>
		<ProductUI />

		<Canvas
			createRenderer={(canvas) => {
				return new WebGLRenderer({
					canvas,
					preserveDrawingBuffer: true
				});
			}}
		>
			<!-- <Renderer config={postProcessConfig} /> -->
			<Suspense>
				{#if isStudio}
					<Studio>
						<Scene />
					</Studio>
				{:else}
					<Scene />
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
		/* width: 100%; */
		height: 100dvh;
		background-color: white;
	}
</style>
