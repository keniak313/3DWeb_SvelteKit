<script lang="ts">
	import {
		getSelected,
		removeSelected,
		setProductMaterial,
		setProductMaterialColor
	} from './Product.svelte';

	let selected = $derived(getSelected());
</script>

<div class="info">
	{#if selected}
		<div class="bot">
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
								setProductMaterial({ part: selected.part, material });
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
									setProductMaterialColor(color);
								}}>X</button
							>
						{/each}
					{/if}
				{/each}
				<button onclick={removeSelected}>CLOSE</button>
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
	}

	.color {
		width: 20px;
		height: 20px;
	}

	.selected {
		outline: 2px solid green;
	}
</style>
