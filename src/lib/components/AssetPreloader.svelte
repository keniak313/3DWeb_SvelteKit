<script module>
	let hdri = $state();
	let loadedAssets = $state({
		models: null,
		textures: null
	});

	export const getHDRI = () => {
		return hdri;
	};

	export const getLoadedAssets = () => {
		return loadedAssets;
	};
</script>

<script lang="ts">
	import { useGltf, useProgress, useTexture } from '@threlte/extras';
	import { getContext, onMount } from 'svelte';
	import { EquirectangularReflectionMapping, LinearSRGBColorSpace, RepeatWrapping } from 'three';
	import { HDRLoader } from 'three/examples/jsm/Addons.js';
	import { asset } from '$app/paths';

	const config = getContext('config');

	const models = config.modelsHydrated;
	const textures = config.textures;

	// const models = ['/3D/Watch01/Watch01.glb', `/3D/Box01/Box01.glb`, '/3D/BG01.glb'];

	// const textures = [
	// 	'/Textures/default.png',
	// 	'/3D/Watch01/Watch01_AO.png',
	// 	'/3D/Watch01/Watch01_DF.png',
	// 	'/Textures/steel_ORM.png',
	// 	'/Textures/steel_DF.png'
	// ];

	loadedAssets.models = Object.values(models).reduce((acc, model) => {
		const time = new Date(model.updatedAt).getTime();
		console.log(time);
		acc[model.name] = useGltf(model.url + '?v=' + time);
		return acc;
	}, {});

	loadedAssets.models['BG01'] = useGltf(asset('/3D/BG01.glb'));

	loadedAssets.textures = textures.reduce((acc, texture) => {
		acc[texture.name] = useTexture(texture.url, {
			transform: (tx) => {
				tx.name = texture.name;
				tx.image.crossOrigin = 'anonymous';
				tx.flipY = false;
				tx.wrapS = tx.wrapT = RepeatWrapping;
				if (texture.name.includes('ORM') || texture.name.includes('AO')) {
					tx.colorSpace = LinearSRGBColorSpace;
				}
				return tx;
			}
		});
		return acc;
	}, {});

	loadedAssets.textures['default'] = useTexture(asset('/Textures/default.webp'), {
		transform: (tx) => {
			tx.name = 'default';
			tx.flipY = false;
			tx.wrapS = tx.wrapT = RepeatWrapping;
			return tx;
		}
	});

	// loadedAssets.models = models.map((path) => ({
	// 	asset: path.split('/').pop()?.split('.')[0],
	// 	gltf: useGltf(asset(path))
	// }));
	// loadedAssets.textures = textures.map((path) => {
	// 	return {
	// 		asset: path.split('/').pop()?.split('.')[0],
	// 		texture: useTexture(asset(path), {
	// 			transform: (texture) => {
	// 				texture.flipY = false;
	// 				if (path.includes('ORM') || path.includes('AO')) {
	// 					texture.colorSpace = LinearSRGBColorSpace;
	// 				}
	// 				return texture;
	// 			}
	// 		})
	// 	};
	// });

	const loadHDR = async () => {
		const url = '/HDRI/monochrome_studio_02_2k.hdr';
		const loader = new HDRLoader().setRequestHeader({});
		const texture = await loader.loadAsync(url);
		texture.mapping = EquirectangularReflectionMapping;

		hdri = texture;
	};

	loadHDR();
</script>
