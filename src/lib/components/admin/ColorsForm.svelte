<script>
	import { enhance } from '$app/forms';
	import { nanoid } from '$lib/utilities/helpers';
	import Input from '../Input.svelte';

	let { colors } = $props();
</script>

<div class="wrapper">
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
				<div class="color">
					<Input id="id" value={color.id} hidden style="display: none;" />
					<Input
						id={'color-' + color.id}
						bind:value={color.color}
						type="color"
						style="width: 50px !important;"
					/>
					<div class="color-info">
						<Input
							id={'displayName-' + color.id}
							title="Display Name"
							bind:value={color.displayName}
							type="text"
						/>
						<Input id={'name-' + color.id} title="Name" bind:value={color.name} type="text" />
					</div>
				</div>
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
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.color {
		display: flex;
		gap: 0.5rem;
		width: 100%;
		padding-bottom: 1rem;
	}

	.color-info {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
