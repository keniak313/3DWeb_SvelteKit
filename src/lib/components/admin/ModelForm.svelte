<script>
	import { enhance } from '$app/forms';
	import { GLTFLoader } from 'three/examples/jsm/Addons.js';
	import Input from '../Input.svelte';
	import { checkName, nanoid } from '$lib/utilities/helpers';
	import { goto, invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { Image } from '@unpic/svelte';
	import InputSelect from '../InputSelect.svelte';
	import { useDraco } from '@threlte/extras';
	import ItemIcon from '../ItemIcon.svelte';

	let selectedModel = $state({ id: null });
	let selecedPart = $state({ id: null });

	const config = getContext('config');

	const models = $derived(config.data.models);
	const attachments = $derived(models.filter((model) => model?.isAttachment));
	const materials = $derived(config.data.materials);
	const colors = $derived(config.data.colors);

	const dracoLoader = useDraco();

	const generateIcon = async (model) => {
		const targetSize = 512;
		// 1. Spróbuj znaleźć canvas (dodaj klasę lub id do <Canvas> dla pewności)
		const sourceCanvas = document.querySelector('canvas');

		if (!sourceCanvas) {
			console.error('Nie znaleziono elementu canvas!');
			return null;
		}

		// 2. Sprawdź czy wymiary źródła są poprawne (nie są 0)
		if (sourceCanvas.width === 0 || sourceCanvas.height === 0) {
			console.error('Canvas ma zerowe wymiary!');
			return null;
		}

		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = targetSize;
		tempCanvas.height = targetSize;
		const ctx = tempCanvas.getContext('2d');

		if (!ctx) return null;

		const sw = sourceCanvas.width;
		const sh = sourceCanvas.height;
		const size = Math.min(sw, sh);
		const sx = (sw - size) / 2;
		const sy = (sh - size) / 2;

		// Przechwycenie obrazu
		ctx.drawImage(sourceCanvas, sx, sy, size, size, 0, 0, targetSize, targetSize);

		model.newIcon = true;

		const url = tempCanvas.toDataURL('image/webp');
		console.log('ICON URL', url);
		return url;
	};
</script>

<div>
	<h2>MODELS</h2>
	<hr />
	{#if models.length > 0}
		{#each models.filter((m) => !m.isAttachment) as model (model.id)}
			<button
				type="button"
				onclick={() => {
					if (config.selectedAsset?.model?.name === model.name) {
						config.clearSelection();
					} else {
						config.setSelected({ modelName: model.name });
					}
				}}>{model.name}</button
			>
		{/each}
		<p>ATTACHMENTS:</p>
		{#each models.filter((m) => m.isAttachment) as model (model.id)}
			<button
				type="button"
				onclick={() => {
					if (config.selectedAsset?.model?.name === model.name) {
						config.clearSelection();
					} else {
						config.setSelected({ modelName: model.name });
					}
				}}>{model.name}</button
			>
		{/each}
		<!-- <form
			method="POST"
			action="?/updateModels"
			enctype="multipart/form-data"
			use:enhance={async ({ formData }) => {
				for await (const model of Object.values(models)) {
					if (model.newIcon) {
						const base64 = model.icon;

						const res = await fetch(base64);
						const blob = await res.blob();
						formData.append(`icon-${model.id}`, blob, `${model.name}.webp`);
					} else {
						formData.append(`icon-${model.id}`, model.icon);
					}
				}
				return async ({ update, result }) => {
					await update({ reset: false });
					Object.values(models).forEach((model) => {
						model.newIcon = false;
						model.icon = result.data.models.find((m) => m.id === model.id).icon;
					});
				};
			}}
		> -->
		{#each models as model (model.id)}
			{@const time = new Date(model.updatedAt).getTime()}
			<div class={config.selectedAsset?.model?.name === model.name ? '' : 'hidden'}>
				<div>
					<p>ICON</p>
					<ItemIcon
						src={model.icon}
						updatedAt={model.updatedAt}
						isNew={model.newIcon}
						width={100}
						height={100}
					/>
					<!-- {#if model.icon}
						{#if !model.newIcon}
							<Image src={model.icon + '?v=' + time} alt="" width="100" height="100" />
						{:else}
							<Image src={model.icon} alt="" width="100" height="100" />
						{/if}
					{/if} -->
					<button
						type="button"
						onclick={async () => {
							console.log('MODEL TO GENERATE', model);
							model.icon = await generateIcon(model);
						}}
						>GENERATE ICON
					</button>
				</div>
				<Input id="model-id" value={model.id} hidden />
				<Input id={'model-isAttachment-' + model.id} value={model.isAttachment} hidden />
				<Input id={'model-socket-' + model.id} value={model.socket} hidden />
				<Input
					id={'model-name-' + model.id}
					title="Name"
					bind:value={model.name}
					hidden
					valueOnly
				/>
				<Input id={'model-url-' + model.id} title="URL" bind:value={model.url} hidden valueOnly />
				<Input
					id={'model-displayName-' + model.id}
					title="Display Name"
					bind:value={model.displayName}
				/>
				<Input
					id={'model-description-' + model.id}
					title="Description"
					bind:value={model.description}
				/>
				<div class="parts">
					<p>Parts:</p>
					{#each Object.values(model.parts) as part (part.id)}
						<button
							type="button"
							onclick={() => {
								if (selecedPart.id === part.id) {
									selecedPart.id = null;
								} else {
									selecedPart.id = part.id;
								}
							}}>{part.name}</button
						>
					{/each}
					{#if model.parts}
						{#each Object.values(model.parts) as part (part.id)}
							<div class={config.selectedAsset?.part?.id === part.id ? '' : 'hidden'}>
								<Input id="part-id" value={part.id} hidden />
								<Input id={'part-model-id-' + part.id} value={model.id} hidden />
								<Input id={'part-model-name-' + part.id} value={part.modelName} hidden />
								<Input
									id={'part-isAttachment-' + part.id}
									type="checkbox"
									value={part.isAttachment}
									hidden
								/>
								<Input id={'part-socket-' + part.id} value={part.socket} hidden />
								<Input
									id={'part-name-' + part.id}
									title="Name"
									bind:value={part.name}
									hidden
									valueOnly
								/>
								<Input
									id={'part-displayName-' + part.id}
									title="Display Name"
									bind:value={part.displayName}
								/>
								<Input
									id={'part-description-' + part.id}
									title="Description"
									bind:value={part.description}
								/>
								<!-- <Input
									id={'part-materials-' + part.id}
									title="Available Materials"
									type="select-multiple"
									data={materials}
									bind:value={part.materials}
									onchange={() => {
										console.log('XX', part.materials);
										if (part.materials.length <= 1) {
											part.material = part.materials[0];
											part.color = materials.find((m) => m.id === part.material)?.colors[0];
										}
									}}
								/> -->
								<InputSelect
									id={'part-materials-' + part.id}
									title="Available Materials"
									data={materials}
									bind:value={part.materials}
									multiple
									onChange={(value) => {
										if (value.length <= 1) {
											part.material = value[0]?.id;
											part.color = materials?.find((m) => m.id === value[0].id)?.colors[0]?.id;
										}
									}}
								/>
								<InputSelect
									id={'part-material-' + part.id}
									title="Default Material"
									data={part.materials.map((material) => {
										return materials?.find((m) => m.id === material.id);
									})}
									bind:value={part.material}
									onChange={(value) => {
										if (value) {
											part.color = materials?.find((m) => m.id === value)?.colors[0]?.id;
										}
									}}
								/>
								<InputSelect
									id={'part-color-' + part.id}
									title="Default Color"
									data={materials
										?.find((m) => m.id === part.material)
										?.colors?.map((color) => {
											return colors?.find((c) => c.id === color.id);
										})}
									bind:value={part.color}
								/>
								<!-- <Input
									id={'part-material-' + part.id}
									title="Default Material"
									type="select"
									data={part.materials.map((material) => {
										return materials.find((m) => m.id === material);
									})}
									bind:value={part.material}
								/> -->
								<!-- <Input
									id={'part-color-' + part.id}
									title="Default Color"
									type="select"
									data={materials
										?.find((m) => m.id === part.material)
										?.colors?.map((color) => {
											return colors?.find((c) => c.id === color);
										})}
									bind:value={part.color}
								/> -->
								<div class="row">
									<Input
										id={'part-position-x-' + part.id}
										title="Position X"
										type="number"
										step="0.01"
										bind:value={part.position[0]}
									/>
									<Input
										id={'part-position-y-' + part.id}
										title="Position Y"
										type="number"
										step="0.01"
										bind:value={part.position[1]}
									/>
									<Input
										id={'part-position-z-' + part.id}
										title="Position Z"
										type="number"
										step="0.01"
										bind:value={part.position[2]}
									/>
								</div>
								<div class="row">
									<Input
										id={'part-target-x-' + part.id}
										title="Target X"
										type="number"
										step="0.01"
										bind:value={part.target[0]}
									/>
									<Input
										id={'part-target-y-' + part.id}
										title="Target Y"
										type="number"
										step="0.01"
										bind:value={part.target[1]}
									/>
									<Input
										id={'part-target-z-' + part.id}
										title="Target Z"
										type="number"
										step="0.01"
										bind:value={part.target[2]}
									/>
								</div>
								<button
									type="button"
									onclick={() => {
										config.setPosTargetFromCamera({ partName: part.name });
									}}>SET FROM CAMERA</button
								>
							</div>
						{/each}
					{/if}
				</div>
				{#if model.sockets}
					<div class="sockets">
						<p>Sockets:</p>

						{#each Object.values(model.sockets) as socket (socket.id)}
							<div>
								<Input id="socket-id" title="Id" value={socket.id} hidden />
								<Input
									id={'socket-model-id-' + socket.id}
									title="Model Id"
									value={model.id}
									hidden
								/>
								<Input
									id={'socket-name-' + socket.id}
									title="Name"
									bind:value={socket.name}
									hidden
									valueOnly
								/>
								<!-- <Input
									id={'socket-attachemnts-' + socket.id}
									title="Attachments"
									bind:value={socket.attachemnts}
								/> -->
								<!-- <InputSelect
									id={'part-materials-' + part.id}
									title="Available Materials"
									data={materials}
									bind:value={part.materials}
									multiple
									onChange={(value) => {
										if (value.length <= 1) {
											part.material = value[0]?.id;
											part.color = materials?.find((m) => m.id === value[0].id)?.colors[0]?.id;
										}
									}}
								/> -->

								<InputSelect
									id={'socket-attachments-' + socket.id}
									title="Available Attachments"
									data={attachments.filter((a) => a.socket === socket.name)}
									multiple
									bind:value={socket.attachments}
									onChange={(value) => {
										console.log(models);
										if (value.length <= 1) {
											socket.attachment = value[0]?.id;
										}
									}}
								/>
								{console.log('attachments', $state.snapshot(attachments))}
								<InputSelect
									id={'socket-attachment-' + socket.id}
									title="Default Attachment"
									data={socket.attachments?.map((att) => {
										console.log(att);
										return attachments?.find((a) => a.id === att.id);
									})}
									bind:value={socket.attachment}
								/>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
		<!-- <button type="submit">Save Model settings</button>
		</form> -->
	{/if}

	<Input
		type="file"
		id="file"
		accept=".glb,.gltf"
		onchange={async (e) => {
			let modelExists = false;
			let newModel = {};
			const file = e.target.files[0];
			const url = URL.createObjectURL(file);
			const loader = new GLTFLoader();
			loader.setDRACOLoader(dracoLoader);

			const gltfData = await loader.loadAsync(url);
			const gltf = gltfData.scene;

			const checkAttachemnt = checkName(file.name.split('.')[0]).attachment();
			const name = checkAttachemnt.isAttachment ? checkAttachemnt.name : file.name.split('.')[0];

			const checkExisting = models.find((model) => model.name === name) || null;
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
						attachment: null
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
				name: checkAttachemnt.isAttachment ? checkAttachemnt.name : file.name.split('.')[0],
				displayName: '',
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
				const existingModel = checkExisting;
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
				newModel.file = file;
			}

			if (!modelExists) {
				console.log('MODEL DOESNT EXIST, ADDING NEW', newModel);
				config.data.models.push(newModel);
			} else {
				console.log('MODEL EXIST MAPPING', newModel);
				const updatedModels = config.data.models.map((m) => (m.id === newModel.id ? newModel : m));
				config.data.models = updatedModels;
			}

			console.log('FILE??', file);
			console.log('GLB', gltf);
			console.log('NEW MODEL', newModel);
			console.log(models);
			e.target.value = '';
		}}
	/>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-bottom: 1rem;
	}

	.hidden {
		display: none;
	}
</style>
