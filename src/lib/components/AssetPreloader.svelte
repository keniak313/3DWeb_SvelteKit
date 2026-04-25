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
	import { useGltf, useProgress, useTexture, useDraco } from '@threlte/extras';
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

	let isCDNReady = $state(false);
	let isChecking = $state(false);

	async function checkAssetsReady(assets) {
		const urls = assets.map((a) => a.url);

		// Tworzymy tablicę obietnic sprawdzających nagłówki plików
		const checks = urls.map((url) =>
			fetch(url, { method: 'HEAD' }) // HEAD nie pobiera pliku, tylko sprawdza czy jest
				.then((res) => res.ok)
				.catch(() => false)
		);

		const results = await Promise.all(checks);
		return results.every((isOk) => isOk === true); // Zwraca true tylko jeśli WSZYSTKIE są gotowe
	}

	const loadModels = (models) => {
		if (!loadedAssets.models) loadedAssets.models = {};
		Object.values(models).forEach((model) => {
			const time = model.updatedAt ? new Date(model.updatedAt).getTime() : Date.now();
			const newUrl = model.url.startsWith('blob:') ? model.url : model.url + '?v=' + time;

			// SPRAWDZAMY: Czy mamy już ten model ORAZ czy jego URL jest taki sam?
			// Jeśli URL jest inny (np. nowy blob), musimy wywołać useGltf ponownie.
			if (!loadedAssets.models[model.name] || loadedAssets.models[model.name].url !== newUrl) {
				console.log('Ładowanie/Aktualizacja modelu:', model.name);

				loadedAssets.models[model.name] = useGltf(newUrl, {
					dracoLoader: useDraco()
				});
				// Opcjonalnie zapisz URL w obiekcie, żeby móc go porównać przy następnej pętli
				loadedAssets.models[model.name].url = newUrl;
			}
		});

		if (!loadedAssets.models['BG01']) {
			loadedAssets.models['BG01'] = useGltf(asset('/3D/BG01.glb'), {
				dracoLoader: useDraco()
			});
		}
	};

	const loadTextures = (textures) => {
		if (!loadedAssets.textures) loadedAssets.textures = {};
		Object.keys(loadedAssets.textures).forEach((name) => {
			if (name === 'default') return;
			const exists = textures.find((t) => t.name === name);
			if (!exists) {
				delete loadedAssets.textures[name];
			}
		});
		Object.values(textures).forEach((texture) => {
			const time = texture.updatedAt ? new Date(texture.updatedAt).getTime() : Date.now();
			const newUrl = texture.url.startsWith('blob:') ? texture.url : texture.url + '?v=' + time;
			loadedAssets.textures[texture.name] = useTexture(newUrl, {
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

		if (!loadedAssets.textures['default']) {
			loadedAssets.textures['default'] = useTexture(asset('/Textures/default.webp'), {
				transform: (tx) => {
					tx.name = 'default';
					tx.flipY = false;
					tx.wrapS = tx.wrapT = RepeatWrapping;
					return tx;
				}
			});
		}
	};

	loadHDR();
	// loadModels(models);
	// loadTextures(textures);

	$effect(() => {
		// loadModels(models);
		// loadTextures(textures);
		// const currentModels = models;
		// const currentTextures = textures;

		const modelUrls = models.map((m) => m.url).join(',');
		const textureUrls = textures.map((t) => t.url).join(',');

		untrack(() => {
			loadModels(models);
			loadTextures(textures);
		});
	});
</script>
