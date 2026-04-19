<script>
	import { T } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { materials } from '../utilities/data.svelte';
	import { Color } from 'three';
	import RimShader from './RimShader.svelte';
	import { getLoadedAssets } from './AssetPreloader.svelte';

	let { material, modelName, setColor } = $props();

	let materialRef = $state();

	const aoTexture = $derived(
		getLoadedAssets().textures[`${modelName}_AO`] || getLoadedAssets().textures[`default`]
	);

	const ormTexture = $derived(
		getLoadedAssets().textures[`${material.name}_ORM`] || getLoadedAssets().textures[`default`]
	);

	const dfTexture = $derived.by(() => {
		const modelDF = getLoadedAssets().textures[`${modelName}_DF`];
		const materialDF = getLoadedAssets().textures[`${material.name}_DF`];
		// materialRef.needsUpdate = true;
		if (material.name.includes(modelName)) {
			return modelDF;
		} else if (materialDF) {
			return materialDF;
		} else {
			return getLoadedAssets().textures[`default`];
		}
	});

	const { id, color, colors, defaultColor, ...matConfig } = $derived(material);
	const newColor = $derived.by(() => {
		if (setColor) {
			return new Color(setColor.color);
		}
		return new Color(color.color);
	});
</script>

{#if $dfTexture && $ormTexture && $aoTexture}
	<T.MeshStandardMaterial
		bind:ref={materialRef}
		name={material.name}
		map={$dfTexture}
		roughnessMap={$ormTexture}
		metalnessMap={$ormTexture}
		roughness={material.roughness}
		metalness={material.metalness}
		opacity={material.opacity}
		transparent={material.transparent}
		aoMap={$aoTexture}
		color={newColor}
		aoMapIntensity={1}
		needsUpdate={true}
		oncreate={(ref) => {
			$effect(() => {
				ref.transparent = material.transparent;
				ref.needsUpdate = true;
			});
		}}
	/>
{/if}
