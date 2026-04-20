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

	const models = $derived(config.modelsHydrated);
	const textures = $derived(config.textures);

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

	const loadHDR = async () => {
		const url = '/HDRI/monochrome_studio_02_2k.hdr';
		const loader = new HDRLoader().setRequestHeader({});
		const texture = await loader.loadAsync(url);
		texture.mapping = EquirectangularReflectionMapping;

		hdri = texture;
	};

	loadHDR();

	$effect(() => {
		const currentModels = models;

		untrack(() => {
			loadedAssets.models = Object.values(models).reduce((acc, model) => {
				const time = new Date(model.updatedAt).getTime();
				acc[model.name] = useGltf(model.url + '?v=' + time);
				return acc;
			}, {});

			loadedAssets.models['BG01'] = useGltf(asset('/3D/BG01.glb'));
		});
	});
</script>
