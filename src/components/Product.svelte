<script module>
	let selected = $state();
	let controls = $state<CameraControlsRef>();
	let dofTarget = $state(new Vector3(0, 0, 0));

	const defaultCamParams = [2.31, 1.43, 2.96, 0, 0.8, 0, true];

	export const setSelected = (value: string) => {
		selected = value;

		console.log($state.snapshot(value));

		if (controls) {
			const currentAzimuth = controls.azimuthAngle;
			const normalizedAzimuth = currentAzimuth % (Math.PI * 2);

			controls.azimuthAngle = normalizedAzimuth;

			controls?.setLookAt(...value.part.position, ...value.part.target, true);
		}

		console.log(value.mesh.position);
		dofTarget = value.mesh.position;
	};

	export const getSelected = () => {
		return selected;
	};

	const setProductMaterial = ({ part, material }) => {
		part.material = material;
		part.color = material.color;
	};

	const setProductMaterialColor = (color: string) => {
		selected.part.color = color;
	};
</script>

<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from '../components/Scene.svelte';
	import { Studio } from '@threlte/studio';
	import Renderer from '../components/Renderer.svelte';
	import { Suspense, useProgress, type CameraControlsRef } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { Pane } from 'tweakpane';
	import { fade } from 'svelte/transition';
	import { Vector3 } from 'three';
	import Loader from './Loader.svelte';

	let isStudio = $state(false);

	let postProcessConfig = $state({
		dof: {
			focusDistance: 3.35,
			focalLength: 0.68,
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

	onMount(() => {
		controls?.setLookAt(...defaultCamParams);
		const pane = new Pane();

		pane
			.addButton({
				title: 'Pobierz współrzędne (Konsola + Clipboard)'
			})
			.on('click', () => {
				if (!controls) return;

				// Pobieramy aktualne wektory z CameraControls
				const pos = controls?.getPosition();
				const tar = controls?.getTarget();

				// Formatujemy to jako gotowy fragment kodu
				const codeSnippet = `position: [${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}], 
target: [${tar.x.toFixed(2)}, ${tar.y.toFixed(2)}, ${tar.z.toFixed(2)}]`;

				console.log('%c Nowe ustawienia kamery:', 'color: #00ff00; font-weight: bold;');
				console.log(codeSnippet);

				// Opcjonalne kopiowanie do schowka
				navigator.clipboard.writeText(codeSnippet);
				alert('Skopiowano do schowka!');
			});

		const postProcessPane = pane.addTab({
			pages: [{ title: 'Depth of Field' }, { title: 'Bloom' }]
		});

		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'focusDistance', {
			min: -2,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'focalLength', {
			min: 0,
			max: 1,
			step: 0.01
		});
		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'bokehScale', {
			min: 0,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'focusRange', {
			min: -2,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'intensity', {
			min: 0,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'mipmapBlur');
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'radius', {
			min: 0,
			max: 1,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'luminanceThreshold', {
			min: 0,
			max: 100,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'luminanceSmoothing', {
			min: 0,
			max: 1,
			step: 0.01
		});

		return () => pane.dispose();
	});
</script>

<section>
	<Loader />
	<div class="canvas-wrapper" in:fade>
		<div class="info">
			{#if selected}
				<div class="bot">
					<div class="title">
						<p>{selected?.model.displayName} - {selected?.part.displayName}</p>
						<p>{selected?.part.description}</p>
					</div>
					<div class="options">
						{#each selected.part.materials as material (material.id)}
							<div>
								<button
									class={selected.part.material.id === material.id && 'selected'}
									onclick={(e) => {
										setProductMaterial({ part: selected.part, material });
									}}
									>{material.name}
								</button>
							</div>
							{#if selected.part.material.id === material.id}
								{#each selected.part.material.colors as color (color.id)}
									<button
										class={'color ' + (selected.part.color.id === color.id && 'selected')}
										style="background-color: {color.color}"
										onclick={() => {
											setProductMaterialColor(color);
										}}>X</button
									>
								{/each}
							{/if}
						{/each}
						<button
							onclick={() => {
								selected = null;
								if (controls) {
									const currentAzimuth = controls.azimuthAngle;
									const normalizedAzimuth = currentAzimuth % (Math.PI * 2);

									controls.azimuthAngle = normalizedAzimuth;
									controls?.setLookAt(...defaultCamParams);
								}
							}}>CLOSE</button
						>
					</div>
				</div>
			{/if}
		</div>
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
	.section {
		position: relative;
	}
	.canvas-wrapper {
		position: relative;
		display: flex;
		width: 100%;
		height: 100dvh;
		background-color: white;
	}
	.info {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 200;
	}

	.bot {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		place-self: end;
		pointer-events: all;
		padding: 2rem;
	}

	.title {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: 0.2rem;
	}

	.options {
		display: flex;
		gap: 1rem;
	}

	.color {
		width: 20px;
		height: 20px;
	}

	.selected {
		outline: 2px solid green;
	}
</style>
