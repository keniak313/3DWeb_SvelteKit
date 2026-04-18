<script>
	import { enhance } from '$app/forms';
	import { GLTFLoader } from 'three/examples/jsm/Addons.js';
	import Input from '../Input.svelte';
	import { nanoid } from '$lib/utilities/helpers';

	let { models = $bindable(), materials, colors } = $props();

	let modelExists = $state(false);

	let newModel = $state();
	let modelAction = $derived(modelExists ? '?/updateModel' : '?/addModel');

	let selectedModel = $state({ id: null });
</script>

<div>
	<h2>MODELS</h2>
	<hr />
	{#if models.length > 0}
		{#each models as model (model.id)}
			<button
				type="button"
				onclick={() => {
					if (selectedModel.id === model.id) {
						selectedModel.id = null;
					} else {
						selectedModel.id = model.id;
					}
				}}>{model.name}</button
			>
		{/each}
		<form
			method="POST"
			action="?/updateModels"
			enctype="multipart/form-data"
			use:enhance={() => {
				return async ({ update }) => {
					await update({ reset: false });
				};
			}}
		>
			{#each models as model (model.id)}
				{#if selectedModel.id === model.id}
					<Input id="id" value={model.id} hidden />
					<Input id={'name-' + model.id} title="Name" bind:value={model.name} />
					<Input id={'url-' + model.id} title="URL" bind:value={model.url} />
					<Input
						id={'displayName-' + model.id}
						title="Display Name"
						bind:value={model.displayName}
					/>
					<Input
						id={'description-' + model.id}
						title="Description"
						bind:value={model.description}
					/>
					<div class="parts">
						<p>Parts:</p>
						{#if model.parts}
							{#each Object.values(model.parts) as part (part.id)}
								<Input id="partId" value={part.id} hidden />
								<Input id={'part-modelId-' + part.id} value={model.id} hidden />
								<Input id={'part-name-' + part.id} title="Name" bind:value={part.name} />
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
								<Input
									id={'part-interactive-' + part.id}
									title="Interactive"
									type="checkbox"
									bind:checked={part.interactive}
								/>
								<Input
									id={'part-materials-' + part.id}
									title="Available Materials"
									type="select-multiple"
									data={materials}
									bind:value={part.materials}
								/>
								<Input
									id={'part-material-' + part.id}
									title="Default Material"
									type="select"
									data={part.materials.map((material) => {
										return materials.find((m) => m.id === material);
									})}
									bind:value={part.material}
								/>
								<Input
									id={'part-color-' + part.id}
									title="Default Color"
									type="select"
									data={materials
										?.find((m) => m.id === part.material)
										?.colors?.map((color) => {
											return colors?.find((c) => c.id === color);
										})}
									bind:value={part.color}
								/>
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
							{/each}
						{/if}
					</div>
				{/if}
			{/each}
			<button type="submit">Save Model settings</button>
		</form>
	{/if}

	<form
		action="?/addModel"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			formData.append('modelInfo', JSON.stringify(newModel));

			return async ({ update, result }) => {
				await update();
				models = result.data.models;
			};
		}}
	>
		{#if modelExists}
			<p>Model already exists. Uploading will result in updating exisiting model.</p>
		{/if}
		<Input
			type="file"
			id="file"
			accept=".glb,.gltf"
			onchange={async (e) => {
				const file = e.target.files[0];
				const url = URL.createObjectURL(file);
				const loader = new GLTFLoader();

				const gltf = (await loader.loadAsync(url)).scene.children[0];
				const checkExisting = models.find((model) => model.name === gltf.name);
				console.log('Existing:', $state.snapshot(checkExisting));

				const parts = gltf.children.reduce((acc, part) => {
					acc[part.name] = {
						id: nanoid(5),
						name: part.name,
						displayName: '',
						description: '',
						interactive: false,
						materials: [],
						material: '',
						color: '',
						position: [1, 1, 1],
						target: [0, 1, 0]
					};
					return acc;
				}, {});
				newModel = {
					id: nanoid(5),
					name: file.name.split('.')[0],
					displayName: '',
					description: '',
					parts: parts
				};

				if (checkExisting) {
					const existingModel = checkExisting;

					const newParts = gltf.children.reduce((acc, part) => {
						acc[part.name] = {
							id: nanoid(5),
							name: part.name,
							displayName: '',
							description: '',
							interactive: false,
							materials: [],
							material: '',
							color: '',
							position: [1, 1, 1],
							target: [0, 1, 0]
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
					newModel.displayName = existingModel.displayName;
					newModel.description = existingModel.description;
					newModel.url = existingModel.url;
					newModel.parts = newParts;
				}

				console.log('GLB', gltf);
				console.log('NEW MODEL', $state.snapshot(newModel));
			}}
			required
		/>
		<button type="submit">Add Model</button>
	</form>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
