<script module>
	let hdri = $state();

	export const getHDRI = () => {
		return hdri;
	};
</script>

<script lang="ts">
	import { useGltf, useProgress, useTexture } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { EquirectangularReflectionMapping } from 'three';
	import { HDRLoader } from 'three/examples/jsm/Addons.js';

	const models = ['/3D/Watch01/Watch01.glb'];

	const textures = ['/3D/Watch01/Watch01_Body_AO.png'];

	models.forEach((path) => useGltf(path));
	textures.forEach((path) =>
		useTexture(path, {
			transform: (texture) => {
				texture.flipY = false;
				return texture;
			}
		})
	);

	const loadHDR = async () => {
		const url = '/HDRI/monochrome_studio_02_2k.hdr';
		const loader = new HDRLoader().setRequestHeader({});
		const texture = await loader.loadAsync(url);
		texture.mapping = EquirectangularReflectionMapping;

		hdri = texture;
	};

	loadHDR();
</script>
