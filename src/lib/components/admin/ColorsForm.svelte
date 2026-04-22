<script>
	import { nanoid } from '$lib/utilities/helpers';
	import { getContext } from 'svelte';
	import Input from '../Input.svelte';

	const config = getContext('config');

	const colors = $derived(config.colors);
</script>

{#snippet renderColor(color)}
	<div class="color">
		<Input id="color-id" value={color.id} hidden style="display: none;" />
		<Input
			id={'color-color-' + color.id}
			bind:value={color.color}
			type="color"
			style="width: 50px !important;"
		/>
		<div class="color-info">
			<Input
				id={'color-displayName-' + color.id}
				title="Display Name"
				bind:value={color.displayName}
				type="text"
			/>
			<Input id={'color-name-' + color.id} title="Name" bind:value={color.name} type="text" />
			<Input
				id={'color-deletedAt-' + color.id}
				title="Deleted At"
				bind:value={color.deletedAt}
				hidden
				style="display: none;"
			/>
			<button
				type="button"
				onclick={() => {
					if (!color.deletedAt) {
						color.deletedAt = new Date().toDateString();
					} else {
						color.deletedAt = null;
					}
				}}
			>
				{#if color.deletedAt}
					Restore
				{:else}
					Remove
				{/if}
			</button>
		</div>
	</div>
{/snippet}

<div class="wrapper">
	<h2>Colors</h2>
	<hr />
	<div class="colors">
		{#each colors as color (color.id)}
			{#if color.id !== '0' && color.deletedAt === null}
				{@render renderColor(color)}
			{/if}
		{/each}
		{#if colors.some((color) => color.deletedAt !== null)}
			<h2>ARCHIVED</h2>
			{#each colors as color (color.id)}
				{#if color.id !== '0' && color.deletedAt !== null}
					{@render renderColor(color)}
				{/if}
			{/each}
		{/if}
	</div>

	<button
		type="button"
		onclick={() =>
			colors.push({
				id: nanoid(5),
				color: '#ffffff',
				displayName: '',
				name: 'new-color',
				createdAt: new Date().toISOString(),
				deletedAt: null
			})}>Add Color</button
	>
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
