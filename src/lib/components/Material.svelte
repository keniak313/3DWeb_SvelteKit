<script>
	import { T, useTask } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { materials } from '../utilities/data.svelte';
	import { Color } from 'three';
	import RimShader from './RimShader.svelte';
	import { getLoadedAssets } from './AssetPreloader.svelte';
	import { Spring } from 'svelte/motion';

	let { material, modelName, setColor, isHovered } = $props();

	const emissiveIntensity = new Spring(0);

	$effect(() => {
		emissiveIntensity.set(isHovered ? 0.3 : 0);
	});

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
			return setColor.color;
		}
		return color?.color;
	});

	let timeUniform = { value: 0 };

	useTask((delta) => {
		timeUniform.value += delta;
	});

	const injectPulsing = (shader) => {
		shader.uniforms.uTime = timeUniform;
		shader.uniforms.uPulseSpeed = { value: 0.8 };

		// 1. DODAJ DEKLARACJE (na samym początku fragment shadera)
		shader.fragmentShader = `
        uniform float uTime;
        uniform float uPulseSpeed;
        ${shader.fragmentShader}
    `;

		// 2. WSTRZYKNIJ LOGIKĘ (tak jak wcześniej)
		shader.fragmentShader = shader.fragmentShader.replace(
			`#include <emissivemap_fragment>`,
			`
        #include <emissivemap_fragment>
        
        float minIntensity = 0.2; 
        
        
        float t = fract(uTime * uPulseSpeed);
		float triangle = abs(t * 2.0 - 1.0);
		float pulseFactor = smoothstep(0.1, 0.9, triangle);

		float pulse = mix(minIntensity, 1.0, pulseFactor);
        
        totalEmissiveRadiance *= pulse;
        `
		);
	};
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
		emissive="white"
		emissiveIntensity={emissiveIntensity.current}
		aoMapIntensity={1}
		needsUpdate={true}
		oncreate={(ref) => {
			$effect(() => {
				ref.transparent = material.transparent;
				ref.needsUpdate = true;
			});
			ref.onBeforeCompile = injectPulsing;
		}}
	/>
{/if}
