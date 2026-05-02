<script>
	import { nanoid } from 'nanoid';
	import Input from '../Input.svelte';
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import InputSelect from '../InputSelect.svelte';
	import { Image } from '@unpic/svelte';

	const config = getContext('config');

	const materials = $derived(config.data.materials);
	const textures = $derived(config.data.textures);
	const colors = $derived.by(() => {
		return config.data.colors.filter((c) => c.id !== '0');
	});

	const selectedMat = $state({ id: null });

	let texturesToDelete = $state([]);

	let formEl;
	let timeout;
	let isInitial = true;

	$effect(() => {
		const rawData = $state.snapshot(materials);
		if (isInitial) {
			isInitial = false;
			return;
		}

		// if (!rawData) return;

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			formEl?.requestSubmit();
		}, 2000);
	});
</script>

<form
	method="POST"
	action="?/saveMaterials"
	bind:this={formEl}
	use:enhance={({ formData }) => {
		console.log('ZAPISYWANIE');
		return async ({ update, result }) => {
			// await update({ reset: false });
			if (result.type === 'success') {
				console.log('ZAPISANO');
			}
		};
	}}
>
	<h2>Materials</h2>
	<hr />
	<div class="materials">
		{#each materials as material (material.id)}
			{#if material.name !== 'default'}
				<button
					type="button"
					onclick={() => {
						if (selectedMat.id === material.id) {
							selectedMat.id = null;
						} else {
							selectedMat.id = material.id;
						}
					}}>{material.displayName || 'No Name'}</button
				>
			{/if}
			<div class={'material' + (selectedMat.id === material.id ? '' : ' hidden')}>
				<Input id="material-id" value={material.id} hidden style="display: none;" />
				<Input id={'material-name-' + material.id} title="Name" bind:value={material.name} />
				<Input
					id={'material-displayName-' + material.id}
					title="Display Name"
					bind:value={material.displayName}
				/>
				<Input
					id={'material-description-' + material.id}
					title="Description"
					bind:value={material.description}
				/>
				<Input
					id={'material-metalness-' + material.id}
					title="Metalness"
					step="0.01"
					min="0"
					max="1"
					type="number"
					bind:value={material.metalness}
				/>
				<Input
					id={'material-roughness-' + material.id}
					title="Roughness"
					step="0.01"
					min="0"
					max="1"
					type="number"
					bind:value={material.roughness}
				/>
				<Input
					id={'material-transparent-' + material.id}
					title="Transparent"
					type="checkbox"
					bind:checked={material.transparent}
				/>
				<Input
					id={'material-opacity-' + material.id}
					title="Opacity"
					type="number"
					step="0.01"
					min="0"
					max="1"
					bind:value={material.opacity}
				/>
				<InputSelect
					id={'material-colors-' + material.id}
					title="Available Colors"
					data={colors}
					bind:value={material.colors}
					multiple={true}
					onChange={(value) => {
						console.log('CHANGE', value);
						if (value.length <= 1) {
							material.color = value[0]?.id;
						}
					}}
				/>
				<InputSelect
					id={'material-color-' + material.id}
					title="Default Color"
					data={material?.colors.map((color) => {
						return colors.find((c) => c.id === color.id);
					})}
					bind:value={material.color}
				/>
				<div class="textures">
					{#if textures.length > 0}
						{#each textures as texture (texture.id)}
							{#if texture?.name.includes(material.name)}
								<div class="texture">
									<Image src={texture.url} alt={texture.name} width={100} height={100} />
									<p>{texture.name}</p>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		{/each}
		<!-- {#each textures as texture (texture.id)}
			{#if texture?.isNew}
				<div class="texture">
					<Image src={texture.url} alt={texture.name} width={50} height={50} />
					<p>{texture.name}</p>
				</div>
			{/if}
		{/each} -->
	</div>
	<button
		type="button"
		onclick={(e) => {
			materials.push({
				id: nanoid(5),
				name: `new_material_${materials.length + 1}`,
				displayName: `NEW MATERIAL ${materials.length + 1}`,
				description: '',
				metalness: 0,
				roughness: 0.5,
				transparent: 0,
				opacity: 1,
				color: null,
				colors: [],
				createdAt: new Date().toISOString()
			});
		}}>Add Material</button
	>

	<!-- <Input
		id="texture"
		title="ADD TEXTURES"
		type="file"
		multiple
		accept="image/webp"
		onchange={(e) => {
			console.log(e.target.files);
			for (const file of e.target.files) {
				const existing = textures.find((t) => t.name === file.name.split('.')[0]);
				console.log(existing);
				if (existing) {
					existing.file = file;
					existing.url = URL.createObjectURL(file);
					existing.isNew = true;
					existing.updatedAt = new Date().toISOString();
				} else {
					textures.push({
						id: nanoid(5),
						name: file.name.split('.')[0],
						file: file,
						url: URL.createObjectURL(file),
						updatedAt: new Date().toISOString(),
						isNew: true
					});
				}
			}
			e.target.value = '';
			console.log(textures);
		}}
	/>
	<h2>ALL TEXTURES</h2>
	<Input id="texturesToDelete" value={texturesToDelete} />
	{#each textures as texture (texture.id)}
		<div class="texture">
			<Image src={texture.url} alt={texture.name} width={100} height={100} />
			<p>{texture.name}</p>
			<button
				type="button"
				onclick={() => {
					texturesToDelete.push(texture.id);
					textures.splice(textures.indexOf(texture), 1);
				}}>Remove</button
			>
		</div>
	{/each} -->
</form>

<style>
	.materials {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hidden {
		display: none;
	}
</style>
