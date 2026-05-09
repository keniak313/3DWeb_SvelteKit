import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { Color, Material, Model, Texture } from '$lib/server/db/schema';
import { checkName, encodeConfig } from '$lib/utilities/helpers';
import type { CameraControlsRef } from '@threlte/extras';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

import { getContext } from 'svelte';
import { Vector3 } from 'three';
import { sceneConfig } from './sceneConfig.svelte';

export const createConfig = (
	initData: {
		models: Model[];
		colors: Color[];
		materials: Material[];
		textures: Texture[];
	},
	sourceConfig?: any
) => {
	// const configData = initData?.config || {};

	// const sceneConfig = $state({
	// 	controls: null,
	// 	camera: configData.camera || { position: [0, 0, 5], target: [0, 0, 0] },
	// 	bloom: configData.bloom || {}
	// });

	const selected = $state({
		modelName: null,
		partName: null,
		partModelName: null
	});

	const data = $state({
		models: initData.models,
		colors: initData.colors,
		materials: initData.materials,
		textures: initData.textures
	});

	if (sourceConfig) {
		$effect(() => {
			data.models = $state.snapshot(sourceConfig.data.models);
			data.colors = $state.snapshot(sourceConfig.data.colors);
			data.materials = $state.snapshot(sourceConfig.data.materials);
			data.textures = $state.snapshot(sourceConfig.data.textures);
		});
	}

	const modelsMap = $derived(new SvelteMap(data.models.map((m) => [m.id, m])));
	const colorsMap = $derived(new SvelteMap(data.colors.map((c) => [c.id, c])));
	const materialsMap = $derived(
		new SvelteMap(
			data.materials.map((mat) => {
				const hydratedMat = {
					...mat,
					transparent: Boolean(mat.transparent),
					color: colorsMap.get(mat.color) || colorsMap.get('0'),
					colors: mat.colors?.map((color) => colorsMap.get(color.id) || colorsMap.get('0'))
				};
				return [mat.id, hydratedMat];
			})
		)
	);

	const modelsWithAttachments = $derived.by(() => {
		return data.models.map((m) => {
			let parts = m.parts;
			if (m.sockets) {
				Object.values(m.sockets).forEach((s) => {
					// console.log('models socket', s);
					const attachment = modelsMap.get(s.attachment);
					if (attachment && attachment.parts) {
						parts = { ...parts, ...attachment.parts };
					}
				});
			}

			return {
				...m,
				parts
			};
		});
	});

	const modelsHydrated = $derived.by(() => {
		return Object.fromEntries(
			modelsWithAttachments.map((model) => [
				model.name,
				{
					...model,
					sockets: Object.fromEntries(
						Object.values(model.sockets || {}).map((socket) => {
							return [
								socket.name,
								{
									...socket,
									attachment: modelsMap.get(socket.attachment),
									attachments: socket.attachments?.map((att) => modelsMap.get(att.id))
								}
							];
						})
					),
					parts: {
						...Object.fromEntries(
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
						// ...Object.fromEntries(
						// 	Object.values(model.sockets || {}).flatMap((socket) => {
						// 		const attachedModel = data.models.find((m) => m.id === socket.attachment);
						// 		if (!attachedModel || !attachedModel.parts) return [];

						// 		// Mapujemy każdą część z doczepionego modelu osobno
						// 		return Object.values(attachedModel.parts).map((part) => [
						// 			part.name,
						// 			{
						// 				...part,
						// 				material: materialsMap.get(part.material),
						// 				color: colorsMap.get(part.color),
						// 				// Tutaj też warto dodać mapowanie materiałów dla części z socketu
						// 				materials: part.materials?.map((mat) => materialsMap.get(mat.id))
						// 			}
						// 		]);
						// 	})
						// )
					}
				}
			])
		);
	});

	console.log('HYDRATED: ', $state.snapshot(modelsHydrated));

	const resetAzimuthAngle = () => {
		const controls = sceneConfig?.controls;
		if (!controls) return;

		// const currentAzimuth = controls.azimuthAngle;
		// const normalizedAzimuth = currentAzimuth % (Math.PI * 2);

		const position = new Vector3();
		const target = new Vector3();

		controls.getPosition(position);
		controls.getTarget(target);

		controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, false);
	};

	const setUrl = () => {
		const curUrl = !page.route.id.includes('(admin)');
		if (!curUrl) return;

		const model = modelsHydrated[selected.modelName];

		const curConfig = {
			m: model.id,
			p: Object.values(model.parts).map((part) => {
				return [part.name.split('_use')[0], part.material?.id, part.color?.id];
			}),
			a:
				model.sockets &&
				Object.values(model.sockets).map((socket) => ({
					m: socket.attachment.id,
					s: socket.name,
					p: Object.values(socket.attachment.parts).map((part) => {
						return [part.name.split('_use')[0], part.material, part.color];
					})
				}))
		};

		console.log('MODEL IN SET URL: ', $state.snapshot(model));
		console.log('CUR CONFIG: ', curConfig);

		const url = encodeConfig(curConfig);

		goto(`/?item=${url}`);
	};

	const selectedAsset = $derived.by(() => {
		const model = modelsHydrated[selected.modelName];
		const part = model?.parts[selected.partName];
		if (part) {
			const selectedPart = modelsHydrated[part.modelName].parts[part.name];
			return {
				model: model,
				part: selectedPart
			};
		} else {
			return {
				model: model,
				part: part
			};
		}
	});

	function setSelected({ modelName, partName, partModelName }) {
		selected.modelName = modelName;
		selected.partName = partName;
		selected.partModelName = partModelName;

		if (partName) {
			const model = data.models.find((m) => m.name === selected.partModelName);
			const part = model.parts[selected.partName];

			let position = [0, 0, 0];
			let target = [0, 0, 0];

			if (model?.isAttachment) {
				const attModel = data.models.find((m) => m.name === selected.modelName);
				if (!attModel.sockets) return;

				const socket = attModel.sockets[model.socket];
				console.log('SOCKET: ', socket);
				position = socket.position;
				target = socket.target;
			} else {
				position = part.position;
				target = part.target;
			}

			resetAzimuthAngle();
			sceneConfig.controls?.setLookAt(...position, ...target, true);
		} else {
			// setUrl();
			resetAzimuthAngle();
			sceneConfig.controls?.setLookAt(
				...sceneConfig.camera.position,
				...sceneConfig.camera.target,
				true
			);
		}
	}

	function setAssetMaterial({ materialId }) {
		const model = data.models.find((m) => m.name === selected.partModelName);
		if(!model) {
			console.error('Model not found for partModelName: ', selected.partModelName);
			return;
		}
		
		const part = model.parts[selected.partName];
		if(!part) {
			console.error('Part not found for partName: ', selected.partName, ' in model: ', model);
			return;
		}

		if (part) {
			const selectedPart = data.models.find((m) => m.name === part.name);
			console.log('SELECTED PART: ', $state.snapshot(selectedPart));
		}

		const material = data.materials.find((m) => m.id === materialId);
		if(!material) {
			console.error('Material not found for materialId: ', materialId);
			return;
		}

		part.material = materialId;
		part.color = material.color;

		// data.models = [...data.models];

		// setUrl();
	}

	function setAssetColor({ colorId }) {
		console.log($state.snapshot(selected));
		const model = data.models.find((m) => m.name === selected.partModelName);
		const part = model.parts[selected.partName];

		console.log($state.snapshot(model));
		console.log($state.snapshot(part));

		part.color = colorId;
		// setUrl();
	}

	function setSocketAttachment({ socket, attachmentId }) {
		const model = data.models.find((m) => m.name === selected.modelName);
		// console.log(model.sockets[socket].attachment);
		model.sockets[socket].attachment = attachmentId;

		const attachment = data.models.find((m) => m.id === attachmentId);
		// console.log('ATTACHMENT: ', $state.snapshot(attachment));
		// console.log('MODEL: ', $state.snapshot(data.models.find((m) => m.name == selected.modelName)));
		selected.partName = Object.values(attachment.parts)[0].name;
		selected.partModelName = Object.values(attachment.parts)[0].modelName;

		// setUrl();
	}

	function setAssetFromUrl(urlConfig) {
		console.log('CONFIG FROM URL', urlConfig);
		const model = data.models.find((m) => m.id === urlConfig.m);
		urlConfig.p.forEach((part) => {
			const partName = `${part[0]}_use`;
			const curPart = model?.parts[partName];
			if (curPart) {
				curPart.material = part[1];
				curPart.color = part[2];
			}
		});

		urlConfig.a.forEach((att) => {
			const attModel = data.models.find((m) => m.id === att.m);
			model.sockets[att.s].attachment = att.m;
			att.p.forEach((part) => {
				const partName = `${part[0]}_use`;
				const curPart = attModel?.parts[partName];
				if (curPart) {
					curPart.material = part[1];
					curPart.color = part[2];
				}
			});
		});

		// parts.forEach((part) => {
		// 	model.parts[part.name].material = part.material;
		// 	model.parts[part.name].color = part.color;
		// });
		selected.modelName = model.name;
	}

	function clearPart() {
		selected.partName = null;
		selected.partModelName = null;

		sceneConfig.controls?.setLookAt(
			...sceneConfig.camera.position,
			...sceneConfig.camera.target,
			true
		);
	}

	function clearSelection() {
		selected.modelName = null;
		selected.partName = null;

		resetAzimuthAngle();
		sceneConfig.controls?.setLookAt(
			...sceneConfig.camera.position,
			...sceneConfig.camera.target,
			true
		);
	}

	function setPosTargetFromCamera({ partName = null, socketName = null }) {
		const position = sceneConfig.controls?.getPosition();
		const target = sceneConfig.controls?.getTarget();
		console.log(sceneConfig);
		console.log(position);
		console.log(target);

		if (!partName && !socketName) return;

		const model = data.models.find((m) => m.name === selected.modelName);

		if (socketName) {
			const socket = model.sockets[socketName];
			socket.target = [
				Number(target.x.toFixed(2)),
				Number(target.y.toFixed(2)),
				Number(target.z.toFixed(2))
			];
			socket.position = [
				Number(position.x.toFixed(2)),
				Number(position.y.toFixed(2)),
				Number(position.z.toFixed(2))
			];
		}

		if (partName) {
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
		get selected() {
			return selected;
		},
		sceneConfig,
		setSelected,
		setAssetMaterial,
		setAssetColor,
		setSocketAttachment,
		setPosTargetFromCamera,
		clearPart,
		clearSelection,
		setSceneConfig,
		setAssetFromUrl,
		updateData
	};
};

export type AppConfig = ReturnType<typeof createConfig>;

export function getAppConfig(configName = 'config') {
	const config = getContext<AppConfig>(configName);
	return config;
}
