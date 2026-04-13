<script module>
	let selected = $state();
	let controls = $state<CameraControlsRef>();

	export const setSelected = (value: string) => {
		selected = value;

		console.log($state.snapshot(value));

		controls?.setLookAt(...value.part.position, ...value.part.target, true);
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

	let isStudio = $state(false);
	const { progress } = useProgress();

	// controls?.setLookAt(3.5, 1.5, 4, 0, 0.8, 0, true);

	onMount(() => {
		const pane = new Pane({ title: 'Camera Helper 📸' });

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

		return () => pane.dispose();
	});
</script>

<div class="canvas-wrapper">
	<div class="info">
		{#if $progress < 1}
			<div class="loader">Ładowanie: {Math.round($progress * 100)}%</div>
		{/if}
		{#if selected}
			<div class="bot">
				<p>{selected?.model.name} - {selected?.part.name}</p>
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
						controls?.setLookAt(3.5, 1.5, 4, 0, 0.8, 0, true);
					}}>CLOSE</button
				>
			</div>
		{/if}
	</div>
	<Canvas>
		<!-- <Renderer /> -->
		<Suspense>
			{#if isStudio}
				<Studio>
					<Scene bind:controls />
				</Studio>
			{:else}
				<Scene bind:controls />
			{/if}
		</Suspense>
	</Canvas>
</div>

<style>
	.canvas-wrapper {
		position: relative;
		display: flex;
		width: 100%;
		height: 100vh;
		background-color: white;
	}
	.info {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 200;
	}

	.bot {
		display: flex;
		gap: 1rem;
		place-self: end;
		pointer-events: all;
	}

	.loader {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		background-color: white;
	}

	.color {
		width: 20px;
		height: 20px;
	}

	.selected {
		outline: 2px solid green;
	}
</style>
