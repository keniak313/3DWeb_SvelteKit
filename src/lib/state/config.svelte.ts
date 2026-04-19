import type { CameraControlsRef } from '@threlte/extras';
import { SvelteMap } from 'svelte/reactivity';

export const createConfig = (initData) => {
	const sceneConfig = $state({
		controls: null as CameraControlsRef
	});

	const selected = $state({
		modelName: null,
		partName: null
	});

	const models = $state(initData.models);
	const colors = $state(initData.colors);
	const materials = $state(initData.materials);
	const textures = $state(initData.textures);

	const modelsHydrated = $derived.by(() => {
		const colorsMap = new SvelteMap(colors.map((c) => [c.id, c]));

		const materialsMap = new SvelteMap(
			materials.map((mat) => {
				const hydratedMat = {
					...mat,
					transparent: Boolean(mat.transparent),
					color: colorsMap.get(mat.color),
					colors: mat.colors?.map((id) => colorsMap.get(id))
				};
				return [mat.id, hydratedMat];
			})
		);

		return Object.fromEntries(
			models.map((model) => [
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
								materials: part.materials?.map((id) => materialsMap.get(id))
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
			const model = models.find((m) => m.name === selected.modelName);
			const part = model.parts[selected.partName];

			sceneConfig.controls?.setLookAt(...part.position, ...part.target, true);
		}
	}

	function setAssetMaterial({ materialId }) {
		const model = models.find((m) => m.name === selected.modelName);
		const part = model.parts[selected.partName];
		const material = materials.find((m) => m.id === materialId);

		part.material = materialId;
		part.color = material.color;
	}

	function setAssetColor({ colorId }) {
		const model = models.find((m) => m.name === selected.modelName);
		const part = model.parts[selected.partName];

		part.color = colorId;
	}

	function clearPart() {
		selected.partName = null;

		sceneConfig.controls?.setLookAt(2.31, 1.43, 2.96, 0, 0.8, 0, true);
	}

	function setPosTargetFromCamera({ partName }) {
		const position = sceneConfig.controls?.getPosition();
		const target = sceneConfig.controls?.getTarget();
		console.log(position);
		console.log(target);

		if (partName) {
			const model = models.find((m) => m.name === selected.modelName);
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

	return {
		get models() {
			return models;
		},
		get modelsHydrated() {
			return modelsHydrated;
		},
		get colors() {
			return colors;
		},
		get materials() {
			return materials;
		},
		get textures() {
			return textures;
		},
		get selectedAsset() {
			return selectedAsset;
		},
		sceneConfig,
		setSelected,
		setAssetMaterial,
		setAssetColor,
		setPosTargetFromCamera,
		clearPart
	};
};
