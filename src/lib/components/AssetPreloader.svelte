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
	import { getContext, onMount, untrack } from 'svelte';
	import { EquirectangularReflectionMapping, LinearSRGBColorSpace, RepeatWrapping } from 'three';
	import { HDRLoader } from 'three/examples/jsm/Addons.js';
	import { asset } from '$app/paths';

	const config = getContext('config');

	const models = $derived(config.data.models);
	const textures = $derived(config.data.textures);

	const loadHDR = async () => {
		const url = '/HDRI/monochrome_studio_02_2k.hdr';
		const loader = new HDRLoader().setRequestHeader({});
		const texture = await loader.loadAsync(url);
		texture.mapping = EquirectangularReflectionMapping;

		hdri = texture;
	};

	const loadModels = (models) => {
		if (!loadedAssets.models) loadedAssets.models = {};
		// loadedAssets.models = Object.values(models).reduce((acc, model) => {
		// 	const time = new Date(model?.updatedAt).getTime();
		// 	const url = model.url.startsWith('blob:') ? model.url : model.url + '?v=' + time;
		// 	acc[model.name] = useGltf(url);
		// 	return acc;
		// }, {});
		Object.values(models).forEach((model) => {
			if (!loadedAssets.models[model.name]) {
				const time = model.updatedAt ? new Date(model.updatedAt).getTime() : Date.now();
				const url = model.url.startsWith('blob:') ? model.url : model.url + '?v=' + time;

				console.log('Rejestruję nowy model:', model.name, url);

				// Rejestrujemy loader
				loadedAssets.models[model.name] = useGltf(url);
			}
		});

		if (!loadedAssets.models['BG01']) {
			loadedAssets.models['BG01'] = useGltf(asset('/3D/BG01.glb'));
		}
	};

	const loadTextures = (textures) => {
		if (!loadedAssets.textures) loadedAssets.textures = {};
		Object.values(textures).forEach((texture) => {
			loadedAssets.textures[texture.name] = useTexture(texture.url, {
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
		});
		// loadedAssets.textures = Object.fromEntries(
		// 	textures.map((t) => [
		// 		t.name,
		// 		useTexture(t.url, {
		// 			transform: (tx) => {
		// 				tx.name = t.name;
		// 				tx.image.crossOrigin = 'anonymous';
		// 				tx.flipY = false;
		// 				tx.wrapS = tx.wrapT = RepeatWrapping;
		// 				if (t.name.includes('ORM') || t.name.includes('AO')) {
		// 					tx.colorSpace = LinearSRGBColorSpace;
		// 				}
		// 				return tx;
		// 			}
		// 		})
		// 	])
		// );

		loadedAssets.textures['default'] = useTexture(asset('/Textures/default.webp'), {
			transform: (tx) => {
				tx.name = 'default';
				tx.flipY = false;
				tx.wrapS = tx.wrapT = RepeatWrapping;
				return tx;
			}
		});
	};

	loadHDR();
	loadModels(models);
	loadTextures(textures);

	$effect(() => {
		loadModels(models);
		loadTextures(textures);
		// const currentModels = models;
		// const currentTextures = textures;

		// untrack(() => {
		// 	loadModels(currentModels);
		// 	loadTextures(currentTextures);
		// });
	});
</script>
