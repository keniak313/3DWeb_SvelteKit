<script>
	import { T } from '@threlte/core';
	import { useTexture } from '@threlte/extras';
	import { materials } from '../utilities/data.svelte';
	import { Color } from 'three';
	import RimShader from './RimShader.svelte';

	let { material, modelName, partName, aoMapEnabled = false, setColor } = $props();

	const aoTexture = aoMapEnabled
		? useTexture(`/3D/${modelName}/${modelName}_${partName}_AO.png`, {
				transform: (t) => {
					t.flipY = false;
					return t;
				}
			})
		: null;
	const { id, color, colors, defaultColor, ...matConfig } = $derived(material);
	const newColor = $derived.by(() => {
		if (setColor) {
			return new Color(setColor.color);
		}
		return new Color(color.color);
	});

	const rimColor = new Color('#ffffff');
	const rimPower = 4.0;
	const rimIntensity = 0;
</script>

<!-- <RimShader rimColor="white" rimPower={4} rimIntensity={1} /> -->

<T.MeshStandardMaterial
	aoMap={aoTexture ? $aoTexture : null}
	color={newColor}
	aoMapIntensity={1.5}
	{...matConfig}
	oncreate={(ref) => {
		ref.onBeforeCompile = (shader) => {
			// 1. Przekazujemy nasze zmienne do shadera
			shader.uniforms.uRimColor = { value: rimColor };
			shader.uniforms.uRimPower = { value: rimPower };
			shader.uniforms.uRimIntensity = { value: rimIntensity };

			// 2. Dodajemy varying do Vertex Shadera (potrzebne do obliczeń widoku)
			shader.vertexShader = shader.vertexShader.replace(
				`#include <common>`,
				`#include <common>
				 varying vec3 vViewDir;`
			);

			shader.vertexShader = shader.vertexShader.replace(
				`#include <worldpos_vertex>`,
				`#include <worldpos_vertex>
				 // Obliczamy wektor kierunku patrzenia
				 vViewDir = normalize( cameraPosition - worldPosition.xyz );`
			);

			// 3. Dodajemy logikę do Fragment Shadera
			shader.fragmentShader = `
				uniform vec3 uRimColor;
				uniform float uRimPower;
				uniform float uRimIntensity;
				varying vec3 vViewDir;
				${shader.fragmentShader}
			`.replace(
				`#include <dithering_fragment>`,
				`#include <dithering_fragment>
				 // Obliczanie Fresnela
				 float rim = 1.0 - max( dot( normalize( vNormal ), normalize( vViewDir ) ), 0.0 );
				 rim = pow( rim, uRimPower );
				 
				 // Dodajemy blask do finalnego koloru (PBR + Rim)
				 gl_FragColor.rgb += uRimColor * rim * uRimIntensity;`
			);
		};
	}}
/>
