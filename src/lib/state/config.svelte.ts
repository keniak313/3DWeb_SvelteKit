import { goto } from '$app/navigation';
import { page } from '$app/state';
import { encodeConfig } from '$lib/utilities/helpers';
import type { CameraControlsRef } from '@threlte/extras';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

const setUrl = (model) => {
	const curUrl = !page.route.id.includes('(admin)');
	if (!curUrl) return;

	const parts = [];
	Object.values(model.parts).forEach((part) => {
		if (part.name.includes('use')) {
			parts.push({
				name: part.name,
				color: part.color,
				material: part.material
			});
		}
	});
	const url = encodeConfig({
		modelName: model.name,
		parts: parts
	});

	goto(`/?item=${url}`);
};

export const createConfig = (initData) => {
	const configData = initData.config;

	const sceneConfig = $state({
		controls: null as CameraControlsRef,
		camera: configData.camera,
		bloom: configData.bloom
	});

	const selected = $state({
		modelName: null,
		partName: null
	});

	const data = $state({
		models: initData.models,
		colors: initData.colors,
		materials: initData.materials,
		textures: initData.textures
	});

	const modelsHydrated = $derived.by(() => {
		const colorsMap = new SvelteMap(data.colors.map((c) => [c.id, c]));

		const materialsMap = new SvelteMap(
			data.materials.map((mat) => {
				const hydratedMat = {
					...mat,
					transparent: Boolean(mat.transparent),
					color: colorsMap.get(mat.color) || colorsMap.get('0'),
					colors: mat.colors?.map((color) => colorsMap.get(color.id) || colorsMap.get('0'))
				};
				return [mat.id, hydratedMat];
			})
		);

		return Object.fromEntries(
			data.models.map((model) => [
				model.name,
				{
					...model,
					parts: Object.fromEntries(
						Object.values(model.parts).map((part) => [
							part.name,
							{
								...part,
								material: materialsMap.get(part.material),
								color: colorsMap.get(part.color),
								materials: part.materials?.map((mat) => materialsMap.get(mat.id))
							}
						])
					)
				}
			])
		);
	});

	const selectedAsset = $derived({
		model: modelsHydrated[selected.modelName],
		part: modelsHydrated[selected.modelName]?.parts[selected.partName]
	});

	function setSelected({ modelName, partName }) {
		selected.modelName = modelName;
		selected.partName = partName;

		if (partName) {
			const model = data.models.find((m) => m.name === selected.modelName);
			const part = model.parts[selected.partName];

			sceneConfig.controls?.setLookAt(...part.position, ...part.target, true);
		} else {
			setUrl(data.models.find((m) => m.name === selected.modelName));
			sceneConfig.controls?.setLookAt(
				...sceneConfig.camera.position,
				...sceneConfig.camera.target,
				true
			);
		}
	}

	function setAssetMaterial({ materialId }) {
		const model = data.models.find((m) => m.name === selected.modelName);
		const part = model.parts[selected.partName];
		const material = data.materials.find((m) => m.id === materialId);

		part.material = materialId;
		part.color = material.color;

		// data.models = [...data.models];

		setUrl(model);
	}

	function setAssetColor({ colorId }) {
		const model = data.models.find((m) => m.name === selected.modelName);
		const part = model.parts[selected.partName];

		part.color = colorId;
		setUrl(model);
	}

	function setAssetFromUrl({ modelName, parts }) {
		const model = data.models.find((m) => m.name === modelName);
		parts.forEach((part) => {
			model.parts[part.name].material = part.material;
			model.parts[part.name].color = part.color;
		});
		selected.modelName = modelName;
	}

	function clearPart() {
		selected.partName = null;

		sceneConfig.controls?.setLookAt(
			...sceneConfig.camera.position,
			...sceneConfig.camera.target,
			true
		);
	}

	function clearSelection() {
		selected.modelName = null;
		selected.partName = null;

		sceneConfig.controls?.setLookAt(
			...sceneConfig.camera.position,
			...sceneConfig.camera.target,
			true
		);
	}

	function setPosTargetFromCamera({ partName }) {
		const position = sceneConfig.controls?.getPosition();
		const target = sceneConfig.controls?.getTarget();
		console.log(position);
		console.log(target);

		if (partName) {
			const model = data.models.find((m) => m.name === selected.modelName);
			const part = model.parts[partName];
			part.position = [
				Number(position.x.toFixed(2)),
				Number(position.y.toFixed(2)),
				Number(position.z.toFixed(2))
			];
			part.target = [
				Number(target.x.toFixed(2)),
				Number(target.y.toFixed(2)),
				Number(target.z.toFixed(2))
			];
		}
	}

	function setSceneConfig({ position, target }) {
		sceneConfig.camera.position = position;
		sceneConfig.camera.target = target;
	}

	function updateData(newData) {
		data.models = newData.models;
		data.colors = newData.colors;
		data.materials = newData.materials;
		data.textures = newData.textures;
		sceneConfig.camera = newData.config.camera;
		sceneConfig.bloom = newData.config.bloom;
	}

	return {
		get data() {
			return data;
		},
		get modelsHydrated() {
			return modelsHydrated;
		},
		get selectedAsset() {
			return selectedAsset;
		},
		sceneConfig,
		setSelected,
		setAssetMaterial,
		setAssetColor,
		setPosTargetFromCamera,
		clearPart,
		clearSelection,
		setSceneConfig,
		setAssetFromUrl,
		updateData
	};
};
