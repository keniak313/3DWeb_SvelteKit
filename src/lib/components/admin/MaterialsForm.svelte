<script>
	import { nanoid } from 'nanoid';
	import Input from '../Input.svelte';
	import { enhance } from '$app/forms';

	let { materials = $bindable(), colors } = $props();
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
				<Input id="id" value={material.id} hidden style="display: none;" />
				<Input id={'name-' + material.id} bind:value={material.name} />
				<Input id={'displayName-' + material.id} bind:value={material.displayName} />
				<Input id={'description-' + material.id} bind:value={material.description} />
				<Input
					id={'metalness-' + material.id}
					step="0.01"
					min="0"
					max="1"
					type="number"
					bind:value={material.metalness}
				/>
				<Input
					id={'roughness-' + material.id}
					step="0.01"
					min="0"
					max="1"
					type="number"
					bind:value={material.roughness}
				/>
				<Input
					id={'transparent-' + material.id}
					type="checkbox"
					bind:checked={material.transparent}
				/>
				<Input
					id={'opacity-' + material.id}
					type="number"
					step="0.01"
					min="0"
					max="1"
					bind:value={material.opacity}
				/>
				<Input
					id={'color-' + material.id}
					type="select"
					data={material.colors.map((color) => {
						return colors.find((c) => c.id === color);
					})}
					bind:value={material.color}
				/>
				<Input
					id={'colors-' + material.id}
					type="select-multiple"
					data={colors}
					bind:value={material.colors}
					multiple
				/>
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
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		gap: 1rem;
	}
</style>
