<script>
	import { checkName } from '$lib/utilities/helpers';
	import { nanoid } from 'nanoid';
	import { GLTFLoader } from 'three/examples/jsm/Addons.js';
	import Input from '../Input.svelte';
	import { enhance } from '$app/forms';
	import { useDraco } from '@threlte/extras';
	import { getAppConfig } from '$lib/state/config.svelte';
	import ProductCanvas from '../ProductCanvas.svelte';
	import { Canvas } from '@threlte/core';
	import PreviewCanvas from '../PreviewCanvas.svelte';
	import PopupWrapper from '../PopupWrapper.svelte';
	import SimpleLoader from '../SimpleLoader.svelte';

	const dracoLoader = useDraco();

	const config = getAppConfig();

	let models = $derived(config.data.models);

	let newModel = $state({});
	let newModelGltf = $state();
	let isPreview = $state(false);
	let modelExists = $state(false);
	let existingModel = $state({});

	let formEl;

	let isLoading = $state(false);

	let triangleCount = $derived.by(() => {
		if (newModelGltf) {
			const scene = newModelGltf.scene;
			let total = 0;
			scene.traverse((object) => {
				if (object.isMesh) {
					const geometry = object.geometry;
					if (geometry.index) {
						// Jeśli geometria ma indeksy (najczęstszy przypadek)
						total += geometry.index.count / 3;
					} else {
						// Jeśli nie ma indeksów, liczymy surowe wierzchołki
						total += geometry.attributes.position.count / 3;
					}
				}
			});
			return Math.round(total);
		}
	});
</script>

<SimpleLoader {isLoading} />

{#if isPreview}
	<PopupWrapper>
		<div class="preview-scene">
			<PreviewCanvas model={newModel} />
		</div>
		<div class="preview-sidebar">
			{#if newModel}
				<div class="info">
					{#if modelExists}
						<p style="background-color: red;">
							WARNING - MODEL WITH THIS NAME ALREADY EXISTS, IT WILL BE OVERWRITTEN ON IMPORT
						</p>
					{/if}
					<p>ID: {newModel.id}</p>
					<p>NAME: {newModel.name}</p>
					<p>ATTACHMENT: {newModel.isAttachment}</p>
					<p>TRIANGLES: {triangleCount}</p>
					{console.log('NEWWWW', newModel)}
					{console.log('NEWWWW GLB', newModelGltf)}
				</div>
				{#if newModel.parts}
					<div class="parts">
						<p>PARTS</p>

						<div class="list">
							{#if !modelExists}
								{#each Object.values(newModel?.parts) as part (part.id)}
									<p>{part.name}</p>
								{/each}
							{:else}
								<div class="compare">
									<div class="compare-list">
										<p>NEW</p>
										{#each Object.values(newModel?.parts) as part (part.id)}
											<p>{part.name}</p>
										{/each}
									</div>
									<div class="compare-list">
										<p>EXISTING</p>
										{#each Object.values(existingModel.parts) as part (part.id)}
											<p>{part.name}</p>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				{#if newModel.sockets && Object.keys(newModel.sockets).length > 0}
					<div class="sockets">
						<p>SOCKETS</p>
						{#if !modelExists}
							{#each Object.values(newModel.sockets) as socket (socket.id)}
								<p>{socket.name}</p>
							{/each}
						{:else}
							<div class="compare">
								<div class="compare-list">
									<p>NEW</p>
									{#each Object.values(newModel.sockets) as socket (socket.id)}
										<p>{socket.name}</p>
									{/each}
								</div>
								<div class="compare-list">
									<p>EXISTING</p>
									{#each Object.values(existingModel.sockets) as socket (socket.id)}
										<p>{socket.name}</p>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
			<div class="buttons">
				<button
					type="button"
					onclick={() => {
						formEl?.requestSubmit();
					}}>IMPORT</button
				>
				<button
					type="button"
					onclick={() => {
						isPreview = false;
						modelExists = false;
						newModel = {};
						existingModel = {};
					}}>DISCARD</button
				>
			</div>
		</div>
	</PopupWrapper>
{/if}

<form
	action="?/addModel"
	method="POST"
	enctype="multipart/form-data"
	bind:this={formEl}
	use:enhance={({ formData }) => {
		isLoading = true;
		if (newModel) {
			formData.append('model', JSON.stringify(newModel));
			formData.append('modelFile', newModel.file);

			return async ({ update, result }) => {
				await update({ reset: false });

				if (result.type === 'success') {
					isPreview = false;
					modelExists = false;
					newModel = {};
					existingModel = {};

					window.location.reload();
				}
			};
		}
	}}
>
	<Input
		title="ADD MODEL"
		type="file"
		id="file"
		accept=".glb,.gltf"
		onchange={async (e) => {
			isPreview = true;
			const file = e.target.files[0];
			const url = URL.createObjectURL(file);
			const loader = new GLTFLoader();
			loader.setDRACOLoader(dracoLoader);

			const gltfData = await loader.loadAsync(url);
			const gltf = gltfData.scene;

			newModelGltf = gltfData;

			const checkAttachemnt = checkName(file.name.split('.')[0]).attachment();
			const name = file.name.split('.')[0];

			const checkExisting = models.find((model) => model.name === name) || null;
			existingModel = checkExisting;
			console.log('Existing:', $state.snapshot(checkExisting));

			const parts = gltf.children.reduce((acc, part) => {
				if (!checkName(part.name).use().isUse) return acc;
				acc[part.name] = {
					id: nanoid(5),
					name: part.name,
					modelName: name,
					displayName: '',
					description: '',
					materials: [],
					material: null,
					color: null,
					isAttachment: checkName(file.name.split('.')[0]).attachment().isAttachment,
					socket: checkName(file.name.split('.')[0]).attachment().socket || null,
					position: [3, 2, 3],
					target: [0, 0.8, 0]
				};
				return acc;
			}, {});
			const sockets = gltf.children
				.filter((child) => checkName(child.name).socket().isSocket)
				.reduce((acc, child) => {
					const socket = checkName(child.name).socket();
					acc[socket.name] = {
						id: nanoid(5),
						name: socket.name,
						attachments: [],
						attachment: null,
						position: [3, 2, 3],
						target: [0, 0.8, 0]
					};
					return acc;
				}, {});
			// const sockets = gltf.children.forEach((child) => {
			// 	const check = checkName(child.name).socket();
			// 	if (check.isSocket) {
			// 		console.log('CHILD NAME', check.name);
			// 	}
			// });
			console.log('SOCKETS', sockets);
			newModel = {
				id: nanoid(5),
				name: file.name.split('.')[0],
				displayName: checkAttachemnt.isAttachment ? checkAttachemnt.name : file.name.split('.')[0],
				description: '',
				url: url,
				icon: null,
				parts: parts,
				isAttachment: checkName(file.name.split('.')[0]).attachment().isAttachment,
				socket: checkName(file.name.split('.')[0]).attachment().socket || null,
				file: file
				// sockets: sockets
			};

			if (!checkAttachemnt.isAttachment) {
				newModel.sockets = sockets;
			}

			if (checkExisting) {
				const existingModel = { ...checkExisting };
				existingModel.url = url;
				existingModel.file = file;
				existingModel.updatedAt = new Date().toISOString();

				const newParts = gltf.children.reduce((acc, part) => {
					if (!checkName(part.name).use().isUse) return acc;
					acc[part.name] = {
						id: nanoid(5),
						name: part.name,
						modelName: name,
						displayName: '',
						description: '',
						materials: [],
						material: null,
						color: null,
						isAttachment: checkName(file.name.split('.')[0]).attachment().isAttachment,
						socket: checkName(file.name.split('.')[0]).attachment().socket || null,
						position: [3, 2, 3],
						target: [0, 0.8, 0]
					};
					return acc;
				}, {});

				console.log('EXISTING PARTS', Object.values($state.snapshot(existingModel.parts)));
				console.log('NEW PARTS', Object.values(newParts));

				Object.values(newParts).forEach((part) => {
					const existingPart = existingModel.parts[part.name];
					if (existingPart) {
						newParts[part.name] = $state.snapshot(existingPart);
					}
				});

				const newSockets = gltf.children.reduce((acc, child) => {
					if (!checkName(child.name).socket().isSocket) return acc;
					const socket = checkName(child.name).socket();
					acc[socket.name] = {
						id: nanoid(5),
						name: socket.name,
						attachments: [],
						attachment: null,
						position: [3, 2, 3],
						target: [0, 0.8, 0]
					};
					return acc;
				}, {});

				Object.values(newSockets).forEach((socket) => {
					const existingSocket = existingModel.sockets[socket.name];
					if (existingSocket) {
						newSockets[socket.name] = $state.snapshot(existingSocket);
					}
				});

				console.log('UPDATED PARTS', newParts);

				modelExists = true;
				newModel.id = existingModel.id;
				newModel.name = existingModel.name;
				newModel.modelName = existingModel.modelName;
				newModel.displayName = existingModel.displayName;
				newModel.description = existingModel.description;
				newModel.url = existingModel.url;
				newModel.icon = existingModel.icon;
				newModel.parts = newParts;
				newModel.sockets = newSockets;
				newModel.file = file;
			}

			if (!modelExists) {
				console.log('MODEL DOESNT EXIST, ADDING NEW', newModel);
				// config.data.models.push(newModel);
			} else {
				console.log('MODEL EXIST MAPPING', newModel);
				// const updatedModels = config.data.models.map((m) => (m.id === newModel.id ? newModel : m));
				// config.data.models = updatedModels;
			}

			console.log('FILE??', file);
			console.log('GLB', gltf);
			console.log('NEW MODEL', newModel);
			console.log(models);
			e.target.value = '';
		}}
	/>
</form>

<style>
	.preview {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.preview-content {
		width: 90%;
		height: 90%;
		background-color: white;
		display: flex;
	}

	.preview-scene {
		width: 100%;
		height: 100%;
		flex: 1;
	}

	.preview-sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 0.25;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.parts {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.list {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.compare {
		display: flex;
		width: 100%;
		gap: 0.5rem;
	}

	.compare-list {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
</style>
