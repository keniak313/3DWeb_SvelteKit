<script lang="ts">
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import Input from './Input.svelte';

	const config = getContext('config');

	let selected = $derived(config.selectedAsset);

	const models = config.modelsHydrated;

	let user = false;
</script>

<div class="info">
	<div class="top">WORK IN PROGRESS</div>
	<div class="left">
		{#each Object.values(models) as model (model.id)}
			<button onclick={() => config.setSelected({ modelName: model.name })}>{model.name}</button>
		{/each}
	</div>
	{#if selected?.part}
		<div class="bot">
			{#if user}
				<form
					class="material-editor"
					method="POST"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: false });
						};
					}}
				>
					<div style="display: none !important">
						<Input id="colorId" value={selected.part.color.id} hidden />
						<Input id="materialId" value={selected.part.material.id} hidden />
					</div>
					<Input title="Color" id="color" type="color" bind:value={selected.part.color.color} />
					<Input
						id="roughness"
						style="width: 50px"
						title="Roughness"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={selected.part.material.roughness}
					/>
					<Input
						id="metalness"
						style="width: 50px"
						title="Metalness"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={selected.part.material.metalness}
					/>
					<Input
						id="opacity"
						style="width: 50px"
						title="Opacity"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={selected.part.material.opacity}
					/>
					<Input
						id="transparent"
						title="Transparent"
						type="checkbox"
						bind:checked={selected.part.material.transparent}
					/>
					<button type="submit">SAVE</button>
				</form>
			{/if}
			<div class="title">
				<p>{selected?.model.displayName} - {selected?.part.displayName}</p>
				<p>{selected?.part.description}</p>
			</div>
			<div class="options">
				{#each selected.part.materials as material (material.id)}
					<div>
						<button
							class={selected.part.material.id === material.id && 'selected'}
							onclick={(e) => {
								// setProductMaterial({ part: selected.part, material });
								config.setAssetMaterial({ materialId: material.id });
							}}
							>{material.name}
						</button>
					</div>
					{#if selected.part.material.id === material.id}
						{#each selected.part.material.colors as color (color.id)}
							<button
								class={'color ' + (selected.part.color.id === color.id && 'selected')}
								style="background-color: {color.color}"
								onclick={() => {
									// setProductMaterialColor(color);
									config.setAssetColor({ colorId: color.id });
								}}>X</button
							>
						{/each}
					{/if}
				{/each}
				<button onclick={() => config.clearPart()}>CLOSE</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.info {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 200;
	}

	.top {
		position: absolute;
		top: 0;
		padding: 1rem;
	}

	.left {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		pointer-events: all;
		padding: 2rem;
	}

	.bot {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		place-self: end;
		pointer-events: all;
		padding: 2rem;
	}

	.title {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: 0.2rem;
	}

	.options {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.color {
		width: 20px;
		height: 20px;
	}

	.selected {
		outline: 2px solid green;
	}

	.material-editor {
		display: flex;
		gap: 1rem;
		background-color: white;
		padding: 0.2rem;
		flex-wrap: wrap;
		width: 100%;
	}
</style>
