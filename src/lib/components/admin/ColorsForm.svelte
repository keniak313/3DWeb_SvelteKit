<script>
	import { enhance } from '$app/forms';
	import { nanoid } from '$lib/utilities/helpers';
	import Input from '../Input.svelte';

	let { colors = $bindable() } = $props();
</script>

<div>
	<h2>Colors</h2>
	<hr />
	<form
		method="POST"
		action="?/updateColors"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
			};
		}}
	>
		<div class="colors">
			{#each colors as color (color.id)}
				<Input id="id" value={color.id} hidden style="display: none;" />
				<Input id={'color-' + color.id} bind:value={color.color} type="color" />
				<Input id={'displayName-' + color.id} bind:value={color.displayName} type="text" />
				<Input id={'name-' + color.id} bind:value={color.name} type="text" />
			{/each}
		</div>

		<button
			type="button"
			onclick={() =>
				colors.push({
					id: nanoid(5),
					color: '',
					displayName: '',
					name: '',
					createdAt: new Date().toISOString()
				})}>Add Color</button
		>
		<button type="submit">Save Colors</button>
	</form>
</div>

<style>
	.colors {
		display: grid;
		grid-template-columns: 50px 1fr 1fr;
		gap: 0.5rem;
	}
</style>
