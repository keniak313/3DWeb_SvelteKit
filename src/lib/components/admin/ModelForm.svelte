<script>
	import { applyAction, enhance } from '$app/forms';
	import { GLTFLoader } from 'three/examples/jsm/Addons.js';
	import Input from '../Input.svelte';
	import { checkName, nanoid } from '$lib/utilities/helpers';
	import { goto, invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { Image } from '@unpic/svelte';
	import InputSelect from '../InputSelect.svelte';
	import { useDraco } from '@threlte/extras';
	import ItemIcon from '../ItemIcon.svelte';
	import { getAppConfig } from '$lib/state/config.svelte';

	let { form } = $props();

	let selectedModel = $state({ id: null });
	let selecedPart = $state({ id: null });

	const config = getAppConfig();

	const models = $derived(config.data.models);
	const attachments = $derived(models.filter((model) => model?.isAttachment));
	const materials = $derived(config.data.materials);
	const colors = $derived(config.data.colors);

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

	let formEl;
	let timeout;
	let isInitial = true;

	$effect(() => {
		const rawData = $state.snapshot(models);
		if (isInitial) {
			isInitial = false;
			return;
		}

		// if (!rawData) return;

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			formEl?.requestSubmit();
		}, 500);
	});
</script>

{#if form}
	{console.log('MODELS ERRORS:', form)}
{/if}

<form
	bind:this={formEl}
	method="POST"
	action="?/saveModels"
	enctype="multipart/form-data"
	use:enhance={async ({ formData }) => {
		for await (const model of Object.values(models)) {
			if (model.newIcon) {
				const base64 = model.icon;

				const res = await fetch(base64);
				const blob = await res.blob();
				formData.append(`model-icon-${model.id}`, blob, `${model.name}.webp`);
			} else {
				formData.append(`model-icon-${model.id}`, model.icon);
			}
		}
		return async ({ update, result }) => {
			console.log('ZAPISYWANIE');
			if (result.type === 'success') {
				await update({ reset: false });
				Object.values(models).forEach((model) => {
					if (model.newIcon) {
						model.newIcon = false;
						model.icon = result.data.updatedModels.find((m) => m.id === model.id).icon;
					}
				});
				form = null;
				console.log('ZAPISANE');
			} else {
				applyAction(result);
			}
		};
	}}
>
	<h2>MODELS</h2>
	<hr />
	{#if models.length > 0}
		{#each models as model, index (model.id)}
			<button
				type="button"
				style={form?.error?.items[index] ? 'background-color: red;' : ''}
				onclick={() => {
					if (config.selectedAsset?.model?.name === model.name) {
						config.clearSelection();
					} else {
						config.setSelected({ modelName: model.name });
					}
				}}>{model.name}</button
			>
		{/each}
		<!-- <p>ATTACHMENTS:</p> -->
		<!-- {#each models.filter((m) => m.isAttachment) as model, index (model.id)}
			<button
				type="button"
				style={form?.error?.items[index] ? 'background-color: red;' : ''}
				onclick={() => {
					if (config.selectedAsset?.model?.name === model.name) {
						config.clearSelection();
					} else {
						config.setSelected({ modelName: model.name });
					}
				}}>{model.name}</button
			>
		{/each} -->

		{#each models as model, index (model.id)}
			{@const time = new Date(model.updatedAt).getTime()}
			<div class={config.selectedAsset?.model?.name === model.name ? '' : 'hidden'}>
				<div>
					<p>ICON</p>
					<ItemIcon src={model.icon} updatedAt={model.updatedAt} isNew={model.newIcon} size={100} />
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
					error={form?.error?.items[index]?.properties?.displayName?.errors[0]}
				/>
				<Input
					id={'model-description-' + model.id}
					title="Description"
					bind:value={model.description}
					error={form?.error?.items[index]?.properties?.description?.errors[0]}
				/>
				<div class="parts">
					<p>Parts:</p>
					{#each Object.values(model.parts) as part, partIndex (part.id)}
						<button
							type="button"
							style={form?.error?.items[index]?.properties?.parts?.properties?.[part.name]
								? 'background-color: red;'
								: ''}
							onclick={() => {
								config.setSelected({
									modelName: model.name,
									partModelName: part.modelName,
									partName: part.name
								});
								console.log(config.selected);
								console.log(config.selectedAsset);
								// if (selecedPart.id === part.id) {
								// 	selecedPart.id = null;
								// } else {
								// 	selecedPart.id = part.id;
								// }
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
									error={form?.error?.items?.[index]?.properties?.parts?.properties?.[part.name]
										?.properties?.displayName?.errors[0]}
								/>
								<Input
									id={'part-description-' + part.id}
									title="Description"
									bind:value={part.description}
									error={form?.error?.items?.[index]?.properties?.parts?.properties?.[part.name]
										?.properties?.description?.errors[0]}
								/>
								<InputSelect
									id={'part-materials-' + part.id}
									title="Available Materials"
									data={materials}
									bind:value={part.materials}
									multiple
									onChange={(value) => {
										if (value.length <= 1) {
											part.material = value[0]?.id;
											part.color = materials?.find((m) => m.id === value[0]?.id)?.colors[0]?.id;
										}
									}}
									error={form?.error?.items?.[index]?.properties?.parts?.properties?.[part.name]
										?.properties?.materials?.errors[0]}
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
									error={form?.error?.items?.[index]?.properties?.parts?.properties?.[part.name]
										?.properties?.material?.errors[0]}
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
									error={form?.error?.items?.[index]?.properties?.parts?.properties?.[part.name]
										?.properties?.color?.errors[0]}
								/>
								{#if !model.isAttachment}
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
								{/if}
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
									error={form?.error?.items[index]?.properties?.sockets?.errors[0]}
								/>

								<InputSelect
									id={'socket-attachment-' + socket.id}
									title="Default Attachment"
									data={socket.attachments?.map((att) => {
										// console.log(att);
										return attachments?.find((a) => a.id === att.id);
									})}
									bind:value={socket.attachment}
									error={form?.error?.items[index]?.properties?.sockets?.errors[0]}
								/>
								{#if socket.position && socket.target}
									<div class="row">
										<Input
											id={'socket-position-x-' + socket.id}
											title="Position X"
											type="number"
											step="0.01"
											bind:value={socket.position[0]}
										/>
										<Input
											id={'socket-position-y-' + socket.id}
											title="Position Y"
											type="number"
											step="0.01"
											bind:value={socket.position[1]}
										/>
										<Input
											id={'socket-position-z-' + socket.id}
											title="Position Z"
											type="number"
											step="0.01"
											bind:value={socket.position[2]}
										/>
									</div>
									<div class="row">
										<Input
											id={'socket-target-x-' + socket.id}
											title="Target X"
											type="number"
											step="0.01"
											bind:value={socket.target[0]}
										/>
										<Input
											id={'socket-target-y-' + socket.id}
											title="Target Y"
											type="number"
											step="0.01"
											bind:value={socket.target[1]}
										/>
										<Input
											id={'socket-target-z-' + socket.id}
											title="Target Z"
											type="number"
											step="0.01"
											bind:value={socket.target[2]}
										/>
									</div>
									<button
										type="button"
										onclick={() => {
											config.setPosTargetFromCamera({
												socketName: socket.name
											});
										}}>SET FROM CAMERA</button
									>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</form>

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

	.row {
		display: flex;
		gap: 0.5rem;
	}
</style>
