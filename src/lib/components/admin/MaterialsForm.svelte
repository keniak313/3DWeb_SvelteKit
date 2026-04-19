<script>
	import { nanoid } from 'nanoid';
	import Input from '../Input.svelte';
	import { enhance } from '$app/forms';

	let { materials, colors } = $props();

	const selectedMat = $state({ id: null });
</script>

<div>
	<h2>Materials</h2>
	<hr />
	<form
		method="POST"
		action="?/updateMaterials"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
			};
		}}
	>
		<div class="materials">
			{#each materials as material (material.id)}
				<button
					onclick={() => {
						if (selectedMat.id === material.id) {
							selectedMat.id = null;
						} else {
							selectedMat.id = material.id;
						}
					}}>{material.name}</button
				>
				<div class={'material' + (selectedMat.id === material.id ? '' : ' hidden')}>
					<Input id="id" value={material.id} hidden style="display: none;" />
					<Input id={'name-' + material.id} title="Name" bind:value={material.name} />
					<Input
						id={'displayName-' + material.id}
						title="Display Name"
						bind:value={material.displayName}
					/>
					<Input
						id={'description-' + material.id}
						title="Description"
						bind:value={material.description}
					/>
					<Input
						id={'metalness-' + material.id}
						title="Metalness"
						step="0.01"
						min="0"
						max="1"
						type="number"
						bind:value={material.metalness}
					/>
					<Input
						id={'roughness-' + material.id}
						title="Roughness"
						step="0.01"
						min="0"
						max="1"
						type="number"
						bind:value={material.roughness}
					/>
					<Input
						id={'transparent-' + material.id}
						title="Transparent"
						type="checkbox"
						bind:checked={material.transparent}
					/>
					<Input
						id={'opacity-' + material.id}
						title="Opacity"
						type="number"
						step="0.01"
						min="0"
						max="1"
						bind:value={material.opacity}
					/>
					<Input
						id={'color-' + material.id}
						title="Default Color"
						type="select"
						data={material.colors.map((color) => {
							return colors.find((c) => c.id === color);
						})}
						bind:value={material.color}
					/>
					<Input
						id={'colors-' + material.id}
						title="Available Colors"
						type="select-multiple"
						data={colors}
						bind:value={material.colors}
						multiple
					/>
				</div>
			{/each}
		</div>
		<button
			type="button"
			onclick={(e) => {
				materials.push({
					id: nanoid(5),
					name: '',
					displayName: '',
					description: '',
					metalness: 0,
					roughness: 0.5,
					transparent: 0,
					opacity: 1,
					color: '',
					colors: [],
					createdAt: new Date().toISOString()
				});
			}}>Add Material</button
		>
		<button type="submit">Save Materials</button>
	</form>
</div>

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
