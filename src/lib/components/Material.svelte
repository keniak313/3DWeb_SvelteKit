<script>
	import { T, useTask } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { materials } from '../utilities/data.svelte';
	import { Color } from 'three';
	import RimShader from './RimShader.svelte';
	import { getHDRI, getLoadedAssets } from './AssetPreloader.svelte';
	import { Spring, Tween } from 'svelte/motion';
	import { backInOut, cubicIn, cubicInOut, elasticInOut } from 'svelte/easing';

	let { aoMap = null, material, modelName, setColor, isHovered } = $props();

	const emissiveIntensity = new Tween(0, {
		duration: 200,
		easing: cubicInOut
	});

	$effect(() => {
		emissiveIntensity.set(isHovered ? 0.3 : 0);
	});

	let materialRef = $state();

	const defaultTexture = $derived(getLoadedAssets().textures[`default`]);

	const ormTexture = $derived(
		getLoadedAssets().textures[`${material?.name}_ORM`] || defaultTexture
	);

	const dfTexture = $derived(getLoadedAssets().textures[`${material?.name}_DF`] || defaultTexture);

	const color = $derived(material?.color);
	const newColor = $derived.by(() => {
		if (setColor) {
			return setColor.color;
		} else if (color) {
			return color;
		}
		console.log('NO COLORS - Setting Magenta');
		return 'magenta';
	});

	let timeUniform = { value: 0 };

	// useTask((delta) => {
	// 	timeUniform.value += delta;
	// }, {autoInvalidate: false});

	// const injectPulsing = (shader) => {
	// 	shader.uniforms.uTime = timeUniform;
	// 	shader.uniforms.uPulseSpeed = { value: 0.8 };

	// 	// 1. DODAJ DEKLARACJE (na samym początku fragment shadera)
	// 	shader.fragmentShader = `
	//     uniform float uTime;
	//     uniform float uPulseSpeed;
	//     ${shader.fragmentShader}
	// `;

	// 	// 2. WSTRZYKNIJ LOGIKĘ (tak jak wcześniej)
	// 	shader.fragmentShader = shader.fragmentShader.replace(
	// 		`#include <emissivemap_fragment>`,
	// 		`
	//     #include <emissivemap_fragment>

	//     float minIntensity = 0.2;

	//     float t = fract(uTime * uPulseSpeed);
	// 	float triangle = abs(t * 2.0 - 1.0);
	// 	float pulseFactor = smoothstep(0.1, 0.9, triangle);

	// 	float pulse = mix(minIntensity, 1.0, pulseFactor);

	//     totalEmissiveRadiance *= pulse;
	//     `
	// 	);
	// };

	$effect(() => {
		const _deps = material;
		if (materialRef) {
			materialRef.needsUpdate = true;
			materialRef.version++;
		}
	});
</script>

{#if material && $dfTexture && $ormTexture && $defaultTexture}
	<T.MeshStandardMaterial
		bind:ref={materialRef}
		name={material?.name}
		map={$dfTexture}
		roughnessMap={$ormTexture}
		metalnessMap={$ormTexture}
		roughness={material?.roughness}
		metalness={material?.metalness}
		opacity={material?.opacity}
		transparent={material.opacity < 1 ? true : false}
		aoMap={aoMap || $defaultTexture}
		color={newColor}
		emissive="white"
		emissiveIntensity={emissiveIntensity.current}
		aoMapIntensity={1.5}
		needsUpdate={true}
	/>
{/if}
