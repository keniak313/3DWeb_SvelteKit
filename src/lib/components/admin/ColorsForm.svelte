<script>
	import { nanoid } from '$lib/utilities/helpers';
	import { getContext } from 'svelte';
	import Input from '../Input.svelte';
	import { enhance } from '$app/forms';
	import { getAppConfig } from '$lib/state/config.svelte';

	const config = getAppConfig();

	const colors = $derived(config.data.colors);

	let formEl;
	let timeout;
	let isInitial = true;

	$effect(() => {
		const rawData = $state.snapshot(colors);
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

<form
	method="POST"
	action="?/saveColors"
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
				name: `new-color-${colors.length + 1}`,
				createdAt: new Date().toISOString(),
				deletedAt: null
			})}>Add Color</button
	>
</form>

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
